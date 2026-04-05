import { useState } from "react";

interface DatePickerProps {
  onSearch: (date: string) => void;
  onToday: () => void;
  isLoading: boolean;
}

// APOD is available from June 16, 1995
const MIN_DATE = "1995-06-16";
const MAX_DATE = new Date().toISOString().split("T")[0];

export function DatePicker({ onSearch, onToday, isLoading }: DatePickerProps) {
  const [date, setDate] = useState("");

  const handleSubmit = () => {
    if (date) onSearch(date);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSubmit();
  };

  return (
    <div className="flex flex-col sm:flex-row gap-3">
      <div className="relative flex-1">
        <input
          type="date"
          value={date}
          min={MIN_DATE}
          max={MAX_DATE}
          onChange={(e) => setDate(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isLoading}
          className="
            w-full px-4 py-3 rounded-xl text-sm font-mono text-slate-200
            bg-cosmos-800 border border-white/10 outline-none
            focus:border-[#1C7CF9]/50 focus:ring-1 focus:ring-[#1C7CF9]/20
            disabled:opacity-40 disabled:cursor-not-allowed
            transition-all duration-200
            [color-scheme:dark]
          "
        />
      </div>

      <button
        onClick={handleSubmit}
        disabled={!date || isLoading}
        className="
          px-5 py-3 rounded-xl text-sm font-medium text-white
          bg-[#1C7CF9] hover:bg-[#1C7CF9]/90
          disabled:opacity-40 disabled:cursor-not-allowed
          transition-colors duration-200
          whitespace-nowrap
        "
      >
        Buscar data
      </button>

      <button
        onClick={onToday}
        disabled={isLoading}
        className="
          px-5 py-3 rounded-xl text-sm font-medium
          bg-white/5 hover:bg-white/10 text-slate-300
          border border-white/10
          disabled:opacity-40 disabled:cursor-not-allowed
          transition-colors duration-200
          whitespace-nowrap
        "
      >
        Hoje
      </button>
    </div>
  );
}
