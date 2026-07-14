import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";

interface Props {
  value: string; // "YYYY-MM-DD" o ""
  onChange: (value: string) => void;
  placeholder?: string;
}

const DEFAULT_PLACEHOLDER = "Elegir fecha límite…";

const WEEKDAYS = ["L", "M", "X", "J", "V", "S", "D"];
const MONTH_NAMES = [
  "enero",
  "febrero",
  "marzo",
  "abril",
  "mayo",
  "junio",
  "julio",
  "agosto",
  "septiembre",
  "octubre",
  "noviembre",
  "diciembre",
];

function parseValue(value: string): Date | null {
  if (!value) return null;
  const [y, m, d] = value.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function formatValue(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export default function DatePicker({ value, onChange, placeholder = DEFAULT_PLACEHOLDER }: Props) {
  const selected = parseValue(value);
  const [open, setOpen] = useState(false);
  const [openUpward, setOpenUpward] = useState(false);
  const [viewDate, setViewDate] = useState(() => selected ?? new Date());
  const ref = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  function toggleOpen() {
    if (!open && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      const POPOVER_HEIGHT = 380;
      setOpenUpward(
        window.innerHeight - rect.bottom < POPOVER_HEIGHT && rect.top > POPOVER_HEIGHT,
      );
    }
    setOpen((o) => !o);
  }

  useEffect(() => {
    if (open) setViewDate(selected ?? new Date());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    if (open) document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [open]);

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const firstOfMonth = new Date(year, month, 1);
  const startOffset = (firstOfMonth.getDay() + 6) % 7; // semana empieza en lunes
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const cells: { date: Date; outside: boolean }[] = [];
  for (let i = 0; i < startOffset; i++) {
    const day = daysInPrevMonth - startOffset + 1 + i;
    cells.push({ date: new Date(year, month - 1, day), outside: true });
  }
  for (let day = 1; day <= daysInMonth; day++) {
    cells.push({ date: new Date(year, month, day), outside: false });
  }
  let nextDay = 1;
  while (cells.length % 7 !== 0) {
    cells.push({ date: new Date(year, month + 1, nextDay), outside: true });
    nextDay++;
  }

  const today = new Date();

  return (
    <div ref={ref} className="relative">
      <motion.button
        ref={triggerRef}
        type="button"
        whileTap={{ scale: 0.98 }}
        onClick={toggleOpen}
        className={`inline-flex items-center gap-2 whitespace-nowrap rounded-xl border border-line bg-paper px-4 py-2.5 text-left text-sm outline-none transition-all focus:border-ink focus:ring-2 focus:ring-lime/60 dark:border-night-line dark:bg-night dark:focus:border-paper ${
          open ? "border-ink ring-2 ring-lime/60 dark:border-paper" : ""
        }`}
      >
        <CalendarDays className="h-4 w-4 shrink-0 text-ink-faint" />
        <span className={selected ? "" : "text-ink-faint"}>
          {selected
            ? selected.toLocaleDateString("es-ES", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })
            : placeholder}
        </span>
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: openUpward ? 8 : -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: openUpward ? 8 : -8, scale: 0.96 }}
            transition={{ duration: 0.15 }}
            className={`absolute left-0 z-30 w-72 rounded-2xl border border-line bg-surface p-4 shadow-lift dark:border-night-line dark:bg-night-raised ${
              openUpward ? "bottom-full mb-2" : "top-full mt-2"
            }`}
          >
            <div className="mb-3 flex items-center justify-between">
              <motion.button
                type="button"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setViewDate(new Date(year, month - 1, 1))}
                aria-label="Mes anterior"
                className="grid h-7 w-7 place-items-center rounded-full text-ink-faint hover:bg-paper-deep hover:text-ink dark:hover:bg-night-line dark:hover:text-paper"
              >
                <ChevronLeft className="h-4 w-4" />
              </motion.button>
              <span className="font-display text-base capitalize tracking-tight">
                {MONTH_NAMES[month]} {year}
              </span>
              <motion.button
                type="button"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setViewDate(new Date(year, month + 1, 1))}
                aria-label="Mes siguiente"
                className="grid h-7 w-7 place-items-center rounded-full text-ink-faint hover:bg-paper-deep hover:text-ink dark:hover:bg-night-line dark:hover:text-paper"
              >
                <ChevronRight className="h-4 w-4" />
              </motion.button>
            </div>

            <div className="mb-1 grid grid-cols-7 gap-1">
              {WEEKDAYS.map((w) => (
                <span
                  key={w}
                  className="grid h-7 place-items-center text-[10px] font-bold uppercase text-ink-faint"
                >
                  {w}
                </span>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {cells.map(({ date, outside }, i) => {
                const isSelected = selected != null && isSameDay(date, selected);
                const isToday = isSameDay(date, today);
                return (
                  <motion.button
                    key={i}
                    type="button"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => {
                      onChange(formatValue(date));
                      setOpen(false);
                    }}
                    className={`grid h-8 w-8 place-items-center rounded-full text-xs font-semibold transition-colors ${
                      isSelected
                        ? "bg-ink text-paper dark:bg-lime dark:text-ink"
                        : outside
                          ? "text-ink-faint/50 hover:bg-paper-deep dark:hover:bg-night-line"
                          : "text-ink hover:bg-paper-deep dark:text-paper dark:hover:bg-night-line"
                    } ${isToday && !isSelected ? "ring-1 ring-lime-deep" : ""}`}
                  >
                    {date.getDate()}
                  </motion.button>
                );
              })}
            </div>

            <div className="mt-3 flex items-center justify-between border-t border-line pt-3 dark:border-night-line">
              <button
                type="button"
                onClick={() => {
                  onChange(formatValue(today));
                  setOpen(false);
                }}
                className="text-xs font-bold text-ink-soft hover:text-ink dark:text-ink-faint dark:hover:text-paper"
              >
                Hoy
              </button>
              {value && (
                <button
                  type="button"
                  onClick={() => {
                    onChange("");
                    setOpen(false);
                  }}
                  className="text-xs font-bold text-ink-faint hover:text-red-500"
                >
                  Quitar fecha
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
