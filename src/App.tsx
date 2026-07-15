import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Plus } from "lucide-react";
import { AuthProvider, useAuth } from "./hooks/useAuth";
import { useTasks } from "./hooks/useTasks";
import { useProjects } from "./hooks/useProjects";
import { STATUS_ORDER } from "./types";
import Login from "./components/Login";
import Header from "./components/Header";
import ProjectTabs from "./components/ProjectTabs";
import Board from "./components/Board";
import Logo from "./components/Logo";

const THEME_KEY = "nextstep.theme";
const PROJECT_KEY = "nextstep.selectedProject";

function Shell() {
  const { user, loading } = useAuth();
  const [dark, setDark] = useState(() => {
    const saved = localStorage.getItem(THEME_KEY);
    if (saved) return saved === "dark";
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  });
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(() =>
    localStorage.getItem(PROJECT_KEY),
  );

  const { tasks, ready: tasksReady, addTask, updateTask, removeTask } = useTasks(user);
  const { projects, ready: projectsReady, addProject, removeProject } = useProjects(user);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    localStorage.setItem(THEME_KEY, dark ? "dark" : "light");
  }, [dark]);

  // Si el proyecto guardado ya no existe (o no hay ninguno seleccionado aún),
  // cae al primero disponible para no dejar el tablero sin flujo activo.
  useEffect(() => {
    if (!projectsReady) return;
    const stillExists = projects.some((p) => p.id === selectedProjectId);
    if (!stillExists) setSelectedProjectId(projects[0]?.id ?? null);
  }, [projects, projectsReady, selectedProjectId]);

  useEffect(() => {
    if (selectedProjectId) localStorage.setItem(PROJECT_KEY, selectedProjectId);
    else localStorage.removeItem(PROJECT_KEY);
  }, [selectedProjectId]);

  async function handleCreateProject(name: string) {
    const id = await addProject(name);
    setSelectedProjectId(id);
  }

  async function handleDeleteProject(id: string) {
    const orphaned = tasks.filter((t) => t.projectId === id);
    await Promise.all(orphaned.map((t) => removeTask(t.id)));
    await removeProject(id);
  }

  if (loading) {
    return (
      <div className="grid min-h-screen place-items-center">
        <motion.span
          animate={{ rotate: 360 }}
          transition={{ duration: 1.1, repeat: Infinity, ease: "linear" }}
          className="grid h-12 w-12 place-items-center"
        >
          <Logo className="h-12 w-12 rounded-2xl" />
        </motion.span>
      </div>
    );
  }

  const selectedProject = projects.find((p) => p.id === selectedProjectId) ?? null;

  return (
    <AnimatePresence mode="wait">
      {!user ? (
        <motion.div key="login" exit={{ opacity: 0, y: -24 }} transition={{ duration: 0.35 }}>
          <Login />
        </motion.div>
      ) : (
        <motion.div
          key="board"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35 }}
          className="grain flex min-h-screen flex-col"
        >
          <Header dark={dark} onToggleDark={() => setDark((d) => !d)} />

          {!projectsReady ? (
            <div className="mx-auto grid w-full max-w-7xl gap-5 px-4 pt-10 sm:px-8 min-[1000px]:grid-cols-3">
              {STATUS_ORDER.map((s) => (
                <div
                  key={s}
                  className="h-64 animate-pulse rounded-3xl bg-paper-deep/60 dark:bg-night-raised/60"
                />
              ))}
            </div>
          ) : projects.length === 0 ? (
            <EmptyProjects onCreate={handleCreateProject} />
          ) : (
            <>
              <ProjectTabs
                projects={projects}
                selectedId={selectedProjectId}
                onSelect={setSelectedProjectId}
                onCreate={handleCreateProject}
                onDelete={handleDeleteProject}
              />
              {selectedProject && (
                <Board
                  user={user}
                  project={selectedProject}
                  tasks={tasks}
                  tasksReady={tasksReady}
                  addTask={addTask}
                  updateTask={updateTask}
                  removeTask={removeTask}
                  search={search}
                  onSearch={setSearch}
                  modalOpen={modalOpen}
                  onOpenModal={() => setModalOpen(true)}
                  onCloseModal={() => setModalOpen(false)}
                />
              )}
            </>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function EmptyProjects({ onCreate }: { onCreate: (name: string) => void }) {
  const [name, setName] = useState("");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    onCreate(trimmed);
    setName("");
  }

  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      >
        <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-ink-faint">
          Empieza aquí
        </p>
        <h2 className="mb-3 font-display text-4xl tracking-tight sm:text-5xl">
          Crea tu primer proyecto
        </h2>
        <p className="mx-auto mb-8 max-w-sm text-sm leading-relaxed text-ink-soft dark:text-ink-faint">
          Cada proyecto tiene su propio flujo: sin completar, en proceso y finalizadas. Las
          tareas nunca se mezclan entre proyectos distintos.
        </p>
        <form onSubmit={submit} className="flex flex-col items-center gap-2 sm:flex-row">
          <input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="p. ej. Web personal"
            className="w-64 rounded-full border border-line bg-surface px-4 py-2.5 text-sm font-semibold outline-none transition-all focus:border-ink focus:ring-2 focus:ring-lime/60 dark:border-night-line dark:bg-night-raised dark:focus:border-paper"
          />
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.96 }}
            type="submit"
            disabled={!name.trim()}
            className="flex items-center gap-1.5 rounded-full bg-ink px-5 py-2.5 text-sm font-bold text-paper shadow-card transition-colors hover:bg-black disabled:opacity-40 dark:bg-lime dark:text-ink dark:hover:bg-lime-deep"
          >
            <Plus className="h-4 w-4" />
            Crear proyecto
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Shell />
    </AuthProvider>
  );
}
