import { useCallback, useEffect, useState } from "react";
import { addDoc, collection, deleteDoc, doc, onSnapshot, query } from "firebase/firestore";
import { db, firebaseEnabled } from "../firebase";
import type { AppUser, Project } from "../types";
import { PROJECT_COLORS } from "../types";

const LOCAL_KEY = "nextstep.projects";

function readLocal(): Project[] {
  try {
    return JSON.parse(localStorage.getItem(LOCAL_KEY) ?? "[]") as Project[];
  } catch {
    return [];
  }
}

function writeLocal(projects: Project[]) {
  localStorage.setItem(LOCAL_KEY, JSON.stringify(projects));
}

/**
 * Con Firebase configurado y usuario real: Firestore en tiempo real
 * (users/{uid}/projects). En modo demo o invitado: localStorage.
 * No hace cascade-delete de tareas: eso lo coordina quien tenga
 * ambos hooks (useTasks + useProjects) cargados a la vez.
 */
export function useProjects(user: AppUser | null) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [ready, setReady] = useState(false);

  const useCloud = firebaseEnabled && !!db && !!user && !user.isDemo;

  useEffect(() => {
    if (!user) {
      setProjects([]);
      setReady(false);
      return;
    }
    if (!useCloud) {
      setProjects(readLocal());
      setReady(true);
      return;
    }
    const q = query(collection(db!, "users", user.uid, "projects"));
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
  }, [user, useCloud]);

  const addProject = useCallback(
    async (name: string) => {
      const now = Date.now();
      const color = PROJECT_COLORS[projects.length % PROJECT_COLORS.length];
      if (useCloud) {
        const ref = await addDoc(collection(db!, "users", user!.uid, "projects"), {
          name,
          color,
          createdAt: now,
        });
        return ref.id;
      }
      const project: Project = { id: crypto.randomUUID(), name, color, createdAt: now };
      setProjects((prev) => {
        const next = [...prev, project];
        writeLocal(next);
        return next;
      });
      return project.id;
    },
    [useCloud, user, projects.length],
  );

  const removeProject = useCallback(
    async (id: string) => {
      if (useCloud) {
        await deleteDoc(doc(db!, "users", user!.uid, "projects", id));
      } else {
        setProjects((prev) => {
          const next = prev.filter((p) => p.id !== id);
          writeLocal(next);
          return next;
        });
      }
    },
    [useCloud, user],
  );

  return { projects, ready, addProject, removeProject };
}
