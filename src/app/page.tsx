"use client";

import React, { useState } from "react";
import { ReceiptData, ReceiptItem, Person } from "@/types/receipt";
import { StepIndicator, Step } from "@/components/StepIndicator";
import { ReceiptUploader } from "@/components/ReceiptUploader";
import { PeopleManager } from "@/components/PeopleManager";
import { ItemAssigner } from "@/components/ItemAssigner";
import { BillOverview } from "@/components/BillOverview";
import { getPersonColor, formatCurrency } from "@/lib/utils";
import { Receipt, Sparkles, Eye, X } from "lucide-react";

export default function Home() {
  const [currentStep, setCurrentStep] = useState<Step>("upload");
  const [receiptData, setReceiptData] = useState<ReceiptData | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [showImageModal, setShowImageModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Initialize default 2 people: Člověk 1, Člověk 2
  const [people, setPeople] = useState<Person[]>([
    {
      id: "person-1",
      name: "Člověk 1",
      color: getPersonColor(0).bg,
    },
    {
      id: "person-2",
      name: "Člověk 2",
      color: getPersonColor(1).bg,
    },
  ]);

  const handleAnalysisComplete = (data: ReceiptData, previewUrl?: string) => {
    setReceiptData(data);
    if (previewUrl) {
      setImagePreviewUrl(previewUrl);
    }
    setCurrentStep("people");
  };

  const handleUpdatePeople = (updatedPeople: Person[]) => {
    setPeople(updatedPeople);
    if (receiptData) {
      const validIds = new Set(updatedPeople.map((p) => p.id));
      const cleanedItems = receiptData.items.map((item) => ({
        ...item,
        assignedTo: item.assignedTo.filter((id) => validIds.has(id)),
      }));
      setReceiptData({ ...receiptData, items: cleanedItems });
    }
  };

  const handleUpdateItems = (updatedItems: ReceiptItem[]) => {
    if (receiptData) {
      setReceiptData({ ...receiptData, items: updatedItems });
    }
  };

  const handleReset = () => {
    if (window.confirm("Začít nový nákup? Rozdělení bude vymazáno.")) {
      setReceiptData(null);
      setImagePreviewUrl(null);
      setCurrentStep("upload");
      setPeople([
        {
          id: "person-1",
          name: "Člověk 1",
          color: getPersonColor(0).bg,
        },
        {
          id: "person-2",
          name: "Člověk 2",
          color: getPersonColor(1).bg,
        },
      ]);
    }
  };

  return (
    <main className="min-h-screen w-full flex flex-col justify-between max-w-md mx-auto px-3 py-3 sm:py-6">
      <div className="w-full space-y-3">
        {/* Mobile Header Bar */}
        <header className="flex items-center justify-between gap-2 px-1 pt-1 pb-1">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 text-white flex items-center justify-center shadow-md shadow-blue-500/20 flex-shrink-0">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="text-base font-black tracking-tight text-gray-900 dark:text-zinc-50 leading-tight">
                  Účtenky
                </h1>
                <span className="inline-flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">
                  <Sparkles className="w-2.5 h-2.5" />
                  AI
                </span>
              </div>
              <p className="text-[11px] text-gray-400 dark:text-zinc-500 leading-none">
                Mobilní rozpočítání nákupů
              </p>
            </div>
          </div>

          {/* Quick receipt badge / preview */}
          {receiptData && (
            <div className="flex items-center gap-1.5">
              {imagePreviewUrl && (
                <button
                  type="button"
                  onClick={() => setShowImageModal(true)}
                  className="p-2 rounded-xl bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-gray-700 dark:text-zinc-300 shadow-sm active:scale-95 touch-manipulation"
                  title="Zobrazit fotku"
                >
                  <Eye className="w-4 h-4" />
                </button>
              )}

              <div className="px-2.5 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/40 text-[11px]">
                <span className="font-bold text-blue-700 dark:text-blue-300">
                  {formatCurrency(receiptData.total, receiptData.currency)}
                </span>
              </div>
            </div>
          )}
        </header>

        {/* Step Navigation */}
        <StepIndicator
          currentStep={currentStep}
          onStepClick={setCurrentStep}
          hasReceipt={!!receiptData}
          hasPeople={people.length > 0}
        />

        {/* Main Content Area */}
        <div className="pt-1">
          {currentStep === "upload" && (
            <ReceiptUploader
              onAnalysisComplete={handleAnalysisComplete}
              isLoading={isLoading}
              setIsLoading={setIsLoading}
            />
          )}

          {currentStep === "people" && receiptData && (
            <PeopleManager
              people={people}
              onUpdatePeople={handleUpdatePeople}
              onContinue={() => setCurrentStep("assign")}
            />
          )}

          {currentStep === "assign" && receiptData && (
            <ItemAssigner
              items={receiptData.items}
              people={people}
              currency={receiptData.currency}
              receiptTotal={receiptData.total}
              onUpdateItems={handleUpdateItems}
              onContinue={() => setCurrentStep("overview")}
            />
          )}

          {currentStep === "overview" && receiptData && (
            <BillOverview
              receiptData={receiptData}
              people={people}
              onBackToAssign={() => setCurrentStep("assign")}
              onReset={handleReset}
            />
          )}
        </div>
      </div>

      {/* Image Modal for mobile photo inspection */}
      {showImageModal && imagePreviewUrl && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-3"
          onClick={() => setShowImageModal(false)}
        >
          <div
            className="relative bg-zinc-900 rounded-3xl p-3 max-w-sm w-full max-h-[90vh] overflow-hidden shadow-2xl flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-2 px-1 text-white">
              <span className="text-xs font-bold">Vyfocená účtenka</span>
              <button
                type="button"
                onClick={() => setShowImageModal(false)}
                className="p-1 rounded-full text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imagePreviewUrl}
              alt="Náhled účtenky"
              className="rounded-2xl max-h-[78vh] object-contain mx-auto"
            />
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="text-center py-4 text-[11px] text-gray-400 dark:text-zinc-600">
        Mobilní Rozdělovač Účtenek • Gemini AI
      </footer>
    </main>
  );
}
