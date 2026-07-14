import { useState } from "react";
import { motion } from "framer-motion";
import { useDraggable } from "@dnd-kit/core";
import { CalendarClock, Flag, Pencil, Trash2 } from "lucide-react";
import type { Task } from "../types";
import { PRIORITY_META } from "../types";

const PRIORITY_STYLES: Record<Task["priority"], string> = {
  low: "bg-paper-deep text-ink-soft dark:bg-night-line dark:text-ink-faint",
  medium: "bg-amber-flow/15 text-amber-700 dark:text-amber-flow",
  high: "bg-red-500/10 text-red-600 dark:text-red-400",
};

function startOfToday(): number {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

interface Props {
  task: Task;
  onView?: (task: Task) => void;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  overlay?: boolean;
}

export default function TaskCard({ task, onView, onEdit, onDelete, overlay = false }: Props) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: task.id,
    disabled: overlay,
  });

  const [confirmingDelete, setConfirmingDelete] = useState(false);

  const isOverdue = task.dueDate != null && task.dueDate < startOfToday() && task.status !== "done";

  function handleDeleteClick(e: React.MouseEvent) {
    e.stopPropagation();
    if (confirmingDelete) {
      onDelete(task.id);
      setConfirmingDelete(false);
    } else {
      setConfirmingDelete(true);
      window.setTimeout(() => setConfirmingDelete(false), 2500);
    }
  }

  return (
    <motion.article
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      layout={!overlay}
      initial={overlay ? false : { opacity: 0, y: 16, scale: 0.96 }}
      animate={{ opacity: isDragging ? 0.35 : 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.18 } }}
      transition={{ type: "spring", stiffness: 380, damping: 30 }}
      whileHover={overlay ? undefined : { y: -3 }}
      onClick={() => !overlay && onView?.(task)}
      className={`group relative touch-none rounded-2xl border border-line bg-surface p-4 shadow-card transition-shadow hover:shadow-lift dark:border-night-line dark:bg-night-raised ${
        overlay ? "rotate-2 shadow-lift ring-2 ring-lime" : "cursor-pointer"
      } ${task.status === "done" ? "opacity-75" : ""}`}
    >
      <div className="flex items-start gap-2">
        <div
          aria-hidden
          className="mt-1.5 grid shrink-0 grid-cols-2 gap-[3px] self-start opacity-25 transition-opacity group-hover:opacity-60"
        >
          {Array.from({ length: 6 }).map((_, i) => (
            <span key={i} className="h-[3px] w-[3px] rounded-full bg-ink-faint" />
          ))}
        </div>

        <div className="min-w-0 flex-1">
          <h3
            className={`text-sm font-bold leading-snug ${
              task.status === "done" ? "line-through decoration-lime-deep decoration-2" : ""
            }`}
          >
            {task.title}
          </h3>
          {task.description && (
            <p className="mt-1 line-clamp-2 whitespace-pre-line text-xs leading-relaxed text-ink-soft dark:text-ink-faint">
              {task.description}
            </p>
          )}
        </div>

        <div
          className={`flex shrink-0 gap-0.5 transition-opacity ${
            confirmingDelete ? "opacity-100" : "opacity-0 group-hover:opacity-100"
          }`}
        >
          <button
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation();
              onEdit(task);
            }}
            aria-label="Editar tarea"
            className="rounded-md p-1.5 text-ink-faint hover:bg-paper-deep hover:text-ink dark:hover:bg-night-line dark:hover:text-paper"
          >
            <Pencil className="h-3.5 w-3.5" />
          </button>
          <button
            onPointerDown={(e) => e.stopPropagation()}
            onClick={handleDeleteClick}
            onBlur={() => setConfirmingDelete(false)}
            aria-label={confirmingDelete ? "Confirmar eliminación" : "Eliminar tarea"}
            title={confirmingDelete ? "¿Seguro? Pulsa de nuevo" : "Eliminar tarea"}
            className={`flex items-center gap-1 rounded-md px-1.5 py-1.5 text-[10px] font-bold transition-colors ${
              confirmingDelete
                ? "bg-red-500 text-white hover:bg-red-600"
                : "text-ink-faint hover:bg-red-500/10 hover:text-red-500"
            }`}
          >
            <Trash2 className="h-3.5 w-3.5 shrink-0" />
            {confirmingDelete && "¿Seguro?"}
          </button>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-1.5">
        <span
          className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${PRIORITY_STYLES[task.priority]}`}
        >
          <Flag className="h-2.5 w-2.5" />
          {PRIORITY_META[task.priority].label}
        </span>
        {task.dueDate != null && (
          <span
            className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${
              isOverdue
                ? "bg-red-500/10 text-red-600 dark:text-red-400"
                : "bg-paper-deep text-ink-soft dark:bg-night-line dark:text-ink-faint"
            }`}
          >
            <CalendarClock className="h-2.5 w-2.5" />
            {new Date(task.dueDate).toLocaleDateString("es-ES", {
              day: "numeric",
              month: "short",
            })}
          </span>
        )}
        <span className="ml-auto font-mono text-[10px] text-ink-faint">
          {new Date(task.createdAt).toLocaleDateString("es-ES", {
            day: "numeric",
            month: "short",
          })}
        </span>
      </div>
    </motion.article>
  );
}
