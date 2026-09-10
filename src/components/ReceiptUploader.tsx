"use client";

import React, { useState, useRef } from "react";
import {
  Camera,
  Image as ImageIcon,
  Loader2,
  AlertCircle,
  Sparkles,
  Zap,
  ArrowRight,
  HelpCircle,
} from "lucide-react";
import { ReceiptData } from "@/types/receipt";

interface ReceiptUploaderProps {
  onAnalysisComplete: (data: ReceiptData, imagePreviewUrl?: string) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

export const ReceiptUploader: React.FC<ReceiptUploaderProps> = ({
  onAnalysisComplete,
  isLoading,
  setIsLoading,
}) => {
  const [error, setError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string>("");

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const processFile = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      setError("Vyberte prosím platný obrázek účtenky (JPEG, PNG, HEIC).");
      return;
    }

    setError(null);
    setIsLoading(true);
    setStatusMessage("Připravuji fotku účtenky...");

    const localPreview = URL.createObjectURL(file);

    try {
      setStatusMessage("Gemini AI čte účtenku...");
      const formData = new FormData();
      formData.append("receipt", file);

      const response = await fetch("/api/analyze-receipt", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || "Nepodařilo se zanalyzovat účtenku.");
      }

      setStatusMessage("Položky úspěšně načteny!");
      onAnalysisComplete(result.data, localPreview);
    } catch (err: unknown) {
      console.error(err);
      setError(
        err instanceof Error
          ? err.message
          : "Došlo k chybě při komunikaci s Gemini AI."
      );
    } finally {
      setIsLoading(false);
      setStatusMessage("");
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const loadDemoReceipt = () => {
    setError(null);
    setIsLoading(true);
    setStatusMessage("Načítám vzorový nákup...");

    setTimeout(() => {
      const demoData: ReceiptData = {
        storeName: "Restaurace & Pizzerie Na Růžku",
        date: new Date().toISOString().split("T")[0],
        currency: "Kč",
        total: 1084.0,
        items: [
          {
            id: "demo-1",
            name: "Pizza Quattro Formaggi",
            price: 245.0,
            quantity: 1,
            assignedTo: [],
          },
          {
            id: "demo-2",
            name: "Pizza Prosciutto e Funghi",
            price: 235.0,
            quantity: 1,
            assignedTo: [],
          },
          {
            id: "demo-3",
            name: "Domácí hovězí burger s hranolky",
            price: 279.0,
            quantity: 1,
            assignedTo: [],
          },
          {
            id: "demo-4",
            name: "Pilsner Urquell 0.5l (3x)",
            price: 180.0,
            quantity: 3,
            assignedTo: [],
          },
          {
            id: "demo-5",
            name: "Domácí limonáda malinová 0.5l",
            price: 85.0,
            quantity: 1,
            assignedTo: [],
          },
          {
            id: "demo-6",
            name: "Espresso Lungo",
            price: 60.0,
            quantity: 1,
            assignedTo: [],
          },
        ],
      };
      setIsLoading(false);
      onAnalysisComplete(demoData);
    }, 500);
  };

  return (
    <div className="w-full space-y-4">
      {/* Hidden camera & file inputs */}
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleInputChange}
        disabled={isLoading}
      />
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleInputChange}
        disabled={isLoading}
      />

      {/* Mobile Card */}
      <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 border border-gray-200/80 dark:border-zinc-800 shadow-sm text-center">
        {isLoading ? (
          <div className="py-10 flex flex-col items-center justify-center space-y-4">
            <div className="relative">
              <div className="w-20 h-20 rounded-3xl bg-blue-600 text-white flex items-center justify-center shadow-xl shadow-blue-500/30 animate-pulse">
                <Camera className="w-10 h-10" />
              </div>
              <div className="absolute -inset-1 rounded-3xl border-2 border-blue-400 animate-ping opacity-30" />
            </div>

            <div className="space-y-1">
              <p className="text-lg font-bold text-gray-900 dark:text-zinc-100">
                Analyzuji účtenku
              </p>
              <p className="text-xs text-gray-500 dark:text-zinc-400">
                {statusMessage || "Gemini AI čte položky a ceny..."}
              </p>
            </div>

            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 text-xs font-semibold">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>gemini-2.5-flash (Free Tier)</span>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="space-y-2">
              <div className="w-16 h-16 mx-auto rounded-3xl bg-blue-50 dark:bg-blue-950/50 border border-blue-100 dark:border-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center shadow-inner">
                <Camera className="w-8 h-8" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-zinc-100">
                Přidat účtenku
              </h2>
              <p className="text-xs text-gray-500 dark:text-zinc-400 max-w-xs mx-auto">
                Vyfoťte účtenku mobilem a AI z ní ihned vytáhne všechny položky a ceny.
              </p>
            </div>

            {/* Main Primary Mobile Action: Big Camera Button */}
            <div className="space-y-3">
              <button
                type="button"
                onClick={() => cameraInputRef.current?.click()}
                className="w-full flex items-center justify-center gap-3 py-4 px-6 rounded-2xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-base shadow-lg shadow-blue-500/25 active:scale-[0.98] transition-all touch-manipulation"
              >
                <Camera className="w-6 h-6" />
                <span>Vyfotit účtenku fotoaparátem</span>
              </button>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-2xl bg-gray-50 dark:bg-zinc-800 hover:bg-gray-100 dark:hover:bg-zinc-700 text-gray-700 dark:text-zinc-200 border border-gray-200 dark:border-zinc-700 font-semibold text-sm active:scale-[0.98] transition-all touch-manipulation"
              >
                <ImageIcon className="w-4 h-4 text-gray-500 dark:text-zinc-400" />
                <span>Vybrat fotku z galerie / souborů</span>
              </button>
            </div>

            {/* Quick Demo */}
            <div className="pt-2 border-t border-gray-100 dark:border-zinc-800">
              <button
                type="button"
                onClick={loadDemoReceipt}
                className="inline-flex items-center gap-2 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 py-2 px-3 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-colors"
              >
                <Zap className="w-3.5 h-3.5" />
                <span>Nemáte účtenku u sebe? Zkusit ukázkový nákup</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Mobile camera tips */}
      <div className="bg-blue-50/70 dark:bg-blue-950/30 rounded-2xl p-4 border border-blue-100 dark:border-blue-900/40 text-left flex items-start gap-3 text-xs text-blue-900 dark:text-blue-200">
        <Sparkles className="w-4 h-4 flex-shrink-0 text-blue-600 dark:text-blue-400 mt-0.5" />
        <div>
          <p className="font-semibold">Tip pro nejlepší výsledek:</p>
          <p className="text-blue-700/80 dark:text-blue-300/80 mt-0.5">
            Účtenku položte na rovný povrch s dobrým osvětlením, aby byl text a ceny dobře čitelné.
          </p>
        </div>
      </div>

      {/* Error notification */}
      {error && (
        <div className="flex items-start gap-3 p-4 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 text-red-700 dark:text-red-300 text-left animate-in fade-in">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <div className="flex-1 text-xs">
            <p className="font-bold">Nepodařilo se přečíst účtenku</p>
            <p className="mt-0.5 text-red-600 dark:text-red-400">{error}</p>
            <button
              type="button"
              onClick={() => setError(null)}
              className="mt-2 text-xs font-bold underline"
            >
              Zkusit znovu
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
