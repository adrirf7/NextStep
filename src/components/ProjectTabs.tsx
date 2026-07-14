import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Plus, Trash2, X } from "lucide-react";
import type { Project } from "../types";

interface Props {
  projects: Project[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onCreate: (name: string) => void;
  onDelete: (id: string) => void;
}

export default function ProjectTabs({ projects, selectedId, onSelect, onCreate, onDelete }: Props) {
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState("");
  const [confirmId, setConfirmId] = useState<string | null>(null);

  function submitNew(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = name.trim();
    setAdding(false);
    setName("");
    if (trimmed) onCreate(trimmed);
  }

  function handleDeleteClick(id: string) {
    if (confirmId === id) {
      onDelete(id);
      setConfirmId(null);
      return;
    }
    setConfirmId(id);
    window.setTimeout(() => setConfirmId((c) => (c === id ? null : c)), 2500);
  }

  return (
    <nav className="mx-auto flex max-w-7xl items-center gap-2 overflow-x-auto px-4 pb-1 pt-6 sm:px-8">
      {projects.map((p) => {
        const active = p.id === selectedId;
        const confirming = confirmId === p.id;
        return (
          <motion.button
            key={p.id}
            layout
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => onSelect(p.id)}
            className={`group flex shrink-0 items-center gap-2 rounded-full border px-3.5 py-1.5 text-sm font-bold transition-colors ${
              active
                ? "border-ink bg-ink text-paper dark:border-lime dark:bg-lime dark:text-ink"
                : "border-line bg-surface text-ink-soft hover:border-ink/40 hover:text-ink dark:border-night-line dark:bg-night-raised dark:text-ink-faint dark:hover:text-paper"
            }`}
          >
            <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: p.color }} />
            {p.name}
            <span
              role="button"
              tabIndex={0}
              onClick={(e) => {
                e.stopPropagation();
                handleDeleteClick(p.id);
              }}
              aria-label={`Eliminar proyecto ${p.name}`}
              className={`ml-0.5 grid h-4 w-4 place-items-center rounded-full transition-all ${
                confirming
                  ? "bg-red-500 text-white opacity-100"
                  : `opacity-0 group-hover:opacity-100 ${active ? "hover:bg-paper/20" : "hover:bg-red-500/10 hover:text-red-500"}`
              }`}
            >
              <Trash2 className="h-2.5 w-2.5" />
            </span>
          </motion.button>
        );
      })}

      <AnimatePresence mode="wait">
        {adding ? (
          <motion.form
            key="form"
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: "auto" }}
            exit={{ opacity: 0, width: 0 }}
            onSubmit={submitNew}
            className="flex shrink-0 items-center gap-1 overflow-hidden"
          >
            <input
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              onBlur={() => {
                if (!name.trim()) setAdding(false);
              }}
              onKeyDown={(e) => {
                if (e.key === "Escape") {
                  setAdding(false);
                  setName("");
                }
              }}
              placeholder="Nombre del proyecto…"
              className="w-44 rounded-full border border-ink bg-surface px-3.5 py-1.5 text-sm font-semibold outline-none focus:ring-2 focus:ring-lime/60 dark:border-paper dark:bg-night-raised"
            />
            <button
              type="submit"
              aria-label="Crear proyecto"
              className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-ink text-paper dark:bg-lime dark:text-ink"
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => {
                setAdding(false);
                setName("");
              }}
              aria-label="Cancelar"
              className="grid h-7 w-7 shrink-0 place-items-center rounded-full text-ink-faint hover:bg-paper-deep dark:hover:bg-night-line"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </motion.form>
        ) : (
          <motion.button
            key="button"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.94 }}
            onClick={() => setAdding(true)}
            className="flex shrink-0 items-center gap-1 rounded-full border border-dashed border-line px-3.5 py-1.5 text-sm font-bold text-ink-faint transition-colors hover:border-ink hover:text-ink dark:border-night-line dark:hover:border-paper dark:hover:text-paper"
          >
            <Plus className="h-3.5 w-3.5" />
            Proyecto
          </motion.button>
        )}
      </AnimatePresence>
    </nav>
  );
}
