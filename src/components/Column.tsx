import { useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useDroppable } from "@dnd-kit/core";
import { Circle, CircleCheck, CircleDot, Eye, Inbox } from "lucide-react";
import type { Task, TaskStatus } from "../types";
import { STATUS_META } from "../types";
import TaskCard from "./TaskCard";

const STATUS_ICON: Record<TaskStatus, typeof Circle> = {
  todo: Circle,
  doing: CircleDot,
  review: Eye,
  done: CircleCheck,
};

const STATUS_ACCENT: Record<TaskStatus, string> = {
  todo: "text-ink-faint",
  doing: "text-amber-flow",
  review: "text-blue-500",
  done: "text-green-done",
};

interface Props {
  status: TaskStatus;
  tasks: Task[];
  index: number;
  maxHeight: number;
  onMeasure: (status: TaskStatus, height: number) => void;
  onMeasurePosition: (status: TaskStatus, centerX: number) => void;
  onView: (task: Task) => void;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  onAdd: (status: TaskStatus) => void;
}

export default function Column({
  status,
  tasks,
  index,
  maxHeight,
  onMeasure,
  onMeasurePosition,
  onView,
  onEdit,
  onDelete,
  onAdd,
}: Props) {
  // El droppable cubre TODA la columna (toda la celda del grid), no solo
  // la caja visible, para poder soltar aunque estés por debajo de ella.
  const { setNodeRef, isOver } = useDroppable({ id: status });
  const sectionRef = useRef<HTMLElement>(null);
  const boxRef = useRef<HTMLDivElement>(null);
  const Icon = STATUS_ICON[status];

  function setSectionRefs(node: HTMLElement | null) {
    setNodeRef(node);
    sectionRef.current = node;
  }

  // Mide el tamaño natural (sin expandir) de la caja visible para que el
  // resto pueda crecer hasta igualar a la más alta.
  useEffect(() => {
    const el = boxRef.current;
    if (!el || isOver) return;
    const ro = new ResizeObserver(() => {
      if (boxRef.current) onMeasure(status, boxRef.current.offsetHeight);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [status, onMeasure, isOver]);

  // Posición horizontal de la columna, para poder colocar el aviso de
  // "sobre qué columna estás" justo encima de la columna correspondiente.
  useEffect(() => {
    function measure() {
      const el = sectionRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      onMeasurePosition(status, rect.left + rect.width / 2);
    }
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [status, onMeasurePosition]);

  return (
    <motion.section
      ref={setSectionRefs}
      initial={{ opacity: 0, y: 28 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 + index * 0.12, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="flex min-w-0 flex-col"
    >
      <header className="mb-3 flex items-center gap-2 px-1">
        <Icon className={`h-4 w-4 ${STATUS_ACCENT[status]}`} />
        <h2 className="font-display text-xl tracking-tight">{STATUS_META[status].label}</h2>
        <motion.span
          key={tasks.length}
          initial={{ scale: 1.4 }}
          animate={{ scale: 1 }}
          className="rounded-full bg-paper-deep px-2 py-0.5 font-mono text-xs font-semibold text-ink-soft dark:bg-night-line dark:text-ink-faint"
        >
          {tasks.length}
        </motion.span>
        <button
          onClick={() => onAdd(status)}
          className="ml-auto rounded-full px-2.5 py-0.5 text-lg leading-none text-ink-faint transition-colors hover:bg-paper-deep hover:text-ink dark:hover:bg-night-line dark:hover:text-paper"
          aria-label={`Añadir tarea en ${STATUS_META[status].label}`}
        >
          +
        </button>
      </header>

      <div
        ref={boxRef}
        style={isOver ? { minHeight: maxHeight } : undefined}
        className={`relative flex min-h-36 flex-col gap-3 rounded-3xl border-2 p-3 transition-[min-height,background-color,border-color] duration-300 ease-out ${
          isOver
            ? "border-lime-deep bg-lime/10 dark:bg-lime/5"
            : "border-transparent bg-paper-deep/50 dark:bg-night-raised/40"
        }`}
      >
        <AnimatePresence mode="popLayout">
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onView={onView}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </AnimatePresence>

        {/* Posicionado encima, sin ocupar espacio en el flujo, para que nunca
            compita por altura con una tarjeta que todavía se está yendo. */}
        <AnimatePresence>
          {tasks.length === 0 && (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ delay: 0.15 }}
              className="absolute inset-3 flex flex-col items-center justify-center gap-1.5 rounded-2xl text-ink-faint"
            >
              <Inbox className="h-5 w-5 opacity-50" />
              <p className="text-xs font-medium">
                {isOver ? "Suelta aquí" : "Sin tareas todavía"}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.section>
  );
}
