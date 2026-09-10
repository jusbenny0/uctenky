"use client";

import React from "react";
import { Check, Camera, Users, Split, Calculator } from "lucide-react";
import { cn } from "@/lib/utils";

export type Step = "upload" | "people" | "assign" | "overview";

interface StepIndicatorProps {
  currentStep: Step;
  onStepClick: (step: Step) => void;
  hasReceipt: boolean;
  hasPeople: boolean;
}

const steps: { id: Step; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: "upload", label: "Účtenka", icon: Camera },
  { id: "people", label: "Lidé", icon: Users },
  { id: "assign", label: "Položky", icon: Split },
  { id: "overview", label: "Součet", icon: Calculator },
];

export const StepIndicator: React.FC<StepIndicatorProps> = ({
  currentStep,
  onStepClick,
  hasReceipt,
  hasPeople,
}) => {
  const getStepIndex = (step: Step) => steps.findIndex((s) => s.id === step);
  const currentIndex = getStepIndex(currentStep);

  const canNavigateTo = (stepIndex: number) => {
    if (stepIndex === 0) return true;
    if (stepIndex === 1) return hasReceipt;
    if (stepIndex === 2) return hasReceipt && hasPeople;
    if (stepIndex === 3) return hasReceipt && hasPeople;
    return false;
  };

  return (
    <div className="w-full">
      <nav aria-label="Progress">
        <ol className="grid grid-cols-4 gap-1 sm:gap-2">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isCurrent = step.id === currentStep;
            const isCompleted = currentIndex > index;
            const isClickable = canNavigateTo(index);

            return (
              <li key={step.id} className="flex">
                <button
                  type="button"
                  onClick={() => isClickable && onStepClick(step.id)}
                  disabled={!isClickable}
                  className={cn(
                    "w-full py-2 px-1 rounded-2xl flex flex-col items-center justify-center transition-all touch-manipulation",
                    isCurrent && "bg-blue-600 text-white shadow-md shadow-blue-500/20 font-bold",
                    isCompleted && !isCurrent && "bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 font-semibold",
                    !isCurrent && !isCompleted && "bg-white/60 dark:bg-zinc-900/60 text-gray-400 dark:text-zinc-600 opacity-60",
                    !isClickable && "cursor-not-allowed"
                  )}
                >
                  <div className="flex items-center gap-1">
                    {isCompleted ? (
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    ) : (
                      <Icon className="w-3.5 h-3.5" />
                    )}
                    <span className="text-[11px] leading-none">
                      {step.label}
                    </span>
                  </div>
                </button>
              </li>
            );
          })}
        </ol>
      </nav>
    </div>
  );
};
