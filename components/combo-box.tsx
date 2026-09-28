"use client";

import { useEffect, useRef, useState } from "react";

export type Option = { id: number; label: string };

export function ComboBox({
  options,
  value,
  onChange,
  onCreateNew,
  placeholder,
  disabled,
  inputClassName,
}: {
  options: Option[];
  value: number | null;
  onChange: (id: number | null) => void;
  onCreateNew?: (typedLabel: string) => void;
  placeholder?: string;
  disabled?: boolean;
  inputClassName?: string;
}) {
  const selected = options.find((o) => o.id === value) ?? null;
  const [query, setQuery] = useState(selected?.label ?? "");
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Keep the displayed text in sync when the selection changes from outside
  // (e.g. auto-filled after an item is chosen elsewhere on the page).
  useEffect(() => {
    setQuery(selected?.label ?? "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  const filtered =
    query.trim() === ""
      ? options
      : options.filter((o) => o.label.toLowerCase().includes(query.trim().toLowerCase()));

  const exactMatch = options.find((o) => o.label.toLowerCase() === query.trim().toLowerCase());
  const showCreatePrompt =
    !!onCreateNew && query.trim() !== "" && !exactMatch && !options.some((o) => o.id === value && o.label === query);

  return (
    <div ref={containerRef} className="relative">
      <input
        className={inputClassName ?? "field-input"}
        placeholder={placeholder}
        disabled={disabled}
        value={query}
        onFocus={() => setOpen(true)}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
          if (e.target.value.trim() === "") onChange(null);
        }}
      />
      {open && !disabled && (
        <div className="absolute z-10 mt-1 max-h-48 w-full overflow-y-auto rounded-sm border border-line bg-paper-raised shadow-sm">
          {filtered.length === 0 && !showCreatePrompt && (
            <p className="px-3 py-2 text-xs text-ink-faint">No matches</p>
          )}
          {filtered.map((o) => (
            <button
              key={o.id}
              type="button"
              className="block w-full px-3 py-2 text-left text-sm text-ink hover:bg-paper"
              onMouseDown={(e) => {
                e.preventDefault();
                onChange(o.id);
                setQuery(o.label);
                setOpen(false);
              }}
            >
              {o.label}
            </button>
          ))}
          {showCreatePrompt && (
            <button
              type="button"
              className="block w-full border-t border-line px-3 py-2 text-left text-sm text-accent hover:bg-accent-soft"
              onMouseDown={(e) => {
                e.preventDefault();
                setOpen(false);
                onCreateNew!(query.trim());
              }}
            >
              + Add \u201c{query.trim()}\u201d as new\u2026
            </button>
          )}
        </div>
      )}
    </div>
  );
}
