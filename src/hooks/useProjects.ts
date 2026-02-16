import { useCallback, useEffect, useState } from "react";
import { useBrowserId } from "@/hooks/useBrowserId";
import { getUserProjects } from "@/services/api";
import { isProjectCacheStale, loadCachedProjects, saveProjectsToCache } from "@/services/projectStorage";
import type { Project } from "@/types/api";

interface UseProjectsReturn {
  readonly projects: readonly Project[];
  readonly isLoading: boolean;
  readonly error: string;
  readonly refreshProjects: () => Promise<void>;
}

function deduplicateProjects(projects: readonly Project[]): readonly Project[] {
  const seen = new Set<string>();
  return projects.filter((p) => {
    if (seen.has(p.btCode)) {
      return false;
    }
    seen.add(p.btCode);
    return true;
  });
}

function shouldRefetch(cached: readonly Project[] | null, stale: boolean): boolean {
  return stale || !cached || cached.length === 0;
}

function hasCachedData(cached: readonly Project[] | null): cached is readonly Project[] {
  return cached !== null && cached.length > 0;
}

export function useProjects(): UseProjectsReturn {
  const browserId = useBrowserId();
  const [projects, setProjects] = useState<readonly Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchAndCache = useCallback(async (bid: string): Promise<void> => {
    try {
      const fresh = await getUserProjects(bid);
      const unique = deduplicateProjects(fresh);
      setProjects(unique);
      await saveProjectsToCache(unique);
    } catch (err: unknown) {
      const apiError = err as { message?: string };
      setError(apiError.message ?? "Failed to load projects");
    }
  }, []);

  useEffect(() => {
    async function init(): Promise<void> {
      if (!browserId) {
        return;
      }
      const cached = await loadCachedProjects();
      if (hasCachedData(cached)) {
        setProjects(deduplicateProjects(cached));
        setIsLoading(false);
      }
      const stale = await isProjectCacheStale();
      if (shouldRefetch(cached, stale)) {
        if (!hasCachedData(cached)) {
          setIsLoading(true);
        }
        await fetchAndCache(browserId);
      }
      setIsLoading(false);
    }
    init();
  }, [browserId, fetchAndCache]);

  const refreshProjects = useCallback(async (): Promise<void> => {
    if (!browserId) {
      return;
    }
    setIsLoading(true);
    await fetchAndCache(browserId);
    setIsLoading(false);
  }, [browserId, fetchAndCache]);

  return { projects, isLoading, error, refreshProjects };
}
