export type TaskStatus = "todo" | "doing" | "done";
export type TaskPriority = "low" | "medium" | "high";

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  projectId: string;
  dueDate: number | null;
  createdAt: number;
  updatedAt: number;
}

export interface Project {
  id: string;
  name: string;
  color: string;
  createdAt: number;
}

export const PROJECT_COLORS = [
  "#C9E520",
  "#F59E0B",
  "#E4572E",
  "#0F9B8E",
  "#3B82F6",
  "#8B5CF6",
  "#EC4899",
  "#16A34A",
];

export interface AppUser {
  uid: string;
  name: string;
  email: string | null;
  photoURL: string | null;
}

export const STATUS_META: Record<
  TaskStatus,
  { label: string; hint: string }
> = {
  todo: { label: "Sin completar", hint: "Por hacer" },
  doing: { label: "En proceso", hint: "En proceso" },
  done: { label: "Finalizadas", hint: "Completado" },
};

export const STATUS_ORDER: TaskStatus[] = ["todo", "doing", "done"];

export const PRIORITY_META: Record<TaskPriority, { label: string }> = {
  low: { label: "Baja" },
  medium: { label: "Media" },
  high: { label: "Alta" },
};

export type SortOption =
  | "created-desc"
  | "created-asc"
  | "priority-desc"
  | "priority-asc"
  | "due-asc"
  | "due-desc";

export const SORT_OPTIONS: SortOption[] = [
  "created-desc",
  "created-asc",
  "priority-desc",
  "priority-asc",
  "due-asc",
  "due-desc",
];

export const SORT_META: Record<SortOption, { label: string }> = {
  "created-desc": { label: "Más recientes primero" },
  "created-asc": { label: "Más antiguas primero" },
  "priority-desc": { label: "Prioridad: alta → baja" },
  "priority-asc": { label: "Prioridad: baja → alta" },
  "due-asc": { label: "Fecha límite: próxima primero" },
  "due-desc": { label: "Fecha límite: lejana primero" },
};

const PRIORITY_RANK: Record<TaskPriority, number> = { low: 0, medium: 1, high: 2 };

// Las tareas sin fecha límite siempre quedan al final, sea cual sea la dirección.
function compareDue(a: Task, b: Task, ascending: boolean): number {
  if (a.dueDate == null && b.dueDate == null) return 0;
  if (a.dueDate == null) return 1;
  if (b.dueDate == null) return -1;
  return ascending ? a.dueDate - b.dueDate : b.dueDate - a.dueDate;
}

export function compareTasks(a: Task, b: Task, sortBy: SortOption): number {
  switch (sortBy) {
    case "created-desc":
      return b.createdAt - a.createdAt;
    case "created-asc":
      return a.createdAt - b.createdAt;
    case "priority-desc":
      return PRIORITY_RANK[b.priority] - PRIORITY_RANK[a.priority] || compareDue(a, b, true);
    case "priority-asc":
      return PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority] || compareDue(a, b, true);
    case "due-asc":
      return compareDue(a, b, true);
    case "due-desc":
      return compareDue(a, b, false);
  }
}
