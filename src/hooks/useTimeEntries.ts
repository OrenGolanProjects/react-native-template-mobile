import { randomUUID } from "expo-crypto";
import { useCallback, useEffect, useRef, useState } from "react";
import { triggerHapticLight, triggerHapticSuccess } from "@/hooks/useHaptics";
import {
  addTimeEntry,
  clearTimeEntries,
  deleteTimeEntry,
  loadTimeEntries,
  updateTimeEntry,
} from "@/services/timeEntryStorage";
import type { Project, TimeEntry, TimeEntryEditable } from "@/types/api";

interface UseTimeEntriesReturn {
  readonly entries: readonly TimeEntry[];
  readonly activeEntry: TimeEntry | null;
  readonly elapsedSeconds: number;
  readonly isLoading: boolean;
  readonly completedCount: number;
  readonly toggleTracking: (project: Project) => Promise<void>;
  readonly editEntry: (id: string, updates: TimeEntryEditable) => Promise<void>;
  readonly removeEntry: (id: string) => Promise<void>;
  readonly clearSentEntries: (ids: readonly string[]) => Promise<void>;
  readonly reload: () => Promise<void>;
}

export function useTimeEntries(): UseTimeEntriesReturn {
  const [entries, setEntries] = useState<readonly TimeEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const activeEntry = entries.find((e) => e.endTime === null) ?? null;
  const completedCount = entries.filter((e) => e.endTime !== null).length;

  useEffect(() => {
    async function init(): Promise<void> {
      const loaded = await loadTimeEntries();
      setEntries(loaded);
      setIsLoading(false);
    }
    init();
  }, []);

  useEffect(() => {
    if (activeEntry) {
      const startMs = new Date(activeEntry.startTime).getTime();
      const tick = (): void => {
        setElapsedSeconds(Math.floor((Date.now() - startMs) / 1000));
      };
      tick();
      intervalRef.current = setInterval(tick, 1000);
      return (): void => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      };
    }
    setElapsedSeconds(0);
    return undefined;
  }, [activeEntry]);

  const toggleTracking = useCallback(async (project: Project): Promise<void> => {
    const currentEntries = await loadTimeEntries();
    const active = currentEntries.find((e) => e.endTime === null);

    if (active && active.projectCode === project.btCode) {
      const updated = await updateTimeEntry(active.id, { endTime: new Date().toISOString() });
      setEntries(updated);
      triggerHapticSuccess();
    } else if (active) {
      await updateTimeEntry(active.id, { endTime: new Date().toISOString() });
      const now = new Date();
      const newEntry: TimeEntry = {
        id: randomUUID(),
        projectCode: project.btCode,
        projectName: project.shortDescription,
        clientName: project.btaccName,
        startTime: now.toISOString(),
        endTime: null,
        date: now.toISOString().split("T")[0],
      };
      const updated = await addTimeEntry(newEntry);
      setEntries(updated);
      triggerHapticLight();
    } else {
      const now = new Date();
      const newEntry: TimeEntry = {
        id: randomUUID(),
        projectCode: project.btCode,
        projectName: project.shortDescription,
        clientName: project.btaccName,
        startTime: now.toISOString(),
        endTime: null,
        date: now.toISOString().split("T")[0],
      };
      const updated = await addTimeEntry(newEntry);
      setEntries(updated);
      triggerHapticLight();
    }
  }, []);

  const editEntry = useCallback(async (id: string, updates: TimeEntryEditable): Promise<void> => {
    const updated = await updateTimeEntry(id, updates);
    setEntries(updated);
  }, []);

  const removeEntry = useCallback(async (id: string): Promise<void> => {
    setEntries((prev) => prev.filter((e) => e.id !== id));
    await deleteTimeEntry(id);
  }, []);

  const clearSentEntries = useCallback(async (ids: readonly string[]): Promise<void> => {
    const remaining = await clearTimeEntries(ids);
    setEntries(remaining);
  }, []);

  const reload = useCallback(async (): Promise<void> => {
    const loaded = await loadTimeEntries();
    setEntries(loaded);
  }, []);

  return {
    entries,
    activeEntry,
    elapsedSeconds,
    isLoading,
    completedCount,
    toggleTracking,
    editEntry,
    removeEntry,
    clearSentEntries,
    reload,
  };
}
