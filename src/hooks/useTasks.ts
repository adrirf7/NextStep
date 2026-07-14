import { useCallback, useEffect, useState } from "react";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  updateDoc,
} from "firebase/firestore";
import { db } from "../firebase";
import type { AppUser, Task, TaskPriority, TaskStatus } from "../types";

export interface TaskDraft {
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  projectId: string;
  dueDate: number | null;
}

/** Firestore en tiempo real (users/{uid}/tasks). */
export function useTasks(user: AppUser | null) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!user || !db) {
      setTasks([]);
      setReady(false);
      return;
    }
    const q = query(collection(db, "users", user.uid, "tasks"));
    const unsub = onSnapshot(
      q,
      (snap) => {
        const next: Task[] = snap.docs.map((d) => ({
          id: d.id,
          ...(d.data() as Omit<Task, "id">),
        }));
        setTasks(next);
        setReady(true);
      },
      (error) => {
        console.error("No se pudieron leer las tareas de Firestore:", error);
        setReady(true);
      },
    );
    return unsub;
  }, [user]);

  const addTask = useCallback(
    async (draft: TaskDraft) => {
      if (!user || !db) return;
      const now = Date.now();
      await addDoc(collection(db, "users", user.uid, "tasks"), {
        ...draft,
        createdAt: now,
        updatedAt: now,
      });
    },
    [user],
  );

  const updateTask = useCallback(
    async (id: string, patch: Partial<TaskDraft>) => {
      if (!user || !db) return;
      await updateDoc(doc(db, "users", user.uid, "tasks", id), {
        ...patch,
        updatedAt: Date.now(),
      });
    },
    [user],
  );

  const removeTask = useCallback(
    async (id: string) => {
      if (!user || !db) return;
      await deleteDoc(doc(db, "users", user.uid, "tasks", id));
    },
    [user],
  );

  return { tasks, ready, addTask, updateTask, removeTask };
}
