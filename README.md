# 🧾 Rozdělovač Účtenek (Receipt Splitter s Gemini AI)

Moderní **Mobile-First** webová aplikace pro snadné vyfocení a rozpočítání nákupů či restauračních účtenek mezi přátele pomocí umělé inteligence Google Gemini Vision.

---

## 📱 Funkce

- 📸 **Mobile-First & Fotoaparát**: Tlačítko pro okamžité vyfocení účtenky telefonem na jeden klik (`capture="environment"`), případně nahrání z galerie.
- 🤖 **AI Analýza účtenky**: Google Gemini Vision (`gemini-2.5-flash`) přečte položky, množství, ceny i celkovou částku a převede je do strukturovaného formátu.
- 👥 **Flexibilní lidé**: Volba počtu nakupujících s okamžitou možností přejmenování každé osoby (např. *Petr*, *Jana*, *Martin*).
- 🍕 **Sdílení položek**: Položku lze přiřadit jednomu nebo rozdělit rovným dílem mezi více lidí (např. společná pizza nebo lahev vína).
- ⚖️ **Automatická kontrola součtu**: Aplikace porovná celkový součet přiřazených položek s částkou na účtence. Pokud vše sedí na korunu přesně, vystřelí konfety 🎉. Pokud ne, ukáže přesný rozdíl.
- 💬 **Nativní sdílení (WhatsApp / SMS)**: Jedním klepnutím otevře nativní sdílecí nabídku na mobilu s přehledně naformátovaným vyúčtováním pro celou partu.

---

## 🚀 Jak aplikaci zprovoznit

### 1. Klonování a instalace závislostí

```bash
git clone https://github.com/jusbenny0/uctenky.git
cd uctenky
npm install
```

### 2. Nastavení Gemini API klíče v `.env.local` ⚠️ (POVINNÉ)

Aplikace vyžaduje API klíč k Google Gemini (v rámci **Free Tieru je zcela zdarma** – až 15 dotazů za minutu).
Svůj bezplatný klíč získáte na [Google AI Studio](https://aistudio.google.com/app/apikey).

V kořenové složce projektu vytvořte soubor **`.env.local`** (můžete zkopírovat vzor z `.env.example`):

```env
GEMINI_API_KEY=SEM_VLOZTE_VAS_GEMINI_API_KLIC
GEMINI_MODEL=gemini-2.5-flash
```

> **Důležité:** Soubor `.env.local` je v `.gitignore` a nikdy se nenahrává do repozitáře, takže váš API klíč zůstane v bezpečí na vašem počítači/serveru.

### 3. Spuštění lokálního vývojového serveru

```bash
npm run dev
```

Aplikace bude dostupná na:
- **PC:** [http://localhost:3000](http://localhost:3000)
- **Mobilní telefon (na stejné Wi-Fi síti):** `http://<IP-pocitace>:3000` (např. `http://192.168.1.XX:3000`)

---

## 🛠️ Použité technologie

- **Framework**: [Next.js 16 (App Router)](https://nextjs.org/) & [React 19](https://react.dev/)
- **Jazyk**: [TypeScript](https://www.typescriptlang.org/)
- **Stylování**: [Tailwind CSS v4](https://tailwindcss.com/)
- **AI & OCR**: [@google/generative-ai](https://www.npmjs.com/package/@google/generative-ai) (Google Gemini 2.5 Flash)
- **Ikony**: [Lucide React](https://lucide.dev/)
- **Efekty**: [Canvas Confetti](https://www.npmjs.com/package/canvas-confetti)
