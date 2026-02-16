import type { DailyReportEntry, Project, ReportEntry, SendReportResult, TimeEntry } from "@/types/api";

export const DEMO_EMAIL = "test@test.il";
export const DEMO_PASSWORD = "test";

export function isDemoUser(email: string, password: string): boolean {
  return email === DEMO_EMAIL && password === DEMO_PASSWORD;
}

export const DEMO_PROJECTS: readonly Project[] = [
  {
    btCode: "PRJ-001",
    shortDescription: "Website Redesign",
    btaccName: "Acme Corp",
    subBudgetTopicName: "Development",
  },
  {
    btCode: "PRJ-002",
    shortDescription: "Mobile App",
    btaccName: "TechStart Ltd",
    subBudgetTopicName: "Engineering",
  },
  {
    btCode: "PRJ-003",
    shortDescription: "API Integration",
    btaccName: "DataFlow Inc",
    subBudgetTopicName: "Backend",
  },
  {
    btCode: "PRJ-004",
    shortDescription: "Dashboard Analytics",
    btaccName: "Acme Corp",
    subBudgetTopicName: "Data",
  },
];

function todayStr(): string {
  return new Date().toISOString().split("T")[0];
}

function yesterdayStr(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().split("T")[0];
}

export function getDemoCompareReports(): readonly ReportEntry[] {
  const today = todayStr();
  const yesterday = yesterdayStr();
  return [
    {
      workDate: today,
      dayInWeek: "Sunday",
      agnName: "Website Redesign",
      totalServiceHours: 8.5,
      agreementTotalHours: 9,
      diffAgreementAndServiceHours: 0.5,
      openReportingMinTime: "08:30",
      openReportingManTime: "17:00",
      lastDocID: 12345,
      shortDescription: "Frontend development",
    },
    {
      workDate: yesterday,
      dayInWeek: "Saturday",
      agnName: "Mobile App",
      totalServiceHours: 6,
      agreementTotalHours: 9,
      diffAgreementAndServiceHours: 3,
      openReportingMinTime: "09:00",
      openReportingManTime: "15:00",
      lastDocID: null,
    },
    {
      workDate: "2026-02-13",
      dayInWeek: "Friday",
      agnName: "API Integration",
      totalServiceHours: 9,
      agreementTotalHours: 9,
      diffAgreementAndServiceHours: 0,
      openReportingMinTime: "08:00",
      openReportingManTime: "17:00",
      lastDocID: 12340,
    },
    {
      workDate: "2026-02-12",
      dayInWeek: "Thursday",
      agnName: "Dashboard Analytics",
      totalServiceHours: 7.5,
      agreementTotalHours: 9,
      diffAgreementAndServiceHours: 1.5,
      openReportingMinTime: "09:30",
      openReportingManTime: "17:00",
      lastDocID: 12338,
    },
  ];
}

export function getDemoDailyReports(): readonly DailyReportEntry[] {
  const today = todayStr();
  return [
    {
      dStartDate: today,
      dEndDate: today,
      dStartTime: "08:30",
      dEndTime: "12:30",
      quantity: 240,
      location: "Office",
      shortDescription: "Website Redesign",
      accName: "Acme Corp",
      status: "Approved",
      agnName: "Website Redesign",
      dCode: "D-001",
    },
    {
      dStartDate: today,
      dEndDate: today,
      dStartTime: "13:30",
      dEndTime: "17:00",
      quantity: 210,
      location: "Office",
      shortDescription: "Website Redesign",
      accName: "Acme Corp",
      status: "Approved",
      agnName: "Website Redesign",
      dCode: "D-002",
    },
    {
      dStartDate: today,
      dEndDate: today,
      dStartTime: "09:00",
      dEndTime: "12:00",
      quantity: 180,
      location: "Remote",
      shortDescription: "Mobile App",
      accName: "TechStart Ltd",
      status: "Pending",
      agnName: "Mobile App",
      dCode: "D-003",
    },
    {
      dStartDate: today,
      dEndDate: today,
      dStartTime: "13:00",
      dEndTime: "16:00",
      quantity: 180,
      location: "Remote",
      shortDescription: "API Integration",
      accName: "DataFlow Inc",
      status: "Approved",
      agnName: "API Integration",
      dCode: "D-004",
    },
  ];
}

export function getDemoSendResult(): SendReportResult {
  return {
    success: true,
    validLines: [
      {
        project: "PRJ-001",
        reportDate: todayStr(),
        startTime: "09:00",
        endTime: "17:00",
        location: 1,
        notes: "Demo report",
      },
    ],
    invalidLines: [],
  };
}

export function getDemoTimeEntries(): readonly TimeEntry[] {
  const today = todayStr();
  const yesterday = yesterdayStr();
  const now = new Date();
  return [
    {
      id: "demo-1",
      projectCode: "PRJ-001",
      projectName: "Website Redesign",
      clientName: "Acme Corp",
      startTime: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 8, 30).toISOString(),
      endTime: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 12, 30).toISOString(),
      date: today,
    },
    {
      id: "demo-2",
      projectCode: "PRJ-002",
      projectName: "Mobile App",
      clientName: "TechStart Ltd",
      startTime: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 13, 30).toISOString(),
      endTime: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 17, 0).toISOString(),
      date: today,
    },
    {
      id: "demo-3",
      projectCode: "PRJ-003",
      projectName: "API Integration",
      clientName: "DataFlow Inc",
      startTime: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1, 9, 0).toISOString(),
      endTime: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1, 15, 0).toISOString(),
      date: yesterday,
    },
  ];
}
