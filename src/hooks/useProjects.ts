import { useCallback, useEffect, useState } from "react";
import { addDoc, collection, deleteDoc, doc, onSnapshot, query, updateDoc } from "firebase/firestore";
import { db } from "../firebase";
import type { AppUser, Project } from "../types";
import { PROJECT_COLORS } from "../types";

/**
 * Firestore en tiempo real (users/{uid}/projects).
 * No hace cascade-delete de tareas: eso lo coordina quien tenga
 * ambos hooks (useTasks + useProjects) cargados a la vez.
 */
export function useProjects(user: AppUser | null) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!user || !db) {
      setProjects([]);
      setReady(false);
      return;
    }
    const q = query(collection(db, "users", user.uid, "projects"));
    const unsub = onSnapshot(
      q,
      (snap) => {
        const next: Project[] = snap.docs
          .map((d) => ({ id: d.id, ...(d.data() as Omit<Project, "id">) }))
          .sort((a, b) => a.createdAt - b.createdAt);
        setProjects(next);
        setReady(true);
      },
      (error) => {
        console.error("No se pudieron leer los proyectos de Firestore:", error);
        setReady(true);
      },
    );
    return unsub;
  }, [user]);

  const addProject = useCallback(
    async (name: string) => {
      if (!user || !db) return "";
      const now = Date.now();
      const color = PROJECT_COLORS[projects.length % PROJECT_COLORS.length];
      const ref = await addDoc(collection(db, "users", user.uid, "projects"), {
        name,
        color,
        createdAt: now,
      });
      return ref.id;
    },
    [user, projects.length],
  );

  const renameProject = useCallback(
    async (id: string, name: string) => {
      if (!user || !db) return;
      await updateDoc(doc(db, "users", user.uid, "projects", id), { name });
    },
    [user],
  );

  const removeProject = useCallback(
    async (id: string) => {
      if (!user || !db) return;
      await deleteDoc(doc(db, "users", user.uid, "projects", id));
    },
    [user],
  );

  return { projects, ready, addProject, renameProject, removeProject };
}
