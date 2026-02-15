import { memo } from "react";
import { StyleSheet, Text, type TextStyle, View, type ViewStyle } from "react-native";
import { COLORS } from "@/constants/colors";
import type { DailyReportEntry } from "@/types/api";

const STATUS_COLORS = {
  approved: "#4caf50",
  open: "#ff9800",
} as const;

const approvedColorStyle: TextStyle = { color: STATUS_COLORS.approved };
const openColorStyle: TextStyle = { color: STATUS_COLORS.open };
const approvedBorderStyle: ViewStyle = { borderLeftColor: STATUS_COLORS.approved, borderLeftWidth: 4 };
const openBorderStyle: ViewStyle = { borderLeftColor: STATUS_COLORS.open, borderLeftWidth: 4 };

interface DailyReportCardProps {
  readonly item: DailyReportEntry;
}

function extractDate(dateStr: string): string {
  return dateStr.split("T")[0];
}

function formatTimeRange(startTime: string, endTime: string): string {
  return `${startTime.slice(0, 5)} - ${endTime.slice(0, 5)}`;
}

function formatHours(minutes: number): string {
  return (minutes / 60).toFixed(1);
}

function DailyReportCardInner({ item }: DailyReportCardProps): React.JSX.Element {
  const isApproved = item.status === "מאושר";
  const borderStyle = isApproved ? approvedBorderStyle : openBorderStyle;
  const colorStyle = isApproved ? approvedColorStyle : openColorStyle;

  return (
    <View style={[styles.card, borderStyle]}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.date}>{extractDate(item.dStartDate)}</Text>
          <Text style={styles.timeRange}>{formatTimeRange(item.dStartTime, item.dEndTime)}</Text>
        </View>
        <Text style={[styles.hours, colorStyle]}>{formatHours(item.quantity)}h</Text>
      </View>

      <Text style={styles.project}>{item.shortDescription}</Text>
      <Text style={styles.client}>{item.accName}</Text>

      <View style={styles.footer}>
        <Text style={styles.location}>{item.location}</Text>
        <Text style={[styles.statusBadge, colorStyle]}>{item.status}</Text>
      </View>
    </View>
  );
}

export const DailyReportCard: React.MemoExoticComponent<typeof DailyReportCardInner> = memo(DailyReportCardInner);

const styles: {
  card: ViewStyle;
  header: ViewStyle;
  headerLeft: ViewStyle;
  date: TextStyle;
  timeRange: TextStyle;
  hours: TextStyle;
  project: TextStyle;
  client: TextStyle;
  footer: ViewStyle;
  location: TextStyle;
  statusBadge: TextStyle;
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
  headerLeft: {
    gap: 2,
  },
  date: {
    fontSize: 15,
    fontWeight: "600",
    color: COLORS.text,
  },
  timeRange: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontVariant: ["tabular-nums"],
  },
  hours: {
    fontSize: 18,
    fontWeight: "bold",
    fontVariant: ["tabular-nums"],
  },
  project: {
    fontSize: 14,
    fontWeight: "500",
    color: COLORS.text,
    marginBottom: 2,
  },
  client: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginBottom: 6,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  location: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  statusBadge: {
    fontSize: 12,
    fontWeight: "600",
    textTransform: "uppercase",
  },
});
