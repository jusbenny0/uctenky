import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const PERSON_COLORS = [
  {
    bg: "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-950 dark:text-blue-200 dark:border-blue-800",
    badge: "bg-blue-500 text-white",
    ring: "ring-blue-500",
    activeBtn: "bg-blue-600 text-white shadow-blue-500/20",
    lightBg: "bg-blue-50/50 dark:bg-blue-950/30",
  },
  {
    bg: "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-200 dark:border-emerald-800",
    badge: "bg-emerald-500 text-white",
    ring: "ring-emerald-500",
    activeBtn: "bg-emerald-600 text-white shadow-emerald-500/20",
    lightBg: "bg-emerald-50/50 dark:bg-emerald-950/30",
  },
  {
    bg: "bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-950 dark:text-purple-200 dark:border-purple-800",
    badge: "bg-purple-500 text-white",
    ring: "ring-purple-500",
    activeBtn: "bg-purple-600 text-white shadow-purple-500/20",
    lightBg: "bg-purple-50/50 dark:bg-purple-950/30",
  },
  {
    bg: "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-950 dark:text-amber-200 dark:border-amber-800",
    badge: "bg-amber-500 text-white",
    ring: "ring-amber-500",
    activeBtn: "bg-amber-600 text-white shadow-amber-500/20",
    lightBg: "bg-amber-50/50 dark:bg-amber-950/30",
  },
  {
    bg: "bg-rose-100 text-rose-800 border-rose-200 dark:bg-rose-950 dark:text-rose-200 dark:border-rose-800",
    badge: "bg-rose-500 text-white",
    ring: "ring-rose-500",
    activeBtn: "bg-rose-600 text-white shadow-rose-500/20",
    lightBg: "bg-rose-50/50 dark:bg-rose-950/30",
  },
  {
    bg: "bg-cyan-100 text-cyan-800 border-cyan-200 dark:bg-cyan-950 dark:text-cyan-200 dark:border-cyan-800",
    badge: "bg-cyan-500 text-white",
    ring: "ring-cyan-500",
    activeBtn: "bg-cyan-600 text-white shadow-cyan-500/20",
    lightBg: "bg-cyan-50/50 dark:bg-cyan-950/30",
  },
  {
    bg: "bg-indigo-100 text-indigo-800 border-indigo-200 dark:bg-indigo-950 dark:text-indigo-200 dark:border-indigo-800",
    badge: "bg-indigo-500 text-white",
    ring: "ring-indigo-500",
    activeBtn: "bg-indigo-600 text-white shadow-indigo-500/20",
    lightBg: "bg-indigo-50/50 dark:bg-indigo-950/30",
  },
  {
    bg: "bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-950 dark:text-orange-200 dark:border-orange-800",
    badge: "bg-orange-500 text-white",
    ring: "ring-orange-500",
    activeBtn: "bg-orange-600 text-white shadow-orange-500/20",
    lightBg: "bg-orange-50/50 dark:bg-orange-950/30",
  },
];

export function getPersonColor(index: number) {
  return PERSON_COLORS[index % PERSON_COLORS.length];
}

export function formatCurrency(amount: number, currency: string = "Kč"): string {
  const rounded = Math.round(amount * 100) / 100;
  return `${rounded.toLocaleString("cs-CZ", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${currency}`;
}
