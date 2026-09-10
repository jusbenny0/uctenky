import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { ReceiptData, ReceiptItem } from "@/types/receipt";

export const maxDuration = 60; // Allow enough time for vision inference

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        {
          success: false,
          error: "API klíč pro Gemini (GEMINI_API_KEY) není nakonfigurován v .env.local",
        },
        { status: 500 }
      );
    }

    let mimeType = "image/jpeg";
    let base64Data = "";

    const contentType = req.headers.get("content-type") || "";

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const file = formData.get("receipt") as File | null;

      if (!file) {
        return NextResponse.json(
          { success: false, error: "Nebyl nahrán žádný soubor s účtenkou." },
          { status: 400 }
        );
      }

      mimeType = file.type || "image/jpeg";
      const arrayBuffer = await file.arrayBuffer();
      base64Data = Buffer.from(arrayBuffer).toString("base64");
    } else if (contentType.includes("application/json")) {
      const body = await req.json();
      if (!body.image) {
        return NextResponse.json(
          { success: false, error: "Chybí data obrázku (base64)." },
          { status: 400 }
        );
      }
      base64Data = body.image.replace(/^data:image\/[a-z]+;base64,/, "");
      mimeType = body.mimeType || "image/jpeg";
    } else {
      return NextResponse.json(
        { success: false, error: "Nepodporovaný typ obsahu (použijte multipart/form-data nebo JSON)." },
        { status: 400 }
      );
    }

    const genAI = new GoogleGenerativeAI(apiKey);

    // List of models to try in order (cheapest / free tier first)
    const preferredModel = process.env.GEMINI_MODEL || "gemini-2.5-flash";
    const modelsToTry = [
      preferredModel,
      "gemini-2.5-flash",
      "gemini-3.6-flash",
      "gemini-1.5-flash",
    ].filter((v, i, a) => a.indexOf(v) === i); // unique

    const prompt = `Jsi precizní OCR asistent pro čtení účtenek. 
Analyzuj přiložený obrázek účtenky a extrahuj z ní data do přesného formátu JSON.
Pokud jsou názvy položek zkrácené, zkus je lehce zpřehlednit (např. "ROHLIK STD" -> "Rohlík standard"), ale zachovej původní význam.
Pravidla:
1. "items": pole jednotlivých položek z účtenky.
   - "name": název položky (string)
   - "price": konečná cena za danou položku (number, např. 25.50 nebo 149.00). Pokud byla u položky uplatněna sleva, uveď konečnou cenu po slevě.
   - "quantity": počet kusů (number, výchozí 1).
2. "total": celková částka k úhradě z účtenky (number, např. 450.00). Musí to být přesně ta suma, která byla zaplacena.
3. "currency": měna (string, např. "Kč", "EUR", "$", výchozí "Kč").
4. "storeName": název obchodu či restaurace (string nebo null, např. "Lidl", "Albert", "Kaufland").
5. "date": datum nákupu (string ve formátu YYYY-MM-DD nebo jak je uvedeno na účtence, případně null).

Vrať VÝHRADNĚ platný JSON v této struktuře:
{
  "storeName": "string nebo null",
  "date": "string nebo null",
  "currency": "Kč",
  "total": 0.0,
  "items": [
    {
      "name": "Název položky",
      "price": 10.0,
      "quantity": 1
    }
  ]
}`;

    let parsedResult: ReceiptData | null = null;
    let lastError: Error | unknown = null;

    for (const modelName of modelsToTry) {
      try {
        const model = genAI.getGenerativeModel({
          model: modelName,
          generationConfig: {
            responseMimeType: "application/json",
            temperature: 0.1,
          },
        });

        const imagePart = {
          inlineData: {
            data: base64Data,
            mimeType: mimeType,
          },
        };

        const result = await model.generateContent([prompt, imagePart]);
        const responseText = result.response.text();

        if (responseText) {
          // Parse JSON, handle potential markdown wrappers
          let cleaned = responseText.trim();
          if (cleaned.startsWith("```json")) {
            cleaned = cleaned.replace(/^```json\s*/i, "").replace(/\s*```$/, "");
          } else if (cleaned.startsWith("```")) {
            cleaned = cleaned.replace(/^```\s*/i, "").replace(/\s*```$/, "");
          }

          const data = JSON.parse(cleaned);
          
          // Validate and sanitize data
          const items: ReceiptItem[] = Array.isArray(data.items)
            ? data.items.map((it: { name?: string; price?: number; quantity?: number }, idx: number) => ({
                id: `item-${Date.now()}-${idx}-${Math.random().toString(36).substring(2, 6)}`,
                name: String(it.name || `Položka ${idx + 1}`),
                price: typeof it.price === "number" ? Math.round(it.price * 100) / 100 : parseFloat(String(it.price || 0)) || 0,
                quantity: typeof it.quantity === "number" ? it.quantity : 1,
                assignedTo: [],
              }))
            : [];

          const total = typeof data.total === "number"
            ? Math.round(data.total * 100) / 100
            : parseFloat(String(data.total || 0)) || items.reduce((acc, it) => acc + it.price, 0);

          parsedResult = {
            storeName: data.storeName || "Neznámý obchod",
            date: data.date || undefined,
            currency: data.currency || "Kč",
            total: total,
            items: items,
          };

          break; // Success with this model!
        }
      } catch (err) {
        lastError = err;
        console.warn(`Model ${modelName} selhal:`, err);
        // Continue to next model in loop
      }
    }

    if (!parsedResult) {
      throw lastError || new Error("Nepodařilo se získat odpověď z žádného Gemini modelu.");
    }

    return NextResponse.json({
      success: true,
      data: parsedResult,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Neznámá chyba při zpracování účtenky";
    console.error("Chyba při analýze účtenky:", error);
    return NextResponse.json(
      {
        success: false,
        error: `Chyba při analýze: ${message}`,
      },
      { status: 500 }
    );
  }
}
