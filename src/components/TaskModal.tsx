import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowDown, ArrowUp, Equal, Flame, Minus, X } from "lucide-react";
import type { Task, TaskPriority, TaskStatus } from "../types";
import { PRIORITY_META, STATUS_META, STATUS_ORDER } from "../types";
import type { TaskDraft } from "../hooks/useTasks";
import DatePicker from "./DatePicker";

type TaskFormDraft = Omit<TaskDraft, "projectId">;

function toDateInputValue(ts: number | null): string {
  if (!ts) return "";
  const d = new Date(ts);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function fromDateInputValue(value: string): number | null {
  if (!value) return null;
  const [y, m, d] = value.split("-").map(Number);
  return new Date(y, m - 1, d).getTime();
}

interface Props {
  open: boolean;
  editing: Task | null;
  initialStatus: TaskStatus;
  projectName: string;
  projectColor: string;
  onClose: () => void;
  onSave: (draft: TaskFormDraft, id?: string) => Promise<void> | void;
}

const PRIORITIES: TaskPriority[] = ["trivial", "low", "medium", "high", "urgent"];

const PRIORITY_ICON: Record<TaskPriority, typeof Minus> = {
  trivial: Minus,
  low: ArrowDown,
  medium: Equal,
  high: ArrowUp,
  urgent: Flame,
};

export default function TaskModal({
  open,
  editing,
  initialStatus,
  projectName,
  projectColor,
  onClose,
  onSave,
}: Props) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<TaskStatus>("todo");
  const [priority, setPriority] = useState<TaskPriority>("medium");
  const [dueDate, setDueDate] = useState("");

  useEffect(() => {
    if (open) {
      setTitle(editing?.title ?? "");
      setDescription(editing?.description ?? "");
      setStatus(editing?.status ?? initialStatus);
      setPriority(editing?.priority ?? "medium");
      setDueDate(toDateInputValue(editing?.dueDate ?? null));
    }
  }, [open, editing, initialStatus]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    if (open) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    await onSave(
      {
        title: title.trim(),
        description: description.trim(),
        status,
        priority,
        dueDate: fromDateInputValue(dueDate),
      },
      editing?.id,
    );
    onClose();
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 z-50 flex items-end justify-center bg-ink/40 p-4 backdrop-blur-sm sm:items-center dark:bg-black/60"
        >
          <motion.form
            initial={{ opacity: 0, y: 48, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 48, scale: 0.96 }}
            transition={{ type: "spring", stiffness: 320, damping: 28 }}
            onClick={(e) => e.stopPropagation()}
            onSubmit={handleSubmit}
            className="w-full max-w-lg rounded-3xl border border-line bg-surface p-6 shadow-lift dark:border-night-line dark:bg-night-raised"
          >
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="font-display text-2xl tracking-tight">
                  {editing ? "Editar tarea" : "Nueva tarea"}
                </h2>
                <span className="mt-1 flex items-center gap-1.5 text-xs font-bold text-ink-soft dark:text-ink-faint">
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: projectColor }}
                  />
                  {projectName}
                </span>
              </div>
              <motion.button
                type="button"
                whileHover={{ rotate: 90, scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                aria-label="Cerrar"
                className="grid h-8 w-8 place-items-center rounded-full text-ink-faint hover:bg-paper-deep hover:text-ink dark:hover:bg-night-line dark:hover:text-paper"
              >
                <X className="h-4 w-4" />
              </motion.button>
            </div>

            <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-ink-soft dark:text-ink-faint">
              Título
            </label>
            <input
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="¿Qué hay que hacer?"
              className="mb-4 w-full rounded-xl border border-line bg-paper px-4 py-2.5 text-sm font-semibold outline-none transition-all placeholder:font-normal placeholder:text-ink-faint focus:border-ink focus:ring-2 focus:ring-lime/60 dark:border-night-line dark:bg-night dark:focus:border-paper"
            />

            <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-ink-soft dark:text-ink-faint">
              Descripción
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detalles, contexto, enlaces… (opcional)"
              rows={3}
              className="mb-4 w-full resize-none rounded-xl border border-line bg-paper px-4 py-2.5 text-sm outline-none transition-all placeholder:text-ink-faint focus:border-ink focus:ring-2 focus:ring-lime/60 dark:border-night-line dark:bg-night dark:focus:border-paper"
            />

            <div className="mb-6 grid gap-4 sm:grid-cols-2">
              <fieldset>
                <legend className="mb-1.5 text-xs font-bold uppercase tracking-wider text-ink-soft dark:text-ink-faint">
                  Estado
                </legend>
                <div className="flex gap-1 rounded-xl bg-paper p-1 dark:bg-night">
                  {STATUS_ORDER.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setStatus(s)}
                      className={`flex-1 rounded-lg px-2 py-1.5 text-[11px] font-bold transition-all ${
                        status === s
                          ? "bg-ink text-paper shadow-card dark:bg-lime dark:text-ink"
                          : "text-ink-faint hover:text-ink dark:hover:text-paper"
                      }`}
                    >
                      {STATUS_META[s].hint}
                    </button>
                  ))}
                </div>
              </fieldset>

              <fieldset>
                <legend className="mb-1.5 text-xs font-bold uppercase tracking-wider text-ink-soft dark:text-ink-faint">
                  Prioridad
                </legend>
                <div className="flex gap-1 rounded-xl bg-paper p-1 dark:bg-night">
                  {PRIORITIES.map((p) => {
                    const PriorityIcon = PRIORITY_ICON[p];
                    return (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setPriority(p)}
                        className={`flex flex-1 flex-col items-center gap-0.5 rounded-lg px-1.5 py-1.5 text-[10px] font-bold transition-all ${
                          priority === p
                            ? "bg-ink text-paper shadow-card dark:bg-lime dark:text-ink"
                            : "text-ink-faint hover:text-ink dark:hover:text-paper"
                        }`}
                      >
                        <PriorityIcon className="h-3.5 w-3.5" />
                        {PRIORITY_META[p].label}
                      </button>
                    );
                  })}
                </div>
              </fieldset>
            </div>

            <div className="mb-6">
              <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-ink-soft dark:text-ink-faint">
                Fecha límite{" "}
                <span className="font-normal normal-case text-ink-faint">(opcional)</span>
              </label>
              <DatePicker value={dueDate} onChange={setDueDate} />
            </div>

            <div className="flex justify-end gap-2">
              <motion.button
                type="button"
                whileTap={{ scale: 0.96 }}
                onClick={onClose}
                className="rounded-full px-5 py-2.5 text-sm font-bold text-ink-soft hover:bg-paper-deep dark:text-ink-faint dark:hover:bg-night-line"
              >
                Cancelar
              </motion.button>
              <motion.button
                type="submit"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.96 }}
                disabled={!title.trim()}
                className="rounded-full bg-ink px-6 py-2.5 text-sm font-bold text-paper shadow-card transition-colors hover:bg-black disabled:opacity-40 dark:bg-lime dark:text-ink dark:hover:bg-lime-deep"
              >
                {editing ? "Guardar cambios" : "Crear tarea"}
              </motion.button>
            </div>
          </motion.form>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
