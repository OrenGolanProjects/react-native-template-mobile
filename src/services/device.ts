import { randomUUID } from "expo-crypto";
import { getItemAsync, setItemAsync } from "expo-secure-store";

const BROWSER_ID_KEY = "dh_browser_id";

export async function getBrowserId(): Promise<string> {
  const existing = await getItemAsync(BROWSER_ID_KEY);
  if (existing) {
    return existing;
  }
  const id = randomUUID();
  await setItemAsync(BROWSER_ID_KEY, id);
  return id;
}
