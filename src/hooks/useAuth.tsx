import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { onAuthStateChanged, signInWithPopup, signOut as fbSignOut } from "firebase/auth";
import { auth, firebaseEnabled, googleProvider } from "../firebase";
import type { AppUser } from "../types";

interface AuthContextValue {
  user: AppUser | null;
  loading: boolean;
  demoMode: boolean;
  signInWithGoogle: () => Promise<void>;
  signInAsGuest: () => void;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);
const GUEST_KEY = "nextstep.guest";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!firebaseEnabled || !auth) {
      if (localStorage.getItem(GUEST_KEY)) {
        setUser(guestUser());
      }
      setLoading(false);
      return;
    }
    const unsub = onAuthStateChanged(auth, (fbUser) => {
      if (fbUser) {
        setUser({
          uid: fbUser.uid,
          name: fbUser.displayName ?? "Sin nombre",
          email: fbUser.email,
          photoURL: fbUser.photoURL,
          isDemo: false,
        });
      } else if (localStorage.getItem(GUEST_KEY)) {
        setUser(guestUser());
      } else {
        setUser(null);
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  const signInWithGoogle = useCallback(async () => {
    if (!firebaseEnabled || !auth) {
      throw new Error("firebase-disabled");
    }
    await signInWithPopup(auth, googleProvider);
  }, []);

  const signInAsGuest = useCallback(() => {
    localStorage.setItem(GUEST_KEY, "1");
    setUser(guestUser());
  }, []);

  const signOut = useCallback(async () => {
    localStorage.removeItem(GUEST_KEY);
    if (firebaseEnabled && auth) await fbSignOut(auth);
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      demoMode: !firebaseEnabled,
      signInWithGoogle,
      signInAsGuest,
      signOut,
    }),
    [user, loading, signInWithGoogle, signInAsGuest, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

function guestUser(): AppUser {
  return {
    uid: "guest",
    name: "Invitado",
    email: null,
    photoURL: null,
    isDemo: true,
  };
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de <AuthProvider>");
  return ctx;
}
