import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, ChevronDown, MoreVertical, Pencil, Plus, Trash2, X } from "lucide-react";
import type { Project } from "../types";
import { useMediaQuery } from "../hooks/useMediaQuery";

interface Props {
  projects: Project[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onCreate: (name: string) => void;
  onRename: (id: string, name: string) => void;
  onDelete: (id: string) => void;
}

interface ChipProps {
  project: Project;
  active: boolean;
  onSelect: () => void;
  onRename: (name: string) => void;
  onDelete: () => void;
}

function ProjectChip({ project, active, onSelect, onRename, onDelete }: ChipProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [renaming, setRenaming] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [name, setName] = useState(project.name);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
        setConfirmingDelete(false);
      }
    }
    if (menuOpen) document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [menuOpen]);

  function submitRename(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = name.trim();
    setRenaming(false);
    if (trimmed && trimmed !== project.name) onRename(trimmed);
    else setName(project.name);
  }

  if (renaming) {
    return (
      <motion.form layout onSubmit={submitRename} className="flex shrink-0 items-center gap-1">
        <input
          autoFocus
          value={name}
          onChange={(e) => setName(e.target.value)}
          onFocus={(e) => e.target.select()}
          onBlur={submitRename}
          onKeyDown={(e) => {
            if (e.key === "Escape") {
              setName(project.name);
              setRenaming(false);
            }
          }}
          className="w-40 max-w-[60vw] rounded-full border border-ink bg-surface px-3.5 py-1.5 text-sm font-bold outline-none focus:ring-2 focus:ring-lime/60 dark:border-paper dark:bg-night-raised"
        />
      </motion.form>
    );
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      className={`group flex shrink-0 items-center rounded-full border py-1.5 pl-3.5 pr-3.5 text-sm font-bold transition-[color,background-color,border-color,padding] duration-200 min-[1000px]:hover:pr-1.5 ${
        active
          ? "border-ink bg-ink text-paper dark:border-lime dark:bg-lime dark:text-ink"
          : "border-line bg-surface text-ink-soft hover:border-ink/40 hover:text-ink dark:border-night-line dark:bg-night-raised dark:text-ink-faint dark:hover:text-paper"
      }`}
    >
      <motion.button
        type="button"
        whileTap={{ scale: 0.96 }}
        onClick={onSelect}
        className="flex shrink-0 items-center gap-2"
      >
        <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: project.color }} />
        {project.name}
      </motion.button>

      <div ref={menuRef} className="relative shrink-0">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setMenuOpen((o) => !o);
          }}
          aria-label={`Opciones de ${project.name}`}
          className={`grid h-6 shrink-0 place-items-center overflow-hidden rounded-full opacity-60 transition-all duration-200 ${
            menuOpen
              ? "ml-1 w-6 opacity-100"
              : `ml-1 w-6 min-[1000px]:ml-0 min-[1000px]:w-0 min-[1000px]:opacity-0 min-[1000px]:group-hover:ml-1 min-[1000px]:group-hover:w-6 min-[1000px]:group-hover:opacity-100 ${
                  active ? "hover:bg-paper/20" : "hover:bg-paper-deep dark:hover:bg-night-line"
                }`
          }`}
        >
          <MoreVertical className="h-3.5 w-3.5 shrink-0" />
        </button>

        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.96 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 top-full z-20 mt-2 w-44 overflow-hidden rounded-2xl border border-line bg-surface p-1.5 text-left shadow-lift dark:border-night-line dark:bg-night-raised"
            >
              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  setRenaming(true);
                }}
                className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-ink-soft transition-colors hover:bg-paper-deep hover:text-ink dark:text-ink-faint dark:hover:bg-night-line dark:hover:text-paper"
              >
                <Pencil className="h-3.5 w-3.5 shrink-0" />
                Renombrar
              </button>
              <button
                type="button"
                onClick={() => {
                  if (confirmingDelete) {
                    onDelete();
                    setMenuOpen(false);
                    setConfirmingDelete(false);
                  } else {
                    setConfirmingDelete(true);
                  }
                }}
                className={`flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold transition-colors ${
                  confirmingDelete
                    ? "bg-red-500 text-white hover:bg-red-600"
                    : "text-ink-soft hover:bg-red-500/10 hover:text-red-500 dark:text-ink-faint"
                }`}
              >
                {confirmingDelete ? (
                  <Check className="h-3.5 w-3.5 shrink-0" />
                ) : (
                  <Trash2 className="h-3.5 w-3.5 shrink-0" />
                )}
                {confirmingDelete ? "¿Seguro? Confirmar" : "Eliminar"}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

interface MobileRowProps {
  project: Project;
  active: boolean;
  onSelect: () => void;
  onRename: (name: string) => void;
  onDelete: () => void;
}

function MobileProjectRow({ project, active, onSelect, onRename, onDelete }: MobileRowProps) {
  const [renaming, setRenaming] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [name, setName] = useState(project.name);

  function submitRename(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = name.trim();
    setRenaming(false);
    if (trimmed && trimmed !== project.name) onRename(trimmed);
    else setName(project.name);
  }

  if (renaming) {
    return (
      <form onSubmit={submitRename} className="px-1 py-1">
        <input
          autoFocus
          value={name}
          onChange={(e) => setName(e.target.value)}
          onFocus={(e) => e.target.select()}
          onBlur={submitRename}
          onKeyDown={(e) => {
            if (e.key === "Escape") {
              setName(project.name);
              setRenaming(false);
            }
          }}
          className="w-full rounded-xl border border-ink bg-surface px-3 py-3 text-base font-bold outline-none focus:ring-2 focus:ring-lime/60 dark:border-paper dark:bg-night-raised"
        />
      </form>
    );
  }

  return (
    <div
      className={`flex min-w-0 items-center rounded-xl ${
        active ? "bg-ink text-paper dark:bg-lime dark:text-ink" : ""
      }`}
    >
      <button
        type="button"
        onClick={onSelect}
        className={`flex min-w-0 flex-1 items-center gap-3 rounded-xl px-3 py-3.5 text-left text-base font-bold ${
          active ? "" : "text-ink dark:text-paper"
        }`}
      >
        <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: project.color }} />
        <span className="flex-1 truncate">{project.name}</span>
      </button>

      <button
        type="button"
        onClick={() => setRenaming(true)}
        aria-label={`Renombrar ${project.name}`}
        className={`mr-0.5 grid h-10 w-10 shrink-0 place-items-center rounded-full ${
          active
            ? "text-paper/70 hover:bg-paper/20 hover:text-paper dark:text-ink/60 dark:hover:bg-ink/10 dark:hover:text-ink"
            : "text-ink-faint hover:bg-paper-deep hover:text-ink dark:hover:bg-night-line dark:hover:text-paper"
        }`}
      >
        <Pencil className="h-4 w-4" />
      </button>
      <button
        type="button"
        onClick={() => {
          if (confirmingDelete) {
            onDelete();
            setConfirmingDelete(false);
          } else {
            setConfirmingDelete(true);
            window.setTimeout(() => setConfirmingDelete(false), 2500);
          }
        }}
        aria-label={`Eliminar ${project.name}`}
        className={`mr-1 grid h-10 shrink-0 place-items-center rounded-full transition-all ${
          confirmingDelete
            ? "w-auto gap-1 bg-red-500 px-3 text-xs font-bold text-white"
            : `w-10 ${
                active
                  ? "text-paper/70 hover:bg-paper/20 hover:text-paper dark:text-ink/60 dark:hover:bg-ink/10 dark:hover:text-ink"
                  : "text-ink-faint hover:bg-red-500/10 hover:text-red-500"
              }`
        }`}
      >
        <Trash2 className="h-4 w-4 shrink-0" />
        {confirmingDelete && "¿Seguro?"}
      </button>
    </div>
  );
}

function MobileProjectMenu({ projects, selectedId, onSelect, onCreate, onRename, onDelete }: Props) {
  const [open, setOpen] = useState(false);
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState("");
  const ref = useRef<HTMLDivElement>(null);
  const selected = projects.find((p) => p.id === selectedId) ?? null;

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        setAdding(false);
      }
    }
    if (open) document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [open]);

  function submitNew(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = newName.trim();
    setAdding(false);
    setNewName("");
    if (trimmed) onCreate(trimmed);
  }

  return (
    <div ref={ref} className="relative mx-auto max-w-7xl px-4 pb-1 pt-6 sm:px-8">
      <motion.button
        type="button"
        whileTap={{ scale: 0.98 }}
        onClick={() => setOpen((o) => !o)}
        className={`flex w-full items-center gap-2.5 rounded-2xl border bg-surface px-4 py-3 text-left transition-colors dark:bg-night-raised ${
          open ? "border-ink dark:border-paper" : "border-line dark:border-night-line"
        }`}
      >
        {selected && (
          <span
            className="h-2.5 w-2.5 shrink-0 rounded-full"
            style={{ backgroundColor: selected.color }}
          />
        )}
        <span className="flex-1 truncate text-sm font-bold">
          {selected?.name ?? "Selecciona un proyecto"}
        </span>
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-ink-faint transition-transform ${open ? "rotate-180" : ""}`}
        />
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className="absolute -left-6 -right-6 top-full z-30 mt-2 max-h-[65vh] overflow-y-auto rounded-2xl border border-line bg-surface p-2 shadow-lift dark:border-night-line dark:bg-night-raised sm:-left-10 sm:-right-10"
          >
            {projects.map((p) => (
              <MobileProjectRow
                key={p.id}
                project={p}
                active={p.id === selectedId}
                onSelect={() => {
                  onSelect(p.id);
                  setOpen(false);
                }}
                onRename={(name) => onRename(p.id, name)}
                onDelete={() => onDelete(p.id)}
              />
            ))}

            <div className="mt-1 border-t border-line pt-1 dark:border-night-line">
              {adding ? (
                <form onSubmit={submitNew} className="flex items-center gap-1.5 px-1 py-1">
                  <input
                    autoFocus
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    onBlur={() => {
                      if (!newName.trim()) setAdding(false);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Escape") {
                        setAdding(false);
                        setNewName("");
                      }
                    }}
                    placeholder="Nombre del proyecto…"
                    className="w-full rounded-xl border border-ink bg-paper px-3 py-2.5 text-sm font-semibold outline-none focus:ring-2 focus:ring-lime/60 dark:border-paper dark:bg-night"
                  />
                  <button
                    type="submit"
                    aria-label="Crear proyecto"
                    className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-ink text-paper dark:bg-lime dark:text-ink"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </form>
              ) : (
                <button
                  type="button"
                  onClick={() => setAdding(true)}
                  className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-sm font-bold text-ink-faint hover:bg-paper-deep hover:text-ink dark:hover:bg-night-line dark:hover:text-paper"
                >
                  <Plus className="h-4 w-4" />
                  Nuevo proyecto
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function ProjectTabs(props: Props) {
  const { projects, selectedId, onSelect, onCreate, onRename, onDelete } = props;
  const isMobile = useMediaQuery("(max-width: 999px)");
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState("");

  if (isMobile) {
    return <MobileProjectMenu {...props} />;
  }

  function submitNew(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = name.trim();
    setAdding(false);
    setName("");
    if (trimmed) onCreate(trimmed);
  }

  return (
    <nav className="mx-auto flex max-w-7xl flex-wrap items-center gap-2 px-4 pb-1 pt-6 sm:px-8">
      {projects.map((p) => (
        <ProjectChip
          key={p.id}
          project={p}
          active={p.id === selectedId}
          onSelect={() => onSelect(p.id)}
          onRename={(name) => onRename(p.id, name)}
          onDelete={() => onDelete(p.id)}
        />
      ))}

      <AnimatePresence mode="wait">
        {adding ? (
          <motion.form
            key="form"
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: "auto" }}
            exit={{ opacity: 0, width: 0 }}
            onSubmit={submitNew}
            className="flex shrink-0 items-center gap-1 overflow-hidden"
          >
            <input
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              onBlur={() => {
                if (!name.trim()) setAdding(false);
              }}
              onKeyDown={(e) => {
                if (e.key === "Escape") {
                  setAdding(false);
                  setName("");
                }
              }}
              placeholder="Nombre del proyecto…"
              className="w-44 max-w-[60vw] rounded-full border border-ink bg-surface px-3.5 py-1.5 text-sm font-semibold outline-none focus:ring-2 focus:ring-lime/60 dark:border-paper dark:bg-night-raised"
            />
            <button
              type="submit"
              aria-label="Crear proyecto"
              className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-ink text-paper dark:bg-lime dark:text-ink"
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => {
                setAdding(false);
                setName("");
              }}
              aria-label="Cancelar"
              className="grid h-7 w-7 shrink-0 place-items-center rounded-full text-ink-faint hover:bg-paper-deep dark:hover:bg-night-line"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </motion.form>
        ) : (
          <motion.button
            key="button"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.94 }}
            onClick={() => setAdding(true)}
            className="flex shrink-0 items-center gap-1 rounded-full border border-dashed border-line px-3.5 py-1.5 text-sm font-bold text-ink-faint transition-colors hover:border-ink hover:text-ink dark:border-night-line dark:hover:border-paper dark:hover:text-paper"
          >
            <Plus className="h-3.5 w-3.5" />
            Proyecto
          </motion.button>
        )}
      </AnimatePresence>
    </nav>
  );
}
