import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  type TextStyle,
  View,
  type ViewStyle,
} from "react-native";
import { DateTimePicker } from "@/components/DateTimePicker";
import { COLORS } from "@/constants/colors";
import { useBrowserId } from "@/hooks/useBrowserId";
import { triggerHapticError, triggerHapticSuccess } from "@/hooks/useHaptics";
import { useTimeEntries } from "@/hooks/useTimeEntries";
import { sendReport } from "@/services/api";
import type { ProjectReportLine, SendReportResult, TimeEntry } from "@/types/api";

function formatDate(date: Date): string {
  return date.toISOString().split("T")[0];
}

function formatTimeFromISO(isoString: string): string {
  const d = new Date(isoString);
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

function formatDuration(startISO: string, endISO: string): string {
  const diffMs = new Date(endISO).getTime() - new Date(startISO).getTime();
  const totalMinutes = Math.round(diffMs / 60000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${hours}h ${String(minutes).padStart(2, "0")}m`;
}

function buildPayload(
  entries: readonly TimeEntry[],
  reportDate: string,
  browserID: string
): {
  minStartDate: string;
  maxEndDate: string;
  browserID: string;
  projectReports: Record<string, ProjectReportLine[]>;
} {
  const projectReports: Record<string, ProjectReportLine[]> = {};

  for (const entry of entries) {
    if (!entry.endTime) {
      continue;
    }
    const line: ProjectReportLine = {
      reportDate,
      startTime: formatTimeFromISO(entry.startTime),
      endTime: formatTimeFromISO(entry.endTime),
      location: 1,
      originalLocation: 1,
      notes: "",
    };

    const existing = projectReports[entry.projectCode];
    if (existing) {
      existing.push(line);
    } else {
      projectReports[entry.projectCode] = [line];
    }
  }

  return {
    minStartDate: reportDate,
    maxEndDate: reportDate,
    browserID,
    projectReports,
  };
}

export default function ValidateRecordsScreen(): React.JSX.Element {
  const router = useRouter();
  const browserId = useBrowserId();
  const { entries, clearSentEntries } = useTimeEntries();
  const [reportDate, setReportDate] = useState(() => new Date());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<SendReportResult | null>(null);

  const completedEntries = entries.filter((e) => e.endTime !== null);
  const isSubmitDisabled = isSubmitting || completedEntries.length === 0 || !browserId;

  const totalMinutes = completedEntries.reduce((sum, e) => {
    if (!e.endTime) {
      return sum;
    }
    return sum + Math.round((new Date(e.endTime).getTime() - new Date(e.startTime).getTime()) / 60000);
  }, 0);
  const totalHours = Math.floor(totalMinutes / 60);
  const totalMins = totalMinutes % 60;

  async function handleSend(): Promise<void> {
    if (!browserId) {
      return;
    }
    setError("");
    setIsSubmitting(true);
    try {
      const dateStr = formatDate(reportDate);
      const payload = buildPayload(completedEntries, dateStr, browserId);
      const submitResult = await sendReport(payload);
      setResult(submitResult);
      const sentIds = completedEntries.map((e) => e.id);
      await clearSentEntries(sentIds);
      triggerHapticSuccess();
    } catch (err: unknown) {
      const apiError = err as { message?: string };
      setError(apiError.message ?? "Failed to send report");
      triggerHapticError();
    } finally {
      setIsSubmitting(false);
    }
  }

  if (result) {
    return (
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.resultScrollContent}
        contentInsetAdjustmentBehavior="automatic"
      >
        <Text style={styles.resultTitle}>Report Submitted</Text>
        <Text selectable style={styles.resultText}>
          Valid entries: {result.validLines.length}
        </Text>
        {result.invalidLines.length > 0 && (
          <Text selectable style={styles.resultError}>
            Invalid entries: {result.invalidLines.length}
          </Text>
        )}
        {result.invalidLines.map((line, i) => (
          <Text key={`invalid-${line.project}-${line.reportDate}-${i}`} selectable style={styles.resultErrorDetail}>
            {line.project} ({line.reportDate}): {line.reason}
          </Text>
        ))}
        <Pressable style={styles.primaryButton} onPress={(): void => router.dismissAll()}>
          <Text style={styles.primaryButtonText}>Back to Hive</Text>
        </Pressable>
      </ScrollView>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      contentInsetAdjustmentBehavior="automatic"
    >
      <Text style={styles.sectionTitle}>Report Date</Text>
      <DateTimePicker value={reportDate} onChange={setReportDate} mode="date" label="Date for all entries" />

      <Text style={styles.sectionTitle}>Entries to Send ({completedEntries.length})</Text>

      <View style={styles.summaryBar}>
        <Text style={styles.summaryText}>{completedEntries.length} entries</Text>
        <Text style={styles.summaryText}>
          {totalHours}h {String(totalMins).padStart(2, "0")}m total
        </Text>
      </View>

      {completedEntries.map((entry) => (
        <View key={entry.id} style={styles.entryCard}>
          <View style={styles.entryHeader}>
            <Text style={styles.entryProject} numberOfLines={1}>
              {entry.projectName}
            </Text>
            <Text style={styles.entryDuration}>
              {entry.endTime ? formatDuration(entry.startTime, entry.endTime) : ""}
            </Text>
          </View>
          <Text style={styles.entryClient} numberOfLines={1}>
            {entry.clientName}
          </Text>
          <Text style={styles.entryTime}>
            {formatTimeFromISO(entry.startTime)} - {entry.endTime ? formatTimeFromISO(entry.endTime) : "..."}
          </Text>
        </View>
      ))}

      {error ? (
        <Text selectable style={styles.error}>
          {error}
        </Text>
      ) : null}

      <Pressable
        style={[styles.primaryButton, isSubmitDisabled && styles.buttonDisabled]}
        onPress={handleSend}
        disabled={isSubmitDisabled}
      >
        {isSubmitting ? (
          <ActivityIndicator color={COLORS.background} />
        ) : (
          <Text style={styles.primaryButtonText}>Send Report</Text>
        )}
      </Pressable>
    </ScrollView>
  );
}

const styles: {
  container: ViewStyle;
  scrollContent: ViewStyle;
  sectionTitle: TextStyle;
  summaryBar: ViewStyle;
  summaryText: TextStyle;
  entryCard: ViewStyle;
  entryHeader: ViewStyle;
  entryProject: TextStyle;
  entryDuration: TextStyle;
  entryClient: TextStyle;
  entryTime: TextStyle;
  error: TextStyle;
  primaryButton: ViewStyle;
  primaryButtonText: TextStyle;
  buttonDisabled: ViewStyle;
  resultScrollContent: ViewStyle;
  resultTitle: TextStyle;
  resultText: TextStyle;
  resultError: TextStyle;
  resultErrorDetail: TextStyle;
} = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.text,
    marginBottom: 12,
    marginTop: 8,
  },
  summaryBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "#f5f5f5",
    borderRadius: 6,
    borderCurve: "continuous",
    marginBottom: 12,
  },
  summaryText: {
    fontSize: 13,
    fontWeight: "600",
    color: COLORS.textSecondary,
    fontVariant: ["tabular-nums"],
  },
  entryCard: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    borderCurve: "continuous",
    padding: 12,
    marginBottom: 8,
  },
  entryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  entryProject: {
    fontSize: 15,
    fontWeight: "600",
    color: COLORS.text,
    flex: 1,
  },
  entryDuration: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.primary,
    fontVariant: ["tabular-nums"],
    marginLeft: 8,
  },
  entryClient: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  entryTime: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontVariant: ["tabular-nums"],
  },
  error: {
    color: "#d32f2f",
    fontSize: 14,
    marginBottom: 16,
    textAlign: "center",
  },
  primaryButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    borderCurve: "continuous",
    padding: 16,
    alignItems: "center",
    marginTop: 8,
  },
  primaryButtonText: {
    color: COLORS.background,
    fontSize: 16,
    fontWeight: "600",
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  resultScrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 24,
  },
  resultTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: COLORS.text,
    textAlign: "center",
    marginBottom: 16,
  },
  resultText: {
    fontSize: 16,
    color: COLORS.text,
    textAlign: "center",
    marginBottom: 8,
  },
  resultError: {
    fontSize: 16,
    color: "#d32f2f",
    textAlign: "center",
    marginBottom: 8,
  },
  resultErrorDetail: {
    fontSize: 13,
    color: "#d32f2f",
    textAlign: "center",
    marginBottom: 4,
  },
});
