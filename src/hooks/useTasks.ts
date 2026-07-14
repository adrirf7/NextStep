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
import { db, firebaseEnabled } from "../firebase";
import type { AppUser, Task, TaskPriority, TaskStatus } from "../types";

const LOCAL_KEY = "nextstep.tasks";

export interface TaskDraft {
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  projectId: string;
  dueDate: number | null;
}

function readLocal(): Task[] {
  try {
    return JSON.parse(localStorage.getItem(LOCAL_KEY) ?? "[]") as Task[];
  } catch {
    return [];
  }
}

function writeLocal(tasks: Task[]) {
  localStorage.setItem(LOCAL_KEY, JSON.stringify(tasks));
}

/**
 * Con Firebase configurado y usuario real: Firestore en tiempo real
 * (users/{uid}/tasks). En modo demo o invitado: localStorage.
 */
export function useTasks(user: AppUser | null) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [ready, setReady] = useState(false);

  const useCloud = firebaseEnabled && !!db && !!user && !user.isDemo;

  useEffect(() => {
    if (!user) {
      setTasks([]);
      setReady(false);
      return;
    }
    if (!useCloud) {
      setTasks(readLocal());
      setReady(true);
      return;
    }
    const q = query(collection(db!, "users", user.uid, "tasks"));
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
  }, [user, useCloud]);

  const addTask = useCallback(
    async (draft: TaskDraft) => {
      const now = Date.now();
      if (useCloud) {
        await addDoc(collection(db!, "users", user!.uid, "tasks"), {
          ...draft,
          createdAt: now,
          updatedAt: now,
        });
      } else {
        const task: Task = {
          id: crypto.randomUUID(),
          ...draft,
          createdAt: now,
          updatedAt: now,
        };
        setTasks((prev) => {
          const next = [task, ...prev];
          writeLocal(next);
          return next;
        });
      }
    },
    [useCloud, user],
  );

  const updateTask = useCallback(
    async (id: string, patch: Partial<TaskDraft>) => {
      const now = Date.now();
      if (useCloud) {
        await updateDoc(doc(db!, "users", user!.uid, "tasks", id), {
          ...patch,
          updatedAt: now,
        });
      } else {
        setTasks((prev) => {
          const next = prev.map((t) =>
            t.id === id ? { ...t, ...patch, updatedAt: now } : t,
          );
          writeLocal(next);
          return next;
        });
      }
    },
    [useCloud, user],
  );

  const removeTask = useCallback(
    async (id: string) => {
      if (useCloud) {
        await deleteDoc(doc(db!, "users", user!.uid, "tasks", id));
      } else {
        setTasks((prev) => {
          const next = prev.filter((t) => t.id !== id);
          writeLocal(next);
          return next;
        });
      }
    },
    [useCloud, user],
  );

  return { tasks, ready, addTask, updateTask, removeTask };
}
