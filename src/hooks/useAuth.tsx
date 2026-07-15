import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  getRedirectResult,
  onAuthStateChanged,
  signInWithPopup,
  signInWithRedirect,
  signOut as fbSignOut,
} from "firebase/auth";
import { auth, firebaseEnabled, googleProvider } from "../firebase";
import type { AppUser } from "../types";

interface AuthContextValue {
  user: AppUser | null;
  loading: boolean;
  redirectError: string | null;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);
const REDIRECT_PENDING_KEY = "nextstep.redirectPending";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [redirectError, setRedirectError] = useState<string | null>(null);

  useEffect(() => {
    if (!firebaseEnabled || !auth) {
      setLoading(false);
      return;
    }
    // Completa el login si venimos de vuelta de una redirección a Google
    // (respaldo cuando el navegador bloquea el popup).
    const wasRedirecting = sessionStorage.getItem(REDIRECT_PENDING_KEY) === "1";
    sessionStorage.removeItem(REDIRECT_PENDING_KEY);
    getRedirectResult(auth)
      .then((result) => {
        if (!result && wasRedirecting) {
          // Volvimos de la redirección a Google pero Firebase no encontró
          // sesión que completar: el navegador está bloqueando el
          // almacenamiento de terceros que Firebase necesita para esto.
          setRedirectError("auth/redirect-storage-blocked");
        }
      })
      .catch((e) => {
        console.error("Error al completar el login por redirección:", e);
        setRedirectError((e as { code?: string }).code ?? "auth/redirect-error");
      });
    const unsub = onAuthStateChanged(auth, (fbUser) => {
      setUser(
        fbUser
          ? {
              uid: fbUser.uid,
              name: fbUser.displayName ?? "Sin nombre",
              email: fbUser.email,
              photoURL: fbUser.photoURL,
            }
          : null,
      );
      setLoading(false);
    });
    return unsub;
  }, []);

  const signInWithGoogle = useCallback(async () => {
    if (!firebaseEnabled || !auth) {
      throw new Error("firebase-disabled");
    }
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (e) {
      const code = (e as { code?: string }).code;
      // Si el navegador bloquea el popup (frecuente en algunos dominios/
      // navegadores en producción), recurrimos a redirección de página completa.
      if (code === "auth/popup-blocked" || code === "auth/operation-not-supported-in-this-environment") {
        sessionStorage.setItem(REDIRECT_PENDING_KEY, "1");
        await signInWithRedirect(auth, googleProvider);
        return;
      }
      throw e;
    }
  }, []);

  const signOut = useCallback(async () => {
    if (firebaseEnabled && auth) await fbSignOut(auth);
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, loading, redirectError, signInWithGoogle, signOut }),
    [user, loading, redirectError, signInWithGoogle, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de <AuthProvider>");
  return ctx;
}
