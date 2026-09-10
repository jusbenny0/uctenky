"use client";

import React, { useEffect, useState } from "react";
import confetti from "canvas-confetti";
import {
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Share2,
  ArrowLeft,
  Check,
  MessageCircle,
} from "lucide-react";
import { ReceiptData, ReceiptItem, Person, PersonSummary } from "@/types/receipt";
import { formatCurrency, getPersonColor } from "@/lib/utils";

interface BillOverviewProps {
  receiptData: ReceiptData;
  people: Person[];
  onBackToAssign: () => void;
  onReset: () => void;
}

export const BillOverview: React.FC<BillOverviewProps> = ({
  receiptData,
  people,
  onBackToAssign,
  onReset,
}) => {
  const [copied, setCopied] = useState(false);

  // Compute person summaries
  const summaries: PersonSummary[] = people.map((person) => {
    const personItems: { item: ReceiptItem; sharePrice: number; splitCount: number }[] = [];
    let personTotal = 0;

    receiptData.items.forEach((item) => {
      if (item.assignedTo.includes(person.id)) {
        const splitCount = item.assignedTo.length;
        const sharePrice = item.price / splitCount;
        personItems.push({
          item,
          sharePrice,
          splitCount,
        });
        personTotal += sharePrice;
      }
    });

    return {
      person,
      items: personItems,
      total: Math.round(personTotal * 100) / 100,
    };
  });

  const sumAssigned = summaries.reduce((acc, s) => acc + s.total, 0);
  const receiptTotal = receiptData.total;
  const difference = Math.round((receiptTotal - sumAssigned) * 100) / 100;
  const isMatch = Math.abs(difference) <= 0.05;

  useEffect(() => {
    if (isMatch) {
      try {
        confetti({
          particleCount: 70,
          spread: 60,
          origin: { y: 0.6 },
        });
      } catch (e) {
        // Safe fail
      }
    }
  }, [isMatch]);

  const generateShareText = () => {
    let text = `🧾 Rozpočítání nákupu: ${receiptData.storeName || "Účtenka"}\n`;
    if (receiptData.date) {
      text += `📅 Datum: ${receiptData.date}\n`;
    }
    text += `───────────────────\n\n`;

    summaries.forEach((s) => {
      text += `👤 ${s.person.name}: *${formatCurrency(s.total, receiptData.currency)}*\n`;
      s.items.forEach((it) => {
        const splitNote = it.splitCount > 1 ? ` (sdíleno ${it.splitCount}x)` : "";
        text += `   • ${it.item.name}: ${formatCurrency(it.sharePrice, receiptData.currency)}${splitNote}\n`;
      });
      text += `\n`;
    });

    text += `───────────────────\n`;
    text += `💰 Celkem rozděleno: ${formatCurrency(sumAssigned, receiptData.currency)}\n`;
    text += `🧾 Celkem na účtence: ${formatCurrency(receiptTotal, receiptData.currency)}\n`;
    if (!isMatch) {
      text += `⚠️ Rozdíl: ${formatCurrency(difference, receiptData.currency)}\n`;
    }

    return text;
  };

  const handleShare = async () => {
    const text = generateShareText();

    // Mobile Web Share API (native WhatsApp / Messages picker)
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: `Rozpočítání účtenky - ${receiptData.storeName || "Nákup"}`,
          text: text,
        });
        return;
      } catch (e) {
        // User cancelled or share failed, fallback to clipboard
      }
    }

    // Fallback: Copy to clipboard
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <div className="w-full space-y-4 pb-28">
      {/* Total Verification Card */}
      <div
        className={`p-4 sm:p-5 rounded-3xl border transition-all ${
          isMatch
            ? "bg-emerald-50/80 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800 shadow-sm"
            : "bg-amber-50/80 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800 shadow-sm"
        }`}
      >
        <div className="flex items-start gap-3">
          <div
            className={`w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 ${
              isMatch
                ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20"
                : "bg-amber-500 text-white shadow-md shadow-amber-500/20"
            }`}
          >
            {isMatch ? (
              <CheckCircle2 className="w-6 h-6" />
            ) : (
              <AlertTriangle className="w-6 h-6" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-base font-black text-gray-900 dark:text-zinc-100 leading-tight">
              {isMatch ? "Vše sedí na korunu přesně! 🎉" : "Pozor: částka nesedí"}
            </h2>
            <p className="text-xs text-gray-600 dark:text-zinc-400 mt-0.5">
              {isMatch
                ? "Součet položek přesně odpovídá celkové sumě na účtence."
                : difference > 0
                ? `Zbývá ještě přiřadit ${formatCurrency(difference, receiptData.currency)}.`
                : `Rozděleno je o ${formatCurrency(Math.abs(difference), receiptData.currency)} více než na účtence.`}
            </p>

            <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-gray-200/60 dark:border-zinc-800/60 text-xs">
              <span className="text-gray-500">Účtenka: <strong>{formatCurrency(receiptTotal, receiptData.currency)}</strong></span>
              <span className={isMatch ? "text-emerald-700 font-bold" : "text-amber-700 font-bold"}>
                Rozděleno: {formatCurrency(sumAssigned, receiptData.currency)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* People Overview Cards */}
      <div className="space-y-3">
        {summaries.map((summary, idx) => {
          const colorInfo = getPersonColor(idx);

          return (
            <div
              key={summary.person.id}
              className="bg-white dark:bg-zinc-900 rounded-2xl p-4 border border-gray-200/80 dark:border-zinc-800 shadow-sm space-y-3"
            >
              {/* Header */}
              <div className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-zinc-800">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs ${colorInfo.badge}`}
                  >
                    {idx + 1}
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-gray-900 dark:text-zinc-100">
                      {summary.person.name}
                    </h3>
                    <p className="text-[11px] text-gray-400">
                      {summary.items.length}{" "}
                      {summary.items.length === 1 ? "položka" : "položek"}
                    </p>
                  </div>
                </div>

                <span className="text-lg font-black text-gray-900 dark:text-zinc-100">
                  {formatCurrency(summary.total, receiptData.currency)}
                </span>
              </div>

              {/* Items List */}
              <div className="space-y-1.5">
                {summary.items.length === 0 ? (
                  <p className="text-xs text-gray-400 italic py-1">
                    Žádná přiřazená položka.
                  </p>
                ) : (
                  summary.items.map(({ item, sharePrice, splitCount }) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between text-xs py-0.5 text-gray-700 dark:text-zinc-300"
                    >
                      <div className="flex items-center gap-1.5 truncate pr-2">
                        <span className="truncate">{item.name}</span>
                        {splitCount > 1 && (
                          <span className="text-[9px] px-1 py-0.2 rounded bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 font-bold flex-shrink-0">
                            1/{splitCount}
                          </span>
                        )}
                      </div>
                      <span className="font-semibold text-gray-900 dark:text-zinc-100 flex-shrink-0">
                        {formatCurrency(sharePrice, receiptData.currency)}
                      </span>
                    </div>
                  ))
                )}
              </div>

              {/* Progress bar */}
              <div className="pt-1">
                <div className="w-full h-1.5 bg-gray-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${colorInfo.badge} rounded-full transition-all duration-500`}
                    style={{
                      width: `${
                        receiptTotal > 0
                          ? Math.min(100, Math.round((summary.total / receiptTotal) * 100))
                          : 0
                      }%`,
                    }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Sticky Mobile Share Bar */}
      <div className="fixed bottom-0 left-0 right-0 p-3 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border-t border-gray-200 dark:border-zinc-800 z-40 shadow-lg">
        <div className="max-w-md mx-auto flex items-center gap-2">
          <button
            type="button"
            onClick={onBackToAssign}
            className="p-3.5 rounded-2xl bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-zinc-300 active:bg-gray-200 touch-manipulation"
            title="Upravit položky"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <button
            type="button"
            onClick={handleShare}
            className="flex-1 flex items-center justify-center gap-2 py-4 px-4 rounded-2xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-sm sm:text-base shadow-lg shadow-blue-500/25 active:scale-[0.98] transition-all touch-manipulation"
          >
            {copied ? (
              <>
                <Check className="w-5 h-5" />
                <span>Zkopírováno do schránky!</span>
              </>
            ) : (
              <>
                <Share2 className="w-5 h-5" />
                <span>Sdílet (WhatsApp / SMS)</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={onReset}
            className="p-3.5 rounded-2xl bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-zinc-300 active:bg-gray-200 touch-manipulation"
            title="Nový nákup"
          >
            <RotateCcw className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};
