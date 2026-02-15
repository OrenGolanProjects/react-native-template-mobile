import AsyncStorage from "@react-native-async-storage/async-storage";
import type { TimeEntry } from "@/types/api";

const STORAGE_KEY = "dh_time_entries";

export async function loadTimeEntries(): Promise<readonly TimeEntry[]> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return [];
  }
  return JSON.parse(raw) as TimeEntry[];
}

export async function saveTimeEntries(entries: readonly TimeEntry[]): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

export async function addTimeEntry(entry: TimeEntry): Promise<readonly TimeEntry[]> {
  const entries = await loadTimeEntries();
  const updated = [...entries, entry];
  await saveTimeEntries(updated);
  return updated;
}

export async function updateTimeEntry(
  id: string,
  updates: Partial<Pick<TimeEntry, "endTime">>
): Promise<readonly TimeEntry[]> {
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
