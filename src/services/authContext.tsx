import {
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  type User,
} from "firebase/auth";
import type { ReactNode } from "react";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { setDemoMode } from "@/services/api";
import { isDemoUser } from "@/services/demoData";
import { firebaseAuth } from "@/services/firebase";
import { clearProjectCache, setProjectStorageUser } from "@/services/projectStorage";
import { setStorageUser } from "@/services/timeEntryStorage";

const DEMO_USER_STUB = { uid: "demo-user", email: "test@test.il" } as User;

interface AuthContextValue {
  readonly user: User | null;
  readonly isLoading: boolean;
  readonly isDemo: boolean;
  readonly signIn: (email: string, password: string) => Promise<void>;
  readonly signUp: (email: string, password: string) => Promise<void>;
  readonly signOut: () => Promise<void>;
}

const AuthContext: React.Context<AuthContextValue | null> = createContext<AuthContextValue | null>(null);

interface AuthProviderProps {
  readonly children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps): React.JSX.Element {
  const [user, setUser] = useState<User | null>(null);
  const [isDemo, setIsDemo] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(firebaseAuth, (firebaseUser) => {
      if (!isDemo) {
        setUser(firebaseUser);
        if (firebaseUser) {
          setStorageUser(firebaseUser.uid, false);
          setProjectStorageUser(firebaseUser.uid, false);
        }
      }
      setIsLoading(false);
    });
    return unsubscribe;
  }, [isDemo]);

  const signIn = useCallback(async (email: string, password: string): Promise<void> => {
    if (isDemoUser(email, password)) {
      setIsDemo(true);
      setDemoMode(true);
      setStorageUser("demo-user", true);
      setProjectStorageUser("demo-user", true);
      setUser(DEMO_USER_STUB);
      return;
    }
    await signInWithEmailAndPassword(firebaseAuth, email, password);
  }, []);

  const signUp = useCallback(async (email: string, password: string): Promise<void> => {
    await createUserWithEmailAndPassword(firebaseAuth, email, password);
  }, []);

  const signOut = useCallback(async (): Promise<void> => {
    await clearProjectCache();
    if (isDemo) {
      setIsDemo(false);
      setDemoMode(false);
      setUser(null);
      return;
    }
    await firebaseSignOut(firebaseAuth);
  }, [isDemo]);

  const value = useMemo(
    (): AuthContextValue => ({
      user,
      isLoading,
      isDemo,
      signIn,
      signUp,
      signOut,
    }),
    [user, isLoading, isDemo, signIn, signUp, signOut]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
