import { motion } from "framer-motion";
import { LogOut, Moon, Sun } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import Logo from "./Logo";

interface Props {
  dark: boolean;
  onToggleDark: () => void;
}

export default function Header({ dark, onToggleDark }: Props) {
  const { user, signOut, demoMode } = useAuth();

  return (
    <motion.header
      initial={{ y: -24, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="sticky top-0 z-40 border-b border-line bg-paper/80 backdrop-blur-xl dark:border-night-line dark:bg-night/80"
    >
      <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3 sm:px-8">
        <div className="flex shrink-0 items-center gap-2.5">
          <Logo className="h-8 w-8 rounded-lg" />
          <span className="hidden text-base font-extrabold tracking-tight sm:block">
            NextStep
          </span>
          {(demoMode || user?.isDemo) && (
            <span className="rounded-full bg-lime px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-ink">
              demo
            </span>
          )}
        </div>

        <div className="ml-auto flex shrink-0 items-center gap-2">
          <motion.button
            whileHover={{ rotate: 20, scale: 1.08 }}
            whileTap={{ scale: 0.9 }}
            onClick={onToggleDark}
            aria-label="Cambiar tema"
            className="grid h-9 w-9 place-items-center rounded-full border border-line bg-surface text-ink-soft hover:text-ink dark:border-night-line dark:bg-night-raised dark:text-ink-faint dark:hover:text-paper"
          >
            {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </motion.button>

          <div className="flex items-center gap-2 border-l border-line pl-3 dark:border-night-line">
            {user?.photoURL ? (
              <img
                src={user.photoURL}
                alt={user.name}
                referrerPolicy="no-referrer"
                className="h-8 w-8 rounded-full ring-2 ring-lime"
              />
            ) : (
              <span className="grid h-8 w-8 place-items-center rounded-full bg-lime text-sm font-extrabold text-ink">
                {user?.name.charAt(0).toUpperCase()}
              </span>
            )}
            <motion.button
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.9 }}
              onClick={signOut}
              aria-label="Cerrar sesión"
              className="grid h-9 w-9 place-items-center rounded-full text-ink-faint transition-colors hover:bg-surface hover:text-ink dark:hover:bg-night-raised dark:hover:text-paper"
            >
              <LogOut className="h-4 w-4" />
            </motion.button>
          </div>
        </div>
      </div>
    </motion.header>
  );
}
