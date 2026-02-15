import { memo } from "react";
import { StyleSheet, Text, type TextStyle, View, type ViewStyle } from "react-native";
import { COLORS } from "@/constants/colors";
import type { ReportEntry } from "@/types/api";

const STATUS_COLORS = {
  reported: "#4caf50",
  open: "#ff9800",
} as const;

const reportedBorderStyle: ViewStyle = { borderLeftColor: STATUS_COLORS.reported, borderLeftWidth: 4 };
const openBorderStyle: ViewStyle = { borderLeftColor: STATUS_COLORS.open, borderLeftWidth: 4 };
const reportedColorStyle: TextStyle = { color: STATUS_COLORS.reported };
const openColorStyle: TextStyle = { color: STATUS_COLORS.open };
const positiveDiffStyle: TextStyle = { color: STATUS_COLORS.reported };
const negativeDiffStyle: TextStyle = { color: "#d32f2f" };

interface ReportCardProps {
  readonly item: ReportEntry;
}

function extractDate(workDate: string): string {
  return workDate.split("T")[0];
}

function formatTimeRange(minTime: string | null, maxTime: string | null): string {
  if (!(minTime && maxTime)) {
    return "\u2014";
  }
  return `${minTime.slice(0, 5)} - ${maxTime.slice(0, 5)}`;
}

function ReportCardInner({ item }: ReportCardProps): React.JSX.Element {
  const isReported = item.lastDocID !== null;
  const borderStyle = isReported ? reportedBorderStyle : openBorderStyle;
  const colorStyle = isReported ? reportedColorStyle : openColorStyle;

  return (
    <View style={[styles.card, borderStyle]}>
      <View style={styles.header}>
        <View>
          <Text style={styles.date}>{extractDate(item.workDate)}</Text>
          <Text style={styles.day}>{item.dayInWeek}</Text>
        </View>
        <View style={styles.hoursSection}>
          <Text style={[styles.hours, colorStyle]}>{item.totalServiceHours.toFixed(1)}h</Text>
          <Text style={styles.expectedHours}>/ {item.agreementTotalHours}h</Text>
        </View>
      </View>

      <View style={styles.details}>
        <Text style={styles.timeRange}>{formatTimeRange(item.openReportingMinTime, item.openReportingManTime)}</Text>
        <Text style={[styles.statusBadge, colorStyle]}>{isReported ? "Reported" : "Open"}</Text>
      </View>

      {isReported && item.diffAgreementAndServiceHours !== 0 && (
        <Text style={[styles.diffText, item.diffAgreementAndServiceHours > 0 ? positiveDiffStyle : negativeDiffStyle]}>
          {item.diffAgreementAndServiceHours > 0 ? "+" : ""}
          {item.diffAgreementAndServiceHours.toFixed(1)}h vs expected
        </Text>
      )}
    </View>
  );
}

export const ReportCard: React.MemoExoticComponent<typeof ReportCardInner> = memo(ReportCardInner);

const styles: {
  card: ViewStyle;
  header: ViewStyle;
  date: TextStyle;
  day: TextStyle;
  hoursSection: ViewStyle;
  hours: TextStyle;
  expectedHours: TextStyle;
  details: ViewStyle;
  timeRange: TextStyle;
  statusBadge: TextStyle;
  diffText: TextStyle;
} = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    borderCurve: "continuous",
    padding: 14,
    marginBottom: 10,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 6,
  },
  date: {
    fontSize: 15,
    fontWeight: "600",
    color: COLORS.text,
  },
  day: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  hoursSection: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 4,
  },
  hours: {
    fontSize: 18,
    fontWeight: "bold",
    fontVariant: ["tabular-nums"],
  },
  expectedHours: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontVariant: ["tabular-nums"],
  },
  details: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  timeRange: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontVariant: ["tabular-nums"],
  },
  statusBadge: {
    fontSize: 12,
    fontWeight: "600",
    textTransform: "uppercase",
  },
  diffText: {
    fontSize: 12,
    marginTop: 4,
    fontVariant: ["tabular-nums"],
  },
});
