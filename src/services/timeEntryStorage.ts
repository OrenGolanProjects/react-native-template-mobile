import AsyncStorage from "@react-native-async-storage/async-storage";
import type { TimeEntry, TimeEntryEditable } from "@/types/api";

const STORAGE_KEY_PREFIX = "dh_time_entries";
const DEMO_SUFFIX = "_demo";

let currentUserSuffix = "";

export function setStorageUser(uid: string, isDemo: boolean): void {
  currentUserSuffix = isDemo ? DEMO_SUFFIX : `_${uid}`;
}

function getStorageKey(): string {
  return `${STORAGE_KEY_PREFIX}${currentUserSuffix}`;
}

export async function loadTimeEntries(): Promise<readonly TimeEntry[]> {
  const raw = await AsyncStorage.getItem(getStorageKey());
  if (!raw) {
    return [];
  }
  return JSON.parse(raw) as TimeEntry[];
}

export async function saveTimeEntries(entries: readonly TimeEntry[]): Promise<void> {
  await AsyncStorage.setItem(getStorageKey(), JSON.stringify(entries));
}

export async function addTimeEntry(entry: TimeEntry): Promise<readonly TimeEntry[]> {
  const entries = await loadTimeEntries();
  const updated = [...entries, entry];
  await saveTimeEntries(updated);
  return updated;
}

export async function updateTimeEntry(id: string, updates: TimeEntryEditable): Promise<readonly TimeEntry[]> {
  const entries = await loadTimeEntries();
  const updated = entries.map((e) => (e.id === id ? { ...e, ...updates } : e));
  await saveTimeEntries(updated);
  return updated;
}

export async function deleteTimeEntry(id: string): Promise<readonly TimeEntry[]> {
  const entries = await loadTimeEntries();
  const updated = entries.filter((e) => e.id !== id);
  await saveTimeEntries(updated);
  return updated;
}

export async function clearTimeEntries(ids: readonly string[]): Promise<readonly TimeEntry[]> {
  const entries = await loadTimeEntries();
  const idSet = new Set(ids);
  const remaining = entries.filter((e) => !idSet.has(e.id));
  await saveTimeEntries(remaining);
  return remaining;
}
