"use client";

import { useMemo, useState } from "react";
import { nextDays, slotsForDate, humanSlot } from "@/lib/slots";

export default function Calendar({
  taken,
  onPick,
  selected,
}: {
  taken: string[];
  onPick: (iso: string) => void;
  selected?: string;
}) {
  const days = useMemo(() => nextDays(7), []);
  const [date, setDate] = useState(days[0]);
  const slots = slotsForDate(date, taken);

  return (
    <div>
      <div className="flex gap-2 overflow-x-auto pb-2">
        {days.map((d) => {
          const dt = new Date(`${d}T00:00:00`);
          const active = d === date;
          return (
            <button
              key={d}
              onClick={() => setDate(d)}
              className={`flex flex-col items-center px-3 py-2 rounded-lg border text-xs min-w-[56px] ${
                active
                  ? "bg-still-600 text-white border-still-600"
                  : "bg-white text-slate-700 border-slate-200 hover:border-still-400"
              }`}
            >
              <span>{dt.toLocaleDateString("en-IN", { weekday: "short" })}</span>
              <span className="text-lg font-semibold">{dt.getDate()}</span>
              <span>{dt.toLocaleDateString("en-IN", { month: "short" })}</span>
            </button>
          );
        })}
      </div>
      <div className="mt-3 grid grid-cols-3 sm:grid-cols-4 gap-2">
        {slots.map((s) => (
          <button
            key={s.slot}
            disabled={s.taken}
            onClick={() => onPick(s.slot)}
            className={`rounded-lg border text-xs px-2 py-2 ${
              s.taken
                ? "bg-slate-100 text-slate-400 line-through"
                : selected === s.slot
                ? "bg-still-600 text-white border-still-600"
                : "bg-white hover:border-still-400"
            }`}
          >
            {humanSlot(s.slot).split(", ").slice(-1)[0]}
          </button>
        ))}
      </div>
    </div>
  );
}
