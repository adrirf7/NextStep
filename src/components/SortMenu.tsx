import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpDown, Check } from "lucide-react";
import type { SortOption } from "../types";
import { SORT_META, SORT_OPTIONS } from "../types";

interface Props {
  value: SortOption;
  onChange: (value: SortOption) => void;
}

export default function SortMenu({ value, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    if (open) document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [open]);

  return (
    <div ref={ref} className="relative shrink-0">
      <motion.button
        type="button"
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.96 }}
        onClick={() => setOpen((o) => !o)}
        aria-label="Ordenar tareas"
        className={`flex items-center gap-1.5 rounded-full border px-3.5 py-2 text-sm font-bold transition-colors ${
          open
            ? "border-ink bg-ink text-paper dark:border-lime dark:bg-lime dark:text-ink"
            : "border-line bg-surface text-ink-soft hover:border-ink/40 hover:text-ink dark:border-night-line dark:bg-night-raised dark:text-ink-faint dark:hover:text-paper"
        }`}
      >
        <ArrowUpDown className="h-4 w-4" />
        <span className="hidden md:inline">{SORT_META[value].label}</span>
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 z-20 mt-2 w-64 overflow-hidden rounded-2xl border border-line bg-surface p-1.5 shadow-lift dark:border-night-line dark:bg-night-raised"
          >
            {SORT_OPTIONS.map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => {
                  onChange(opt);
                  setOpen(false);
                }}
                className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-sm font-semibold transition-colors ${
                  value === opt
                    ? "bg-paper-deep text-ink dark:bg-night-line dark:text-paper"
                    : "text-ink-soft hover:bg-paper-deep hover:text-ink dark:text-ink-faint dark:hover:bg-night-line dark:hover:text-paper"
                }`}
              >
                {SORT_META[opt].label}
                {value === opt && <Check className="h-3.5 w-3.5 shrink-0" />}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
