import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Plus, Sparkles } from "lucide-react";
import { AuthProvider, useAuth } from "./hooks/useAuth";
import { useTasks, type TaskDraft } from "./hooks/useTasks";
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

  // TEMPORAL: genera proyectos y tareas de ejemplo para hacer capturas.
  async function seedDemoData() {
    const now = Date.now();
    const day = 86400000;

    const webId = await addProject("Rediseño Web");
    const appId = await addProject("App Móvil Fitly");

    const webTasks: Omit<TaskDraft, "projectId">[] = [
      {
        title: "Definir paleta de colores",
        description: "Elegir la paleta final basada en el moodboard del cliente.",
        status: "done",
        priority: "low",
        dueDate: null,
      },
      {
        title: "Wireframes de la home",
        description: "Estructura de bloques para escritorio y móvil.",
        status: "done",
        priority: "medium",
        dueDate: null,
      },
      {
        title: "Maquetar página de precios",
        description: "Adaptar el diseño de Figma a componentes React.",
        status: "doing",
        priority: "high",
        dueDate: now + 3 * day,
      },
      {
        title: "Revisar accesibilidad del formulario de contacto",
        description: "Comprobar contraste, foco visible y etiquetas ARIA.",
        status: "doing",
        priority: "medium",
        dueDate: null,
      },
      {
        title: "Optimizar imágenes para producción",
        description: "Convertir a WebP y comprimir los assets más pesados.",
        status: "todo",
        priority: "low",
        dueDate: null,
      },
      {
        title: "Escribir copy de la sección FAQ",
        description: "Redactar 8 preguntas frecuentes junto al equipo de soporte.",
        status: "todo",
        priority: "medium",
        dueDate: now + 7 * day,
      },
    ];

    const appTasks: Omit<TaskDraft, "projectId">[] = [
      {
        title: "Configurar CI/CD",
        description: "Pipeline de build y despliegue automático en cada PR.",
        status: "done",
        priority: "high",
        dueDate: null,
      },
      {
        title: "Diseñar onboarding",
        description: "Tres pantallas de bienvenida con animaciones.",
        status: "done",
        priority: "medium",
        dueDate: null,
      },
      {
        title: "Integrar notificaciones push",
        description: "Configurar Firebase Cloud Messaging para recordatorios.",
        status: "doing",
        priority: "high",
        dueDate: now + 1 * day,
      },
      {
        title: "Testear login con Apple",
        description: "Verificar el flujo completo en un dispositivo físico.",
        status: "doing",
        priority: "low",
        dueDate: null,
      },
      {
        title: "Publicar beta en TestFlight",
        description: "Subir el build 1.0.0-beta y añadir testers internos.",
        status: "todo",
        priority: "high",
        dueDate: now + 5 * day,
      },
      {
        title: "Recoger feedback de usuarios beta",
        description: "Crear un formulario corto y agendar 5 entrevistas.",
        status: "todo",
        priority: "medium",
        dueDate: null,
      },
    ];

    for (const t of webTasks) await addTask({ ...t, projectId: webId });
    for (const t of appTasks) await addTask({ ...t, projectId: appId });

    setSelectedProjectId(webId);
  }

  // TEMPORAL: añade tareas extra a proyectos ya existentes (sin duplicar proyectos).
  async function addExtraDemoTasks() {
    const web = projects.find((p) => p.name === "Rediseño Web");
    const app = projects.find((p) => p.name === "App Móvil Fitly");
    const now = Date.now();
    const day = 86400000;

    if (web) {
      const extra: Omit<TaskDraft, "projectId">[] = [
        {
          title: "Auditar SEO técnico",
          description: "Revisar metaetiquetas, sitemap y velocidad de carga.",
          status: "todo",
          priority: "medium",
          dueDate: null,
        },
        {
          title: "Configurar analítica",
          description: "Instalar Google Analytics 4 y eventos personalizados.",
          status: "todo",
          priority: "low",
          dueDate: null,
        },
        {
          title: "Preparar entorno de staging",
          description: "Desplegar una rama de pruebas antes de producción.",
          status: "doing",
          priority: "high",
          dueDate: now + 2 * day,
        },
      ];
      for (const t of extra) await addTask({ ...t, projectId: web.id });
    }

    if (app) {
      await addTask({
        title: "Revisar rendimiento con Flipper",
        description: "Detectar renders innecesarios en las pantallas principales.",
        status: "todo",
        priority: "low",
        dueDate: null,
        projectId: app.id,
      });
    }
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

          {import.meta.env.DEV && (
            <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end gap-2">
              <button
                onClick={() => void addExtraDemoTasks()}
                className="flex items-center gap-1.5 rounded-full bg-amber-500 px-4 py-2 text-xs font-bold text-white shadow-lift"
              >
                <Sparkles className="h-3.5 w-3.5" />
                Añadir tareas extra (temporal)
              </button>
              <button
                onClick={() => void seedDemoData()}
                className="flex items-center gap-1.5 rounded-full bg-red-500 px-4 py-2 text-xs font-bold text-white shadow-lift"
              >
                <Sparkles className="h-3.5 w-3.5" />
                Sembrar datos de ejemplo (temporal)
              </button>
            </div>
          )}

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
          Cada proyecto tiene su propio flujo. Las
          tareas nunca se mezclan entre proyectos distintos.
        </p>
        <form onSubmit={submit} className="flex flex-col items-center gap-2 sm:flex-row">
          <input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nombre del proyecto"
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
