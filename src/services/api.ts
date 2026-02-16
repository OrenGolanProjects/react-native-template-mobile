import { API_BASE_URL } from "@/constants/config";
import { DEMO_PROJECTS, getDemoCompareReports, getDemoDailyReports, getDemoSendResult } from "@/services/demoData";
import { getAuthToken } from "@/services/firebase";
import type {
  ApiResponse,
  DailyReportEntry,
  Project,
  ReportEntry,
  SendReportPayload,
  SendReportResult,
  UserCredentialsPayload,
} from "@/types/api";

let demoMode = false;

export function setDemoMode(enabled: boolean): void {
  demoMode = enabled;
}

export function isDemoModeActive(): boolean {
  return demoMode;
}

export class ApiError extends Error {
  readonly statusCode: number;

  constructor(statusCode: number, message: string) {
    super(message);
    this.name = "ApiError";
    this.statusCode = statusCode;
  }
}

async function apiPost<T>(path: string, body: Record<string, unknown>): Promise<T> {
  const token = await getAuthToken();
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: "POST",
    headers: {
      authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  const json = (await response.json()) as ApiResponse & T;

  if (json.status.status !== 200) {
    throw new ApiError(json.status.status, json.status.message);
  }

  return json as T;
}

export async function saveUserCredentials(payload: UserCredentialsPayload): Promise<void> {
  if (demoMode) {
    return;
  }
  await apiPost("/saveUserCredentials", payload as unknown as Record<string, unknown>);
}

export async function getUserProjects(browserID: string): Promise<readonly Project[]> {
  if (demoMode) {
    return DEMO_PROJECTS;
  }
  const result = await apiPost<{ projects: readonly Project[] }>("/getUserProjects", { browserID });
  return result.projects;
}

export async function getCompareReports(
  fromDate: string,
  toDate: string,
  browserID: string
): Promise<readonly ReportEntry[]> {
  if (demoMode) {
    return getDemoCompareReports();
  }
  const result = await apiPost<{ reports: readonly ReportEntry[] }>("/getCompareReports", {
    fromDate,
    toDate,
    browserID,
  });
  return result.reports;
}

export async function getDailyReports(
  fromDate: string,
  toDate: string,
  browserID: string
): Promise<readonly DailyReportEntry[]> {
  if (demoMode) {
    return getDemoDailyReports();
  }
  const result = await apiPost<{ reports: readonly DailyReportEntry[] }>("/getDailyReports", {
    fromDate,
    toDate,
    browserID,
  });
  return result.reports;
}

export async function sendReport(payload: SendReportPayload): Promise<SendReportResult> {
  if (demoMode) {
    return getDemoSendResult();
  }
  const result = await apiPost<SendReportResult>("/sendReport", payload as unknown as Record<string, unknown>);
  return result;
}
