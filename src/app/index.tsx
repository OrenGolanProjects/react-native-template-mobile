import { useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  type TextStyle,
  View,
  type ViewStyle,
} from "react-native";
import { DateTimePicker } from "@/components/DateTimePicker";
import { COLORS } from "@/constants/colors";
import { useBrowserId } from "@/hooks/useBrowserId";
import { getCompareReports } from "@/services/api";
import { useAuth } from "@/services/authContext";
import type { ReportEntry } from "@/types/api";

function formatDate(date: Date): string {
  return date.toISOString().split("T")[0];
}

function extractDate(workDate: string): string {
  return workDate.split("T")[0];
}

function formatTimeRange(minTime: string | null, maxTime: string | null): string {
  if (!(minTime && maxTime)) {
    return "—";
  }
  return `${minTime.slice(0, 5)} - ${maxTime.slice(0, 5)}`;
}

function getMonthStart(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1);
}

function getMonthEnd(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth() + 1, 0);
}

const STATUS_COLORS = {
  reported: "#4caf50",
  open: "#ff9800",
} as const;

export default function ReportsScreen(): React.JSX.Element {
  const router = useRouter();
  const { signOut } = useAuth();
  const browserId = useBrowserId();
  const [fromDate, setFromDate] = useState(getMonthStart);
  const [toDate, setToDate] = useState(getMonthEnd);
  const [reports, setReports] = useState<readonly ReportEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLoadReports(): Promise<void> {
    if (!browserId) {
      return;
    }
    setError("");
    setIsLoading(true);
    try {
      const result = await getCompareReports(formatDate(fromDate), formatDate(toDate), browserId);
      setReports(result);
    } catch (err: unknown) {
      const apiError = err as { message?: string };
      setError(apiError.message ?? "Failed to load reports");
    } finally {
      setIsLoading(false);
    }
  }

  const renderReportItem = useCallback(({ item }: { item: ReportEntry }): React.JSX.Element => {
    const isReported = item.lastDocID !== null;
    const statusColor = isReported ? STATUS_COLORS.reported : STATUS_COLORS.open;

    return (
      <View style={[styles.reportCard, { borderLeftColor: statusColor, borderLeftWidth: 4 }]}>
        <View style={styles.reportHeader}>
          <View>
            <Text style={styles.reportDate}>{extractDate(item.workDate)}</Text>
            <Text style={styles.reportDay}>{item.dayInWeek}</Text>
          </View>
          <View style={styles.hoursSection}>
            <Text style={[styles.reportHours, { color: statusColor }]}>{item.totalServiceHours.toFixed(1)}h</Text>
            <Text style={styles.expectedHours}>/ {item.agreementTotalHours}h</Text>
          </View>
        </View>

        <View style={styles.reportDetails}>
          <Text style={styles.timeRange}>{formatTimeRange(item.openReportingMinTime, item.openReportingManTime)}</Text>
          <Text style={[styles.statusBadge, { color: statusColor }]}>{isReported ? "Reported" : "Open"}</Text>
        </View>

        {isReported && item.diffAgreementAndServiceHours !== 0 && (
          <Text
            style={[
              styles.diffText,
              { color: item.diffAgreementAndServiceHours > 0 ? STATUS_COLORS.reported : "#d32f2f" },
            ]}
          >
            {item.diffAgreementAndServiceHours > 0 ? "+" : ""}
            {item.diffAgreementAndServiceHours.toFixed(1)}h vs expected
          </Text>
        )}
      </View>
    );
  }, []);

  const keyExtractor = useCallback((_item: ReportEntry, index: number): string => {
    return String(index);
  }, []);

  const reportedCount = reports.filter((r) => r.lastDocID !== null).length;
  const totalHours = reports.reduce((sum, r) => sum + r.totalServiceHours, 0);

  return (
    <View style={styles.container}>
      <View style={styles.dateSection}>
        <View style={styles.dateRow}>
          <View style={styles.datePickerWrapper}>
            <DateTimePicker value={fromDate} onChange={setFromDate} mode="date" label="From" />
          </View>
          <View style={styles.datePickerWrapper}>
            <DateTimePicker value={toDate} onChange={setToDate} mode="date" label="To" />
          </View>
        </View>

        <Pressable style={styles.loadButton} onPress={handleLoadReports} disabled={isLoading || !browserId}>
          {isLoading ? (
            <ActivityIndicator color={COLORS.background} />
          ) : (
            <Text style={styles.loadButtonText}>Load Reports</Text>
          )}
        </Pressable>
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      {reports.length > 0 && (
        <View style={styles.summaryBar}>
          <Text style={styles.summaryText}>
            {reportedCount}/{reports.length} days reported
          </Text>
          <Text style={styles.summaryText}>{totalHours.toFixed(1)}h total</Text>
        </View>
      )}

      <FlatList
        data={reports}
        renderItem={renderReportItem}
        keyExtractor={keyExtractor}
        style={styles.list}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <Text style={styles.emptyText}>
            {isLoading ? "" : "No reports loaded. Select a date range and tap Load."}
          </Text>
        }
      />

      <View style={styles.bottomBar}>
        <Pressable style={styles.submitButton} onPress={(): void => router.push("/submit-report")}>
          <Text style={styles.submitButtonText}>+ Submit Report</Text>
        </Pressable>
        <Pressable style={styles.signOutButton} onPress={signOut}>
          <Text style={styles.signOutButtonText}>Sign Out</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles: {
  container: ViewStyle;
  dateSection: ViewStyle;
  dateRow: ViewStyle;
  datePickerWrapper: ViewStyle;
  loadButton: ViewStyle;
  loadButtonText: TextStyle;
  error: TextStyle;
  summaryBar: ViewStyle;
  summaryText: TextStyle;
  list: ViewStyle;
  listContent: ViewStyle;
  reportCard: ViewStyle;
  reportHeader: ViewStyle;
  reportDate: TextStyle;
  reportDay: TextStyle;
  hoursSection: ViewStyle;
  reportHours: TextStyle;
  expectedHours: TextStyle;
  reportDetails: ViewStyle;
  timeRange: TextStyle;
  statusBadge: TextStyle;
  diffText: TextStyle;
  emptyText: TextStyle;
  bottomBar: ViewStyle;
  submitButton: ViewStyle;
  submitButtonText: TextStyle;
  signOutButton: ViewStyle;
  signOutButtonText: TextStyle;
} = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  dateSection: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  dateRow: {
    flexDirection: "row",
    gap: 12,
  },
  datePickerWrapper: {
    flex: 1,
  },
  loadButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    padding: 14,
    alignItems: "center",
  },
  loadButtonText: {
    color: COLORS.background,
    fontSize: 16,
    fontWeight: "600",
  },
  error: {
    color: "#d32f2f",
    fontSize: 14,
    padding: 16,
    textAlign: "center",
  },
  summaryBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: "#f5f5f5",
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  summaryText: {
    fontSize: 13,
    fontWeight: "600",
    color: COLORS.textSecondary,
  },
  list: {
    flex: 1,
  },
  listContent: {
    padding: 16,
  },
  reportCard: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    padding: 14,
    marginBottom: 10,
  },
  reportHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 6,
  },
  reportDate: {
    fontSize: 15,
    fontWeight: "600",
    color: COLORS.text,
  },
  reportDay: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  hoursSection: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 4,
  },
  reportHours: {
    fontSize: 18,
    fontWeight: "bold",
  },
  expectedHours: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  reportDetails: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  timeRange: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  statusBadge: {
    fontSize: 12,
    fontWeight: "600",
    textTransform: "uppercase",
  },
  diffText: {
    fontSize: 12,
    marginTop: 4,
  },
  emptyText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: "center",
    marginTop: 40,
  },
  bottomBar: {
    flexDirection: "row",
    padding: 16,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  submitButton: {
    flex: 1,
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    padding: 14,
    alignItems: "center",
  },
  submitButtonText: {
    color: COLORS.background,
    fontSize: 16,
    fontWeight: "600",
  },
  signOutButton: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    padding: 14,
    alignItems: "center",
    paddingHorizontal: 20,
  },
  signOutButtonText: {
    color: COLORS.textSecondary,
    fontSize: 14,
  },
});
