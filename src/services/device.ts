import { randomUUID } from "expo-crypto";
import { Platform } from "react-native";

const BROWSER_ID_KEY = "dh_browser_id";

async function getStoredValue(key: string): Promise<string | null> {
  if (Platform.OS === "web") {
    return localStorage.getItem(key);
  }
  const { getItemAsync } = await import("expo-secure-store");
  return getItemAsync(key);
}

async function setStoredValue(key: string, value: string): Promise<void> {
  if (Platform.OS === "web") {
    localStorage.setItem(key, value);
    return;
  }
  const { setItemAsync } = await import("expo-secure-store");
  await setItemAsync(key, value);
}

export async function getBrowserId(): Promise<string> {
  const existing = await getStoredValue(BROWSER_ID_KEY);
  if (existing) {
    return existing;
  }
  const id = randomUUID();
  await setStoredValue(BROWSER_ID_KEY, id);
  return id;
}
