import {
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  type User,
} from "firebase/auth";
import type { ReactNode } from "react";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { firebaseAuth } from "@/services/firebase";

interface AuthContextValue {
  readonly user: User | null;
  readonly isLoading: boolean;
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
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    console.warn("[APP] AuthContext: setting up onAuthStateChanged listener...");
    const unsubscribe = onAuthStateChanged(firebaseAuth, (firebaseUser) => {
      console.warn("[APP] AuthContext: auth state changed, user:", firebaseUser ? firebaseUser.email : "null");
      setUser(firebaseUser);
      setIsLoading(false);
    });
    return unsubscribe;
  }, []);

  const signIn = useCallback(async (email: string, password: string): Promise<void> => {
    await signInWithEmailAndPassword(firebaseAuth, email, password);
  }, []);

  const signUp = useCallback(async (email: string, password: string): Promise<void> => {
    await createUserWithEmailAndPassword(firebaseAuth, email, password);
  }, []);

  const signOut = useCallback(async (): Promise<void> => {
    await firebaseSignOut(firebaseAuth);
  }, []);

  const value = useMemo(
    (): AuthContextValue => ({
      user,
      isLoading,
      signIn,
      signUp,
      signOut,
    }),
    [user, isLoading, signIn, signUp, signOut]
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
