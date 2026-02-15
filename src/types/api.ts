export interface ApiStatus {
  readonly status: number;
  readonly action: string;
  readonly message: string;
  readonly timestamp: string;
}

export interface ApiResponse {
  readonly status: ApiStatus;
  readonly [key: string]: unknown;
}

export interface Project {
  readonly btCode: string;
  readonly shortDescription: string;
  readonly btaccName: string;
  readonly subBudgetTopicName: string;
}

export interface ReportEntry {
  readonly workDate: string;
  readonly dayInWeek: string;
  readonly agnName: string;
  readonly totalServiceHours: number;
  readonly agreementTotalHours: number;
  readonly diffAgreementAndServiceHours: number;
  readonly openReportingMinTime: string | null;
  readonly openReportingManTime: string | null;
  readonly lastDocID: number | null;
  readonly shortDescription?: string;
}

export interface ProjectReportLine {
  readonly reportDate: string;
  readonly startTime: string;
  readonly endTime: string;
  readonly location: number;
  readonly originalLocation: number;
  readonly notes: string;
}

export interface SendReportPayload {
  readonly minStartDate: string;
  readonly maxEndDate: string;
  readonly browserID: string;
  readonly projectReports: Record<string, readonly ProjectReportLine[]>;
}

export interface ReportLineResult {
  readonly project: string;
  readonly reportDate: string;
  readonly startTime: string;
  readonly endTime: string;
  readonly location: number;
  readonly notes: string;
  readonly reason?: string;
}

export interface SendReportResult {
  readonly success: boolean;
  readonly validLines: readonly ReportLineResult[];
  readonly invalidLines: readonly ReportLineResult[];
}

export interface UserCredentialsPayload {
  readonly employeeCode: string;
  readonly employeePass: string;
}
