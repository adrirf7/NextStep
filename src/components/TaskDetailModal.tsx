import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowDown,
  ArrowUp,
  Calendar,
  CalendarClock,
  Check,
  Equal,
  Flame,
  Minus,
  Pencil,
  Trash2,
  X,
} from "lucide-react";
import type { Task, TaskPriority, TaskStatus } from "../types";
import { PRIORITY_META, STATUS_META, STATUS_ORDER } from "../types";

const PRIORITIES: TaskPriority[] = ["trivial", "low", "medium", "high", "urgent"];

const PRIORITY_STYLES: Record<Task["priority"], string> = {
  trivial: "bg-paper-deep text-ink-faint dark:bg-night-line dark:text-ink-faint/70",
  low: "bg-paper-deep text-ink-soft dark:bg-night-line dark:text-ink-faint",
  medium: "bg-amber-flow/15 text-amber-700 dark:text-amber-flow",
  high: "bg-red-500/10 text-red-600 dark:text-red-400",
  urgent: "bg-red-600 text-white",
};

const PRIORITY_ICON: Record<Task["priority"], typeof Minus> = {
  trivial: Minus,
  low: ArrowDown,
  medium: Equal,
  high: ArrowUp,
  urgent: Flame,
};

function startOfToday(): number {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

const STATUS_DOT: Record<Task["status"], string> = {
  todo: "bg-ink-faint",
  doing: "bg-amber-flow",
  review: "bg-blue-500",
  done: "bg-green-done",
};

interface Props {
  task: Task | null;
  projectName: string;
  projectColor: string;
  onClose: () => void;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  onPriorityChange: (id: string, priority: TaskPriority) => void;
  onStatusChange: (id: string, status: TaskStatus) => void;
}

export default function TaskDetailModal({
  task,
  projectName,
  projectColor,
  onClose,
  onEdit,
  onDelete,
  onPriorityChange,
  onStatusChange,
}: Props) {
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [priorityMenuOpen, setPriorityMenuOpen] = useState(false);
  const [statusMenuOpen, setStatusMenuOpen] = useState(false);
  const priorityMenuRef = useRef<HTMLDivElement>(null);
  const statusMenuRef = useRef<HTMLDivElement>(null);
  const isOverdue =
    task != null &&
    task.dueDate != null &&
    task.dueDate < startOfToday() &&
    task.status !== "done";

  useEffect(() => {
    setConfirmingDelete(false);
    setPriorityMenuOpen(false);
    setStatusMenuOpen(false);
  }, [task]);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (priorityMenuRef.current && !priorityMenuRef.current.contains(e.target as Node)) {
        setPriorityMenuOpen(false);
      }
      if (statusMenuRef.current && !statusMenuRef.current.contains(e.target as Node)) {
        setStatusMenuOpen(false);
      }
    }
    if (priorityMenuOpen || statusMenuOpen) document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [priorityMenuOpen, statusMenuOpen]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    if (task) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [task, onClose]);

  return (
    <AnimatePresence>
      {task && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 z-50 flex items-end justify-center bg-ink/40 p-4 backdrop-blur-sm sm:items-center dark:bg-black/60"
        >
          <motion.div
            initial={{ opacity: 0, y: 48, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 48, scale: 0.96 }}
            transition={{ type: "spring", stiffness: 320, damping: 28 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg rounded-3xl border border-line bg-surface p-6 shadow-lift dark:border-night-line dark:bg-night-raised"
          >
            <div className="mb-4 flex items-start justify-between gap-4">
              <div className="flex items-center gap-1.5 text-xs font-bold text-ink-soft dark:text-ink-faint">
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: projectColor }}
                />
                {projectName}
              </div>
              <motion.button
                type="button"
                whileHover={{ rotate: 90, scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                aria-label="Cerrar"
                className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-ink-faint hover:bg-paper-deep hover:text-ink dark:hover:bg-night-line dark:hover:text-paper"
              >
                <X className="h-4 w-4" />
              </motion.button>
            </div>

            <h2
              className={`font-display text-3xl tracking-tight ${
                task.status === "done" ? "line-through decoration-lime-deep decoration-2" : ""
              }`}
            >
              {task.title}
            </h2>

            {task.description ? (
              <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-ink-soft dark:text-ink-faint">
                {task.description}
              </p>
            ) : (
              <p className="mt-3 text-sm italic text-ink-faint">Sin descripción.</p>
            )}

            <div className="mt-5 flex flex-wrap items-center gap-1.5">
              <div ref={statusMenuRef} className="relative">
                <motion.button
                  type="button"
                  whileTap={{ scale: 0.96 }}
                  onClick={() => setStatusMenuOpen((o) => !o)}
                  className={`flex items-center gap-1.5 rounded-full bg-paper-deep px-2.5 py-1 text-[11px] font-bold text-ink-soft transition-all dark:bg-night-line dark:text-ink-faint ${
                    statusMenuOpen ? "ring-2 ring-lime/60" : ""
                  }`}
                >
                  <span className={`h-1.5 w-1.5 rounded-full ${STATUS_DOT[task.status]}`} />
                  {STATUS_META[task.status].label}
                </motion.button>

                <AnimatePresence>
                  {statusMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -8, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -8, scale: 0.96 }}
                      transition={{ duration: 0.15 }}
                      className="absolute left-0 top-full z-20 mt-2 w-44 overflow-hidden rounded-2xl border border-line bg-surface p-1.5 shadow-lift dark:border-night-line dark:bg-night-raised"
                    >
                      {STATUS_ORDER.map((s) => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => {
                            onStatusChange(task.id, s);
                            setStatusMenuOpen(false);
                          }}
                          className={`flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm font-semibold transition-colors ${
                            task.status === s
                              ? "bg-paper-deep text-ink dark:bg-night-line dark:text-paper"
                              : "text-ink-soft hover:bg-paper-deep hover:text-ink dark:text-ink-faint dark:hover:bg-night-line dark:hover:text-paper"
                          }`}
                        >
                          <span className={`h-2 w-2 shrink-0 rounded-full ${STATUS_DOT[s]}`} />
                          <span className="flex-1">{STATUS_META[s].label}</span>
                          {task.status === s && <Check className="h-3.5 w-3.5 shrink-0" />}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              <div ref={priorityMenuRef} className="relative">
                <motion.button
                  type="button"
                  whileTap={{ scale: 0.96 }}
                  onClick={() => setPriorityMenuOpen((o) => !o)}
                  className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide transition-all ${PRIORITY_STYLES[task.priority]} ${
                    priorityMenuOpen ? "ring-2 ring-lime/60" : ""
                  }`}
                >
                  {(() => {
                    const PriorityIcon = PRIORITY_ICON[task.priority];
                    return <PriorityIcon className="h-3 w-3" />;
                  })()}
                  {PRIORITY_META[task.priority].label}
                </motion.button>

                <AnimatePresence>
                  {priorityMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -8, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -8, scale: 0.96 }}
                      transition={{ duration: 0.15 }}
                      className="absolute left-0 top-full z-20 mt-2 w-44 overflow-hidden rounded-2xl border border-line bg-surface p-1.5 shadow-lift dark:border-night-line dark:bg-night-raised"
                    >
                      {PRIORITIES.map((p) => {
                        const PriorityIcon = PRIORITY_ICON[p];
                        return (
                          <button
                            key={p}
                            type="button"
                            onClick={() => {
                              onPriorityChange(task.id, p);
                              setPriorityMenuOpen(false);
                            }}
                            className={`flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm font-semibold transition-colors ${
                              task.priority === p
                                ? "bg-paper-deep text-ink dark:bg-night-line dark:text-paper"
                                : "text-ink-soft hover:bg-paper-deep hover:text-ink dark:text-ink-faint dark:hover:bg-night-line dark:hover:text-paper"
                            }`}
                          >
                            <span className={`grid h-5 w-5 shrink-0 place-items-center rounded-full ${PRIORITY_STYLES[p]}`}>
                              <PriorityIcon className="h-3 w-3" />
                            </span>
                            <span className="flex-1">{PRIORITY_META[p].label}</span>
                            {task.priority === p && <Check className="h-3.5 w-3.5 shrink-0" />}
                          </button>
                        );
                      })}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              <span className="flex items-center gap-1 rounded-full bg-paper-deep px-2.5 py-1 text-[11px] font-semibold text-ink-soft dark:bg-night-line dark:text-ink-faint">
                <Calendar className="h-3 w-3" />
                Creada el{" "}
                {new Date(task.createdAt).toLocaleDateString("es-ES", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </span>
              {task.dueDate != null && (
                <span
                  className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                    isOverdue
                      ? "bg-red-500/10 text-red-600 dark:text-red-400"
                      : "bg-paper-deep text-ink-soft dark:bg-night-line dark:text-ink-faint"
                  }`}
                >
                  <CalendarClock className="h-3 w-3" />
                  Vence el{" "}
                  {new Date(task.dueDate).toLocaleDateString("es-ES", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </span>
              )}
            </div>

            <div className="mt-6 flex justify-end gap-2 border-t border-line pt-5 dark:border-night-line">
              <motion.button
                type="button"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => {
                  if (confirmingDelete) {
                    onDelete(task.id);
                    onClose();
                  } else {
                    setConfirmingDelete(true);
                  }
                }}
                onBlur={() => setConfirmingDelete(false)}
                className={`flex items-center gap-1.5 rounded-full px-4 py-2.5 text-sm font-bold transition-colors ${
                  confirmingDelete
                    ? "bg-red-500 text-white hover:bg-red-600"
                    : "text-ink-soft hover:bg-red-500/10 hover:text-red-500 dark:text-ink-faint"
                }`}
              >
                <Trash2 className="h-4 w-4" />
                {confirmingDelete ? "¿Seguro? Confirmar" : "Eliminar"}
              </motion.button>
              <motion.button
                type="button"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => {
                  onEdit(task);
                  onClose();
                }}
                className="flex items-center gap-1.5 rounded-full bg-ink px-5 py-2.5 text-sm font-bold text-paper shadow-card transition-colors hover:bg-black dark:bg-lime dark:text-ink dark:hover:bg-lime-deep"
              >
                <Pencil className="h-4 w-4" />
                Editar
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
