import AsyncStorage from "@react-native-async-storage/async-storage";
import { type FirebaseApp, initializeApp } from "firebase/app";
import { type Auth, getReactNativePersistence, initializeAuth } from "firebase/auth";
import { FIREBASE_CONFIG } from "@/constants/config";

const firebaseApp: FirebaseApp = initializeApp(FIREBASE_CONFIG);

export const firebaseAuth: Auth = initializeAuth(firebaseApp, {
  persistence: getReactNativePersistence(AsyncStorage),
});

export function getAuthToken(): Promise<string> {
  const user = firebaseAuth.currentUser;
  if (!user) {
    throw new Error("Not authenticated");
  }
  return user.getIdToken(true);
}
