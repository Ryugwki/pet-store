"use client";

import { useState } from "react";

type FilterBarProps = {
  onSearch?: (q: string) => void;
  onChange?: (filters: Record<string, string>) => void;
};

export default function FilterBar({ onSearch, onChange }: FilterBarProps) {
  const [q, setQ] = useState("");
  const [color, setColor] = useState("");

  function emit() {
    onChange?.({ color });
  }

  return (
    <div className="container mx-auto px-4 py-5 flex flex-col gap-4 md:flex-row md:items-end md:justify-between bg-card border-y border-border">
      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="filter-color"
          className="text-[9.5px] font-semibold uppercase tracking-[0.22em] text-muted-foreground"
        >
          Color
        </label>
        <select
          id="filter-color"
          aria-label="Filter by color"
          className="border border-border rounded-none bg-background text-foreground font-serif text-base px-3 py-2 focus:outline-none focus:border-[var(--color-bronze)] focus:ring-1 focus:ring-[var(--color-bronze)] transition-colors"
          value={color}
          onChange={(e) => {
            setColor(e.target.value);
            emit();
          }}
        >
          <option value="">All Colors</option>
          <option value="blue">Blue</option>
          <option value="red">Red</option>
          <option value="black">Black</option>
        </select>
      </div>

      <div className="flex items-end gap-3">
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="filter-search"
            className="text-[9.5px] font-semibold uppercase tracking-[0.22em] text-muted-foreground"
          >
            Search
          </label>
          <input
            id="filter-search"
            aria-label="Search by name"
            className="border border-border rounded-none bg-background text-foreground px-3 py-2 w-64 focus:outline-none focus:border-[var(--color-bronze)] focus:ring-1 focus:ring-[var(--color-bronze)] transition-colors placeholder:text-muted-foreground"
            placeholder="Search by name..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
        <button
          className="border border-[#26221c] dark:border-border bg-[#26221c] dark:bg-[var(--color-bronze)] text-[#faf7f2] dark:text-[#16130f] text-[11px] font-semibold uppercase tracking-[0.18em] px-5 py-2.5 transition-colors hover:bg-[var(--color-bronze-deep)] hover:border-[var(--color-bronze-deep)]"
          onClick={() => onSearch?.(q)}
        >
          Search
        </button>
      </div>
    </div>
  );
}
