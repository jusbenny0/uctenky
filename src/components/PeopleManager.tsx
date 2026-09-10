"use client";

import React, { useState } from "react";
import { Users, UserPlus, Trash2, ArrowRight } from "lucide-react";
import { Person } from "@/types/receipt";
import { getPersonColor } from "@/lib/utils";

interface PeopleManagerProps {
  people: Person[];
  onUpdatePeople: (people: Person[]) => void;
  onContinue: () => void;
}

export const PeopleManager: React.FC<PeopleManagerProps> = ({
  people,
  onUpdatePeople,
  onContinue,
}) => {
  const [peopleCountInput, setPeopleCountInput] = useState<number>(
    people.length > 0 ? people.length : 2
  );

  const handleGeneratePeople = (count: number) => {
    if (count < 1) count = 1;
    if (count > 20) count = 20;
    setPeopleCountInput(count);

    const newPeople: Person[] = [];
    for (let i = 0; i < count; i++) {
      if (people[i]) {
        newPeople.push(people[i]);
      } else {
        newPeople.push({
          id: `person-${Date.now()}-${i}`,
          name: `Člověk ${i + 1}`,
          color: getPersonColor(i).bg,
        });
      }
    }
    onUpdatePeople(newPeople);
  };

  const handleNameChange = (id: string, newName: string) => {
    onUpdatePeople(
      people.map((p) => (p.id === id ? { ...p, name: newName } : p))
    );
  };

  const handleAddPerson = () => {
    const nextIndex = people.length;
    const newPerson: Person = {
      id: `person-${Date.now()}-${nextIndex}`,
      name: `Člověk ${nextIndex + 1}`,
      color: getPersonColor(nextIndex).bg,
    };
    onUpdatePeople([...people, newPerson]);
    setPeopleCountInput(people.length + 1);
  };

  const handleRemovePerson = (id: string) => {
    if (people.length <= 1) return;
    const updated = people.filter((p) => p.id !== id);
    onUpdatePeople(updated);
    setPeopleCountInput(updated.length);
  };

  return (
    <div className="w-full space-y-4 pb-20 sm:pb-0">
      {/* Question Card */}
      <div className="bg-white dark:bg-zinc-900 rounded-3xl p-5 border border-gray-200/80 dark:border-zinc-800 shadow-sm space-y-5">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-blue-50 dark:bg-blue-950/60 border border-blue-100 dark:border-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center flex-shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-zinc-100 leading-tight">
              Kolik lidí nakupovalo?
            </h2>
            <p className="text-xs text-gray-500 dark:text-zinc-400">
              Vyberte počet a níže zadejte jejich jména.
            </p>
          </div>
        </div>

        {/* Quick mobile touch pills (2, 3, 4, 5, 6...) */}
        <div className="grid grid-cols-5 gap-2">
          {[2, 3, 4, 5, 6].map((num) => (
            <button
              key={num}
              type="button"
              onClick={() => handleGeneratePeople(num)}
              className={`h-12 rounded-2xl text-base font-bold transition-all active:scale-95 touch-manipulation flex items-center justify-center ${
                people.length === num
                  ? "bg-blue-600 text-white shadow-md shadow-blue-500/25 scale-[1.03]"
                  : "bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-zinc-300 hover:bg-gray-200 dark:hover:bg-zinc-700"
              }`}
            >
              {num}
            </button>
          ))}
        </div>

        {/* People List with large tap inputs (text-base prevents iOS zoom) */}
        <div className="space-y-2.5 pt-3 border-t border-gray-100 dark:border-zinc-800">
          <div className="flex items-center justify-between text-xs font-semibold text-gray-400 uppercase tracking-wider px-1">
            <span>Seznam lidí ({people.length})</span>
            <span>Klepněte pro úpravu jména</span>
          </div>

          <div className="space-y-2">
            {people.map((person, index) => {
              const colorInfo = getPersonColor(index);
              return (
                <div
                  key={person.id}
                  className="flex items-center gap-2 p-2 rounded-2xl border border-gray-200 dark:border-zinc-800 bg-gray-50/70 dark:bg-zinc-800/40 focus-within:ring-2 focus-within:ring-blue-500 focus-within:bg-white dark:focus-within:bg-zinc-800 transition-all"
                >
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm ${colorInfo.badge} flex-shrink-0 shadow-sm`}
                  >
                    {index + 1}
                  </div>

                  <input
                    type="text"
                    value={person.name}
                    onChange={(e) => handleNameChange(person.id, e.target.value)}
                    placeholder={`Člověk ${index + 1}`}
                    className="flex-1 bg-transparent text-base sm:text-sm font-semibold text-gray-900 dark:text-zinc-100 focus:outline-none px-2 py-1"
                  />

                  {people.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemovePerson(person.id)}
                      title="Odebrat"
                      className="p-2.5 text-gray-400 hover:text-red-500 rounded-xl hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors touch-manipulation"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          {/* Add person button */}
          <button
            type="button"
            onClick={handleAddPerson}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl border border-dashed border-blue-300 dark:border-blue-800 text-blue-600 dark:text-blue-400 font-bold text-xs hover:bg-blue-50/50 dark:hover:bg-blue-950/30 transition-all active:scale-[0.98] touch-manipulation"
          >
            <UserPlus className="w-4 h-4" />
            <span>Přidat dalšího člověka</span>
          </button>
        </div>
      </div>

      {/* Sticky Bottom Bar for Mobile (Thumb-accessible) */}
      <div className="fixed sm:static bottom-0 left-0 right-0 p-3 sm:p-0 bg-white/95 dark:bg-zinc-900/95 sm:bg-transparent backdrop-blur-md sm:backdrop-blur-none border-t sm:border-t-0 border-gray-200 dark:border-zinc-800 z-40">
        <div className="max-w-md mx-auto">
          <button
            type="button"
            onClick={onContinue}
            disabled={people.length === 0}
            className="w-full flex items-center justify-center gap-2 py-4 px-6 rounded-2xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-base shadow-lg shadow-blue-500/25 active:scale-[0.98] transition-all touch-manipulation disabled:opacity-50"
          >
            <span>Přejít k rozdělení položek</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};
