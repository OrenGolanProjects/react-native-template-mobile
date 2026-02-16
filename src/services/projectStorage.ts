import AsyncStorage from "@react-native-async-storage/async-storage";
import type { Project } from "@/types/api";

const PROJECTS_KEY_PREFIX = "dh_projects";
const PROJECTS_META_PREFIX = "dh_projects_meta";
const DEMO_SUFFIX = "_demo";
const PROJECTS_CACHE_TTL_MS: number = 30 * 60 * 1000;

let currentUserSuffix = "";

export function setProjectStorageUser(uid: string, isDemo: boolean): void {
  currentUserSuffix = isDemo ? DEMO_SUFFIX : `_${uid}`;
}

function getProjectsKey(): string {
  return `${PROJECTS_KEY_PREFIX}${currentUserSuffix}`;
}

function getMetaKey(): string {
  return `${PROJECTS_META_PREFIX}${currentUserSuffix}`;
}

export async function loadCachedProjects(): Promise<readonly Project[] | null> {
  const raw = await AsyncStorage.getItem(getProjectsKey());
  if (!raw) {
    return null;
  }
  return JSON.parse(raw) as Project[];
}

export async function saveProjectsToCache(projects: readonly Project[]): Promise<void> {
  await AsyncStorage.setItem(getProjectsKey(), JSON.stringify(projects));
  await AsyncStorage.setItem(getMetaKey(), JSON.stringify({ fetchedAt: Date.now() }));
}

export async function isProjectCacheStale(): Promise<boolean> {
  const metaRaw = await AsyncStorage.getItem(getMetaKey());
  if (!metaRaw) {
    return true;
  }
  const meta = JSON.parse(metaRaw) as { fetchedAt: number };
  return Date.now() - meta.fetchedAt > PROJECTS_CACHE_TTL_MS;
}

export async function clearProjectCache(): Promise<void> {
  await AsyncStorage.multiRemove([getProjectsKey(), getMetaKey()]);
}
