import { type FirebaseApp, initializeApp } from "firebase/app";
import { type Auth, getReactNativePersistence, initializeAuth } from "firebase/auth";
import { Platform } from "react-native";
import { FIREBASE_CONFIG } from "@/constants/config";

const firebaseApp: FirebaseApp = initializeApp(FIREBASE_CONFIG);

function createAuth(): Auth {
  if (Platform.OS === "web") {
    // biome-ignore lint/style/noCommonJs: dynamic require for web-only persistence export
    const { browserLocalPersistence } = require("firebase/auth");
    return initializeAuth(firebaseApp, {
      persistence: browserLocalPersistence,
    });
  }
  // biome-ignore lint/style/noCommonJs: dynamic require to avoid loading native module on web
  const AsyncStorage = require("@react-native-async-storage/async-storage").default;
  return initializeAuth(firebaseApp, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
}

export const firebaseAuth: Auth = createAuth();

export function getAuthToken(): Promise<string> {
  const user = firebaseAuth.currentUser;
  if (!user) {
    throw new Error("Not authenticated");
  }
  return user.getIdToken(true);
}
