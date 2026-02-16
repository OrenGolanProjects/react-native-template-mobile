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
import { DailyReportCard } from "@/components/DailyReportCard";
import { DateTimePicker } from "@/components/DateTimePicker";
import { ReportCard } from "@/components/ReportCard";
import { COLORS } from "@/constants/colors";
import { useBrowserId } from "@/hooks/useBrowserId";
import { triggerHapticError, triggerHapticLight, triggerHapticSuccess } from "@/hooks/useHaptics";
import { getCompareReports, getDailyReports } from "@/services/api";
import type { DailyReportEntry, ReportEntry } from "@/types/api";

type ReportType = "compare" | "daily";

function formatDate(date: Date): string {
  return date.toISOString().split("T")[0];
}

function getMonthStart(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1);
}

function getMonthEnd(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth() + 1, 0);
}

export default function ReportsScreen(): React.JSX.Element {
  const router = useRouter();
  const browserId = useBrowserId();
  const [reportType, setReportType] = useState<ReportType>("compare");
  const [fromDate, setFromDate] = useState(getMonthStart);
  const [toDate, setToDate] = useState(getMonthEnd);
  const [compareReports, setCompareReports] = useState<readonly ReportEntry[]>([]);
  const [dailyReports, setDailyReports] = useState<readonly DailyReportEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const isLoadDisabled = isLoading || !browserId;

  function handleFromDateChange(date: Date): void {
    if (date > toDate) {
      setFromDate(toDate);
      return;
    }
    setFromDate(date);
  }

  function handleToDateChange(date: Date): void {
    if (date < fromDate) {
      setToDate(fromDate);
      return;
    }
    setToDate(date);
  }

  function handleReportTypeChange(type: ReportType): void {
    triggerHapticLight();
    setReportType(type);
  }

  async function handleLoadReports(): Promise<void> {
    if (!browserId) {
      return;
    }
    setError("");
    setIsLoading(true);
    try {
      const from = formatDate(fromDate);
      const to = formatDate(toDate);
      if (reportType === "compare") {
        const result = await getCompareReports(from, to, browserId);
        setCompareReports(result);
      } else {
        const result = await getDailyReports(from, to, browserId);
        setDailyReports(result);
      }
      triggerHapticSuccess();
    } catch (err: unknown) {
      const apiError = err as { message?: string };
      setError(apiError.message ?? "Failed to load reports");
      triggerHapticError();
    } finally {
      setIsLoading(false);
    }
  }

  const renderCompareItem = useCallback(({ item }: { item: ReportEntry }): React.JSX.Element => {
    return <ReportCard item={item} />;
  }, []);

  const renderDailyItem = useCallback(({ item }: { item: DailyReportEntry }): React.JSX.Element => {
    return <DailyReportCard item={item} />;
  }, []);

  const compareKeyExtractor = useCallback((item: ReportEntry): string => {
    return item.workDate;
  }, []);

  const dailyKeyExtractor = useCallback((item: DailyReportEntry, index: number): string => {
    return `${item.dStartDate}-${item.dCode}-${index}`;
  }, []);

  const reportedCount = compareReports.filter((r) => r.lastDocID !== null).length;
  const compareTotalHours = compareReports.reduce((sum, r) => sum + r.totalServiceHours, 0);
  const dailyTotalHours = dailyReports.reduce((sum, r) => sum + r.quantity / 60, 0);

  return (
    <View style={styles.container}>
      <View style={styles.dateSection}>
        <View style={styles.segmentedControl}>
          <Pressable
            style={[styles.segment, reportType === "compare" && styles.segmentActive]}
            onPress={(): void => handleReportTypeChange("compare")}
          >
            <Text style={[styles.segmentText, reportType === "compare" && styles.segmentTextActive]}>Compare</Text>
          </Pressable>
          <Pressable
            style={[styles.segment, reportType === "daily" && styles.segmentActive]}
            onPress={(): void => handleReportTypeChange("daily")}
          >
            <Text style={[styles.segmentText, reportType === "daily" && styles.segmentTextActive]}>Daily</Text>
          </Pressable>
        </View>

        <View style={styles.dateRow}>
          <View style={styles.datePickerWrapper}>
            <DateTimePicker value={fromDate} onChange={handleFromDateChange} mode="date" label="From" />
          </View>
          <View style={styles.datePickerWrapper}>
            <DateTimePicker value={toDate} onChange={handleToDateChange} mode="date" label="To" />
          </View>
        </View>

        <Pressable
          style={[styles.loadButton, isLoadDisabled && styles.buttonDisabled]}
          onPress={handleLoadReports}
          disabled={isLoadDisabled}
        >
          {isLoading ? (
            <ActivityIndicator color={COLORS.background} />
          ) : (
            <Text style={styles.loadButtonText}>Load Reports</Text>
          )}
        </Pressable>
      </View>

      {error ? (
        <Text selectable style={styles.error}>
          {error}
        </Text>
      ) : null}

      {reportType === "compare" ? (
        <>
          {compareReports.length > 0 && (
            <View style={styles.summaryBar}>
              <Text style={styles.summaryText}>
                {reportedCount}/{compareReports.length} days reported
              </Text>
              <Text style={styles.summaryText}>{compareTotalHours.toFixed(1)}h total</Text>
            </View>
          )}
          <FlatList
            data={compareReports}
            renderItem={renderCompareItem}
            keyExtractor={compareKeyExtractor}
            style={styles.list}
            contentContainerStyle={styles.listContent}
            contentInsetAdjustmentBehavior="automatic"
            ListEmptyComponent={
              <Text style={styles.emptyText}>
                {isLoading ? "" : "No reports loaded. Select a date range and tap Load."}
              </Text>
            }
          />
        </>
      ) : (
        <>
          {dailyReports.length > 0 && (
            <View style={styles.summaryBar}>
              <Text style={styles.summaryText}>{dailyReports.length} entries</Text>
              <Text style={styles.summaryText}>{dailyTotalHours.toFixed(1)}h total</Text>
            </View>
          )}
          <FlatList
            data={dailyReports}
            renderItem={renderDailyItem}
            keyExtractor={dailyKeyExtractor}
            style={styles.list}
            contentContainerStyle={styles.listContent}
            contentInsetAdjustmentBehavior="automatic"
            ListEmptyComponent={
              <Text style={styles.emptyText}>
                {isLoading ? "" : "No reports loaded. Select a date range and tap Load."}
              </Text>
            }
          />
        </>
      )}

      <View style={styles.bottomBar}>
        <Pressable
          style={styles.submitButton}
          onPress={(): void => {
            triggerHapticLight();
            router.push("/submit-report");
          }}
        >
          <Text style={styles.submitButtonText}>+ Submit Report</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles: {
  container: ViewStyle;
  dateSection: ViewStyle;
  segmentedControl: ViewStyle;
  segment: ViewStyle;
  segmentActive: ViewStyle;
  segmentText: TextStyle;
  segmentTextActive: TextStyle;
  dateRow: ViewStyle;
  datePickerWrapper: ViewStyle;
  loadButton: ViewStyle;
  loadButtonText: TextStyle;
  buttonDisabled: ViewStyle;
  error: TextStyle;
  summaryBar: ViewStyle;
  summaryText: TextStyle;
  list: ViewStyle;
  listContent: ViewStyle;
  emptyText: TextStyle;
  bottomBar: ViewStyle;
  submitButton: ViewStyle;
  submitButtonText: TextStyle;
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
  segmentedControl: {
    flexDirection: "row",
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    borderCurve: "continuous",
    marginBottom: 12,
    overflow: "hidden",
  },
  segment: {
    flex: 1,
    paddingVertical: 8,
    alignItems: "center",
  },
  segmentActive: {
    backgroundColor: COLORS.primary,
  },
  segmentText: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.textSecondary,
  },
  segmentTextActive: {
    color: COLORS.background,
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
    borderCurve: "continuous",
    padding: 14,
    alignItems: "center",
  },
  loadButtonText: {
    color: COLORS.background,
    fontSize: 16,
    fontWeight: "600",
  },
  buttonDisabled: {
    opacity: 0.5,
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
    fontVariant: ["tabular-nums"],
  },
  list: {
    flex: 1,
  },
  listContent: {
    padding: 16,
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
    borderCurve: "continuous",
    padding: 14,
    alignItems: "center",
  },
  submitButtonText: {
    color: COLORS.background,
    fontSize: 16,
    fontWeight: "600",
  },
});
