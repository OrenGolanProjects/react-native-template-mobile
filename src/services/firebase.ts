import AsyncStorage from "@react-native-async-storage/async-storage";
import { type FirebaseApp, initializeApp } from "firebase/app";
import { type Auth, getReactNativePersistence, initializeAuth } from "firebase/auth";
import { FIREBASE_CONFIG } from "@/constants/config";

console.warn("[APP] Firebase: initializing app...");
const firebaseApp: FirebaseApp = initializeApp(FIREBASE_CONFIG);
console.warn("[APP] Firebase: app initialized, initializing auth...");

export const firebaseAuth: Auth = initializeAuth(firebaseApp, {
  persistence: getReactNativePersistence(AsyncStorage),
});
console.warn("[APP] Firebase: auth initialized");

export function getAuthToken(): Promise<string> {
  const user = firebaseAuth.currentUser;
  if (!user) {
    throw new Error("Not authenticated");
  }
  return user.getIdToken(true);
}
