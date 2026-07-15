import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { CircleDashed, Loader2 } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { firebaseEnabled } from "../firebase";
import Logo from "./Logo";

const WORDS = ["Planifica.", "Avanza.", "Termina."];

const MARQUEE_ITEMS = [
  "Sin completar",
  "En proceso",
  "Finalizadas",
  "Arrastra y suelta",
  "Tiempo real",
  "Tus proyectos",
];

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden>
      <path
        fill="#4285F4"
        d="M23.5 12.27c0-.85-.08-1.66-.22-2.45H12v4.64h6.45a5.52 5.52 0 0 1-2.39 3.62v3h3.87c2.26-2.09 3.57-5.17 3.57-8.81Z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.96-1.07 7.93-2.91l-3.87-3c-1.07.72-2.44 1.14-4.06 1.14-3.12 0-5.77-2.11-6.71-4.95H1.29v3.09A12 12 0 0 0 12 24Z"
      />
      <path
        fill="#FBBC05"
        d="M5.29 14.28a7.2 7.2 0 0 1 0-4.56V6.63H1.29a12 12 0 0 0 0 10.74l4-3.09Z"
      />
      <path
        fill="#EA4335"
        d="M12 4.77c1.76 0 3.34.6 4.58 1.79l3.44-3.44C17.95 1.19 15.24 0 12 0A12 12 0 0 0 1.29 6.63l4 3.09C6.23 6.88 8.88 4.77 12 4.77Z"
      />
    </svg>
  );
}

export default function Login() {
  const { signInWithGoogle, redirectError } = useAuth();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (redirectError) {
      setError(`No se pudo completar el inicio de sesión (${redirectError}).`);
    }
  }, [redirectError]);

  async function handleGoogle() {
    if (!firebaseEnabled) {
      setError("Firebase aún no está configurado: añade tus claves en .env.local");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await signInWithGoogle();
    } catch (e) {
      const code = (e as { code?: string }).code ?? "";
      console.error("Error al iniciar sesión con Google:", e);
      if (code !== "auth/popup-closed-by-user" && code !== "auth/cancelled-popup-request") {
        setError(`No se pudo iniciar sesión con Google (${code || "error desconocido"}).`);
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="grain relative flex min-h-screen flex-col overflow-hidden">
      {/* Halo decorativo */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -top-40 left-1/2 h-[34rem] w-[34rem] -translate-x-1/2 rounded-full bg-lime/40 blur-[140px] dark:bg-lime/15"
        animate={{ scale: [1, 1.15, 1], opacity: [0.6, 1, 0.6] }}
        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
      />

      <header className="relative z-10 flex items-center justify-between px-6 py-5 sm:px-10">
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="flex items-center gap-2.5"
        >
          <Logo className="h-9 w-9 rounded-xl" />
          <span className="text-lg font-extrabold tracking-tight">NextStep</span>
        </motion.div>
      </header>

      <main className="relative z-10 flex flex-1 flex-col items-center justify-center px-6 pb-24 text-center">
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="mb-5 flex items-center gap-2 rounded-full border border-ink/10 bg-surface px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-ink-soft shadow-card dark:border-night-line dark:bg-night-raised dark:text-ink-faint dark:shadow-none"
        >
          <CircleDashed className="h-3.5 w-3.5 text-lime-deep" />
          El flujo de tus proyectos
        </motion.p>

        <h1 className="font-display text-6xl leading-[0.95] tracking-tight sm:text-8xl">
          {WORDS.map((word, i) => (
            <motion.span
              key={word}
              initial={{ opacity: 0, y: 40, rotateX: 45 }}
              animate={{ opacity: 1, y: 0, rotateX: 0 }}
              transition={{
                delay: 0.3 + i * 0.18,
                duration: 0.8,
                ease: [0.22, 1, 0.36, 1],
              }}
              className={`block ${i === 1 ? "italic text-ink-soft dark:text-ink-faint" : ""}`}
            >
              {word}
            </motion.span>
          ))}
        </h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.95, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="mt-7 max-w-md text-base leading-relaxed text-ink-soft dark:text-ink-faint"
        >
          Un tablero minimalista para llevar tus tareas de{" "}
          <em className="font-display text-ink dark:text-paper">sin completar</em> a{" "}
          <em className="font-display text-ink dark:text-paper">finalizadas</em>, sin
          perder el hilo de ningún proyecto.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.15, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="mt-10"
        >
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleGoogle}
            disabled={busy}
            className="flex items-center gap-3 rounded-full bg-ink px-7 py-3.5 text-sm font-bold text-paper shadow-lift transition-colors hover:bg-black disabled:opacity-60 dark:bg-paper dark:text-ink dark:hover:bg-white"
          >
            {busy ? <Loader2 className="h-5 w-5 animate-spin" /> : <GoogleIcon />}
            Continuar con Google
          </motion.button>
        </motion.div>

        {error && (
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 max-w-sm rounded-2xl border border-amber-flow/40 bg-amber-flow/10 px-4 py-2.5 text-xs font-medium text-ink-soft dark:text-paper"
          >
            {error}
          </motion.p>
        )}
      </main>

      {/* Marquee inferior */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 1 }}
        className="relative z-10 overflow-hidden border-t border-line py-4 dark:border-night-line"
      >
        <div className="flex w-max animate-marquee gap-10">
          {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS, ...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map(
            (item, i) => (
              <span
                key={i}
                className="flex items-center gap-10 whitespace-nowrap font-display text-lg italic text-ink-faint"
              >
                {item}
                <span className="h-1.5 w-1.5 rounded-full bg-lime-deep" />
              </span>
            ),
          )}
        </div>
      </motion.div>
    </div>
  );
}
