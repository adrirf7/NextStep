import { useCallback, useMemo, useState } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { motion } from "framer-motion";
import { Plus, Search } from "lucide-react";
import type { AppUser, Project, SortOption, Task, TaskStatus } from "../types";
import { STATUS_ORDER, compareTasks } from "../types";
import type { TaskDraft } from "../hooks/useTasks";
import Column from "./Column";
import TaskCard from "./TaskCard";
import TaskModal from "./TaskModal";
import TaskDetailModal from "./TaskDetailModal";
import SortMenu from "./SortMenu";

interface Props {
  user: AppUser;
  project: Project;
  tasks: Task[];
  tasksReady: boolean;
  addTask: (draft: TaskDraft) => Promise<void> | void;
  updateTask: (id: string, patch: Partial<TaskDraft>) => Promise<void> | void;
  removeTask: (id: string) => Promise<void> | void;
  search: string;
  onSearch: (value: string) => void;
  modalOpen: boolean;
  onOpenModal: () => void;
  onCloseModal: () => void;
}

function greeting(): string {
  const h = new Date().getHours();
  if (h < 7) return "Buenas noches";
  if (h < 14) return "Buenos días";
  if (h < 21) return "Buenas tardes";
  return "Buenas noches";
}

export default function Board({
  user,
  project,
  tasks,
  tasksReady,
  addTask,
  updateTask,
  removeTask,
  search,
  onSearch,
  modalOpen,
  onOpenModal,
  onCloseModal,
}: Props) {
  const [editing, setEditing] = useState<Task | null>(null);
  const [viewingId, setViewingId] = useState<string | null>(null);
  const [initialStatus, setInitialStatus] = useState<TaskStatus>("todo");
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>("priority-desc");
  const [columnHeights, setColumnHeights] = useState<Record<TaskStatus, number>>({
    todo: 144,
    doing: 144,
    done: 144,
  });

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
  );

  const handleMeasureColumn = useCallback((status: TaskStatus, height: number) => {
    setColumnHeights((prev) => (Math.abs(prev[status] - height) < 1 ? prev : { ...prev, [status]: height }));
  }, []);

  const maxColumnHeight = Math.max(144, ...Object.values(columnHeights));

  // Cada tablero solo ve las tareas de su propio proyecto: nunca se mezclan flujos.
  const projectTasks = useMemo(
    () => tasks.filter((t) => t.projectId === project.id),
    [tasks, project.id],
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return projectTasks;
    return projectTasks.filter(
      (t) => t.title.toLowerCase().includes(q) || t.description.toLowerCase().includes(q),
    );
  }, [projectTasks, search]);

  const byStatus = useMemo(() => {
    const map: Record<TaskStatus, Task[]> = { todo: [], doing: [], done: [] };
    for (const t of filtered) map[t.status]?.push(t);
    for (const s of STATUS_ORDER) {
      map[s].sort((a, b) => compareTasks(a, b, sortBy));
    }
    return map;
  }, [filtered, sortBy]);

  const doneCount = projectTasks.filter((t) => t.status === "done").length;
  const progress = projectTasks.length ? Math.round((doneCount / projectTasks.length) * 100) : 0;

  function handleDragStart(e: DragStartEvent) {
    setActiveTask(projectTasks.find((t) => t.id === e.active.id) ?? null);
  }

  function handleDragEnd(e: DragEndEvent) {
    setActiveTask(null);
    const targetStatus = e.over?.id as TaskStatus | undefined;
    if (!targetStatus || !STATUS_ORDER.includes(targetStatus)) return;
    const task = projectTasks.find((t) => t.id === e.active.id);
    if (task && task.status !== targetStatus) {
      void updateTask(task.id, { status: targetStatus });
    }
  }

  async function handleSave(draft: Omit<TaskDraft, "projectId">, id?: string) {
    if (id) await updateTask(id, draft);
    else await addTask({ ...draft, projectId: project.id });
    setEditing(null);
  }

  function openEdit(task: Task) {
    setEditing(task);
    onOpenModal();
  }

  function openView(task: Task) {
    setViewingId(task.id);
  }

  const viewing = projectTasks.find((t) => t.id === viewingId) ?? null;

  function openNew(status: TaskStatus) {
    setEditing(null);
    setInitialStatus(status);
    onOpenModal();
  }

  const firstName = user.name.split(" ")[0];

  return (
    <main className="mx-auto w-full max-w-7xl flex-1 px-4 pb-16 pt-6 sm:px-8">
      <motion.div
        key={project.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="mb-8"
      >
        <p className="mb-1 flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.18em] text-ink-faint">
          <span className="h-2 w-2 rounded-full" style={{ backgroundColor: project.color }} />
          {new Date().toLocaleDateString("es-ES", {
            weekday: "long",
            day: "numeric",
            month: "long",
          })}
        </p>
        <h1 className="font-display text-4xl tracking-tight sm:text-5xl">
          {greeting()}, <span className="italic">{firstName}</span>
        </h1>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between"
        >
          <div className="flex items-center gap-2">
            <div className="relative min-w-0 flex-1 sm:w-56 sm:flex-none">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-faint" />
              <input
                value={search}
                onChange={(e) => onSearch(e.target.value)}
                placeholder="Buscar tareas…"
                className="w-full rounded-full border border-line bg-surface py-2 pl-10 pr-4 text-sm font-medium outline-none transition-all placeholder:text-ink-faint focus:border-ink focus:ring-2 focus:ring-lime/60 dark:border-night-line dark:bg-night-raised dark:focus:border-paper"
              />
            </div>

            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => openNew("todo")}
              className="flex shrink-0 items-center gap-1.5 rounded-full bg-ink px-4 py-2 text-sm font-bold text-paper shadow-card hover:bg-black dark:bg-lime dark:text-ink dark:hover:bg-lime-deep"
            >
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Nueva tarea</span>
            </motion.button>

            <SortMenu value={sortBy} onChange={setSortBy} />
          </div>

          <div className="w-full sm:w-64">
            <div className="mb-1.5 flex items-baseline justify-between text-xs font-semibold">
              <span className="text-ink-soft dark:text-ink-faint">
                {doneCount} de {projectTasks.length} completadas
              </span>
              <motion.span
                key={progress}
                initial={{ scale: 1.3 }}
                animate={{ scale: 1 }}
                className="font-mono text-sm font-bold"
              >
                {progress}%
              </motion.span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-paper-deep dark:bg-night-line">
              <motion.div
                className="h-full rounded-full bg-lime-deep"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ type: "spring", stiffness: 80, damping: 20 }}
              />
            </div>
          </div>
        </motion.div>
      </motion.div>

      {!tasksReady ? (
        <div className="grid gap-5 md:grid-cols-3">
          {STATUS_ORDER.map((s) => (
            <div
              key={s}
              className="h-64 animate-pulse rounded-3xl bg-paper-deep/60 dark:bg-night-raised/60"
            />
          ))}
        </div>
      ) : (
        <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
          <div className="grid items-stretch gap-5 md:grid-cols-3">
            {STATUS_ORDER.map((status, i) => (
              <Column
                key={status}
                status={status}
                index={i}
                tasks={byStatus[status]}
                maxHeight={maxColumnHeight}
                onMeasure={handleMeasureColumn}
                onView={openView}
                onEdit={openEdit}
                onDelete={(id) => void removeTask(id)}
                onAdd={openNew}
              />
            ))}
          </div>
          <DragOverlay dropAnimation={{ duration: 220 }}>
            {activeTask && (
              <TaskCard task={activeTask} onEdit={() => {}} onDelete={() => {}} overlay />
            )}
          </DragOverlay>
        </DndContext>
      )}

      <TaskModal
        open={modalOpen}
        editing={editing}
        initialStatus={initialStatus}
        projectName={project.name}
        projectColor={project.color}
        onClose={() => {
          onCloseModal();
          setEditing(null);
        }}
        onSave={handleSave}
      />

      <TaskDetailModal
        task={viewing}
        projectName={project.name}
        projectColor={project.color}
        onClose={() => setViewingId(null)}
        onEdit={openEdit}
        onDelete={(id) => void removeTask(id)}
        onPriorityChange={(id, priority) => void updateTask(id, { priority })}
      />
    </main>
  );
}
