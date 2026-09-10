"use client";

import React, { useState } from "react";
import {
  Check,
  CheckCheck,
  AlertCircle,
  ArrowRight,
  Plus,
  Trash2,
  Edit2,
  Users,
} from "lucide-react";
import { ReceiptItem, Person } from "@/types/receipt";
import { formatCurrency, getPersonColor } from "@/lib/utils";

interface ItemAssignerProps {
  items: ReceiptItem[];
  people: Person[];
  currency: string;
  receiptTotal: number;
  onUpdateItems: (items: ReceiptItem[]) => void;
  onContinue: () => void;
}

export const ItemAssigner: React.FC<ItemAssignerProps> = ({
  items,
  people,
  currency,
  receiptTotal,
  onUpdateItems,
  onContinue,
}) => {
  const [filter, setFilter] = useState<"all" | "unassigned" | "assigned">("all");
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editPrice, setEditPrice] = useState("");

  const toggleAssignPerson = (itemId: string, personId: string) => {
    onUpdateItems(
      items.map((item) => {
        if (item.id !== itemId) return item;
        const exists = item.assignedTo.includes(personId);
        const newAssigned = exists
          ? item.assignedTo.filter((id) => id !== personId)
          : [...item.assignedTo, personId];
        return { ...item, assignedTo: newAssigned };
      })
    );
  };

  const assignToAll = (itemId: string) => {
    const allPersonIds = people.map((p) => p.id);
    onUpdateItems(
      items.map((item) =>
        item.id === itemId ? { ...item, assignedTo: allPersonIds } : item
      )
    );
  };

  const clearAssignment = (itemId: string) => {
    onUpdateItems(
      items.map((item) =>
        item.id === itemId ? { ...item, assignedTo: [] } : item
      )
    );
  };

  const handleAddNewItem = () => {
    const newItem: ReceiptItem = {
      id: `item-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      name: "Spropitné / Jiné",
      price: 50,
      quantity: 1,
      assignedTo: [],
    };
    onUpdateItems([...items, newItem]);
    startEditing(newItem);
  };

  const handleDeleteItem = (itemId: string) => {
    onUpdateItems(items.filter((it) => it.id !== itemId));
  };

  const startEditing = (item: ReceiptItem) => {
    setEditingItemId(item.id);
    setEditName(item.name);
    setEditPrice(item.price.toString());
  };

  const saveEditing = (itemId: string) => {
    const parsedPrice = parseFloat(editPrice) || 0;
    onUpdateItems(
      items.map((it) =>
        it.id === itemId
          ? { ...it, name: editName.trim() || it.name, price: parsedPrice }
          : it
      )
    );
    setEditingItemId(null);
  };

  const assignedCount = items.filter((it) => it.assignedTo.length > 0).length;
  const unassignedCount = items.length - assignedCount;

  // Compute currently assigned amount
  const assignedSum = items.reduce((acc, it) => {
    return it.assignedTo.length > 0 ? acc + it.price : acc;
  }, 0);

  const filteredItems = items.filter((item) => {
    if (filter === "unassigned") return item.assignedTo.length === 0;
    if (filter === "assigned") return item.assignedTo.length > 0;
    return true;
  });

  return (
    <div className="w-full space-y-3 pb-28">
      {/* Mobile Top Controls & Filter Bar */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl p-3.5 border border-gray-200/80 dark:border-zinc-800 shadow-sm space-y-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 overflow-x-auto py-0.5 no-scrollbar flex-1">
            <button
              type="button"
              onClick={() => setFilter("all")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap touch-manipulation ${
                filter === "all"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-zinc-400"
              }`}
            >
              Vše ({items.length})
            </button>
            <button
              type="button"
              onClick={() => setFilter("unassigned")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap touch-manipulation ${
                filter === "unassigned"
                  ? "bg-amber-500 text-white shadow-sm"
                  : "bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-zinc-400"
              }`}
            >
              Nerozdělené ({unassignedCount})
            </button>
            <button
              type="button"
              onClick={() => setFilter("assigned")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap touch-manipulation ${
                filter === "assigned"
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-zinc-400"
              }`}
            >
              Rozdělené ({assignedCount})
            </button>
          </div>

          <button
            type="button"
            onClick={handleAddNewItem}
            className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 rounded-xl border border-blue-200 dark:border-blue-900 flex-shrink-0 touch-manipulation"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Přidat</span>
          </button>
        </div>

        <p className="text-[11px] text-gray-400 dark:text-zinc-500 px-0.5">
          💡 Klepnutím na jméno přiřadíte položku. Pokud vyberete více lidí, částka se automaticky rozdělí.
        </p>
      </div>

      {/* Items List */}
      <div className="space-y-2.5">
        {filteredItems.length === 0 ? (
          <div className="text-center py-10 bg-white dark:bg-zinc-900 rounded-3xl border border-gray-200 dark:border-zinc-800 p-4">
            <p className="text-xs text-gray-400">Žádné položky v tomto filtru.</p>
          </div>
        ) : (
          filteredItems.map((item) => {
            const isAssigned = item.assignedTo.length > 0;
            const splitCount = item.assignedTo.length;
            const splitPrice = splitCount > 0 ? item.price / splitCount : item.price;
            const isEditing = editingItemId === item.id;

            return (
              <div
                key={item.id}
                className={`p-3.5 sm:p-4 rounded-2xl border transition-all ${
                  isAssigned
                    ? "bg-white dark:bg-zinc-900 border-gray-200/90 dark:border-zinc-800 shadow-sm"
                    : "bg-amber-50/50 dark:bg-amber-950/20 border-amber-200/90 dark:border-amber-900/40"
                }`}
              >
                {/* Header: Name + Price */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    {isEditing ? (
                      <div className="space-y-2 mb-2">
                        <input
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="w-full px-2.5 py-1.5 text-base rounded-xl border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-gray-900 dark:text-zinc-100 font-semibold"
                          placeholder="Název položky"
                        />
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            step="0.1"
                            value={editPrice}
                            onChange={(e) => setEditPrice(e.target.value)}
                            className="w-28 px-2.5 py-1.5 text-base rounded-xl border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-gray-900 dark:text-zinc-100 font-semibold"
                            placeholder="Cena"
                          />
                          <span className="text-xs text-gray-500 font-bold">{currency}</span>
                          <button
                            type="button"
                            onClick={() => saveEditing(item.id)}
                            className="ml-auto px-3 py-1.5 rounded-xl bg-blue-600 text-white text-xs font-bold"
                          >
                            Uložit
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-gray-900 dark:text-zinc-100 text-sm sm:text-base leading-tight">
                            {item.name}
                          </span>
                          {item.quantity > 1 && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-zinc-300 font-bold">
                              {item.quantity}x
                            </span>
                          )}
                        </div>

                        {splitCount > 1 && (
                          <p className="text-[11px] text-blue-600 dark:text-blue-400 font-bold mt-0.5">
                            Rozděleno ({splitCount}x): {formatCurrency(splitPrice, currency)} / os.
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Price & Edit actions */}
                  <div className="text-right flex flex-col items-end flex-shrink-0">
                    <span className="font-black text-gray-900 dark:text-zinc-100 text-base">
                      {formatCurrency(item.price, currency)}
                    </span>
                    {!isEditing && (
                      <div className="flex items-center gap-1 mt-0.5">
                        <button
                          type="button"
                          onClick={() => startEditing(item)}
                          className="text-gray-400 hover:text-blue-600 p-1 rounded-lg"
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteItem(item.id)}
                          className="text-gray-400 hover:text-red-500 p-1 rounded-lg"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* People selection chips (Thumb-optimized mobile tap targets) */}
                <div className="mt-2.5 pt-2.5 border-t border-gray-100 dark:border-zinc-800/80">
                  <div className="flex flex-wrap gap-1.5 items-center">
                    {people.map((person, pIdx) => {
                      const isSelected = item.assignedTo.includes(person.id);
                      const colorInfo = getPersonColor(pIdx);

                      return (
                        <button
                          key={person.id}
                          type="button"
                          onClick={() => toggleAssignPerson(item.id, person.id)}
                          className={`inline-flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-bold transition-all active:scale-95 touch-manipulation ${
                            isSelected
                              ? `${colorInfo.activeBtn} shadow-sm ring-2 ring-offset-1 ring-blue-500/20`
                              : "bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-zinc-300 active:bg-gray-200"
                          }`}
                        >
                          {isSelected ? (
                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                          ) : (
                            <span className="w-2 h-2 rounded-full bg-gray-300 dark:bg-zinc-600" />
                          )}
                          <span>{person.name}</span>
                        </button>
                      );
                    })}

                    {/* Quick shortcuts */}
                    <div className="ml-auto flex items-center gap-1 text-[11px]">
                      <button
                        type="button"
                        onClick={() => assignToAll(item.id)}
                        className="text-gray-500 hover:text-blue-600 font-semibold px-1.5 py-1 rounded touch-manipulation"
                      >
                        Všichni
                      </button>
                      {isAssigned && (
                        <button
                          type="button"
                          onClick={() => clearAssignment(item.id)}
                          className="text-red-500 font-semibold px-1.5 py-1 rounded touch-manipulation"
                        >
                          Zrušit
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Sticky Bottom Floating Bar (Thumb-accessible everywhere) */}
      <div className="fixed bottom-0 left-0 right-0 p-3 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border-t border-gray-200 dark:border-zinc-800 z-40 shadow-lg">
        <div className="max-w-md mx-auto flex items-center justify-between gap-3">
          <div className="leading-tight">
            <p className="text-[11px] text-gray-500 dark:text-zinc-400">
              {unassignedCount === 0 ? (
                <span className="text-emerald-600 font-bold flex items-center gap-1">
                  <CheckCheck className="w-3.5 h-3.5" /> Vše rozděleno
                </span>
              ) : (
                <span className="text-amber-600 font-bold flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" /> Zbývá {unassignedCount} {unassignedCount === 1 ? "položka" : "položky"}
                </span>
              )}
            </p>
            <p className="text-xs font-black text-gray-900 dark:text-zinc-100">
              {formatCurrency(assignedSum, currency)} / {formatCurrency(receiptTotal, currency)}
            </p>
          </div>

          <button
            type="button"
            onClick={onContinue}
            className="flex items-center gap-2 py-3.5 px-5 rounded-2xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-sm shadow-md shadow-blue-500/25 active:scale-[0.98] transition-all touch-manipulation flex-shrink-0"
          >
            <span>Vyúčtování</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
