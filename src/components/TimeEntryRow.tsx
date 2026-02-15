import { memo } from "react";
import { Pressable, StyleSheet, Text, type TextStyle, View, type ViewStyle } from "react-native";
import { COLORS } from "@/constants/colors";
import { triggerHapticLight } from "@/hooks/useHaptics";
import type { TimeEntry } from "@/types/api";

interface TimeEntryRowProps {
  readonly entry: TimeEntry;
  readonly onDelete: (id: string) => void;
}

function formatTimeFromISO(isoString: string): string {
  const date = new Date(isoString);
  return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
}

function formatDuration(startISO: string, endISO: string): string {
  const diffMs = new Date(endISO).getTime() - new Date(startISO).getTime();
  const totalMinutes = Math.round(diffMs / 60000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${hours}h ${String(minutes).padStart(2, "0")}m`;
}

function TimeEntryRowInner({ entry, onDelete }: TimeEntryRowProps): React.JSX.Element {
  const timeRange = entry.endTime
    ? `${formatTimeFromISO(entry.startTime)} - ${formatTimeFromISO(entry.endTime)}`
    : `${formatTimeFromISO(entry.startTime)} - ...`;

  const duration = entry.endTime ? formatDuration(entry.startTime, entry.endTime) : "In progress";

  return (
    <View style={styles.row}>
      <View style={styles.info}>
        <Text style={styles.projectName} numberOfLines={1}>
          {entry.projectName}
        </Text>
        <Text style={styles.clientName} numberOfLines={1}>
          {entry.clientName}
        </Text>
        <View style={styles.timeInfo}>
          <Text style={styles.timeRange}>{timeRange}</Text>
          <Text style={styles.duration}>{duration}</Text>
        </View>
      </View>
      <Pressable
        style={styles.deleteButton}
        onPress={(): void => {
          triggerHapticLight();
          onDelete(entry.id);
        }}
        hitSlop={8}
      >
        <Text style={styles.deleteText}>Delete</Text>
      </Pressable>
    </View>
  );
}

export const TimeEntryRow: React.MemoExoticComponent<typeof TimeEntryRowInner> = memo(TimeEntryRowInner);

const styles: {
  row: ViewStyle;
  info: ViewStyle;
  projectName: TextStyle;
  clientName: TextStyle;
  timeInfo: ViewStyle;
  timeRange: TextStyle;
  duration: TextStyle;
  deleteButton: ViewStyle;
  deleteText: TextStyle;
} = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    borderCurve: "continuous",
    padding: 14,
    marginBottom: 8,
  },
  info: {
    flex: 1,
  },
  projectName: {
    fontSize: 15,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: 2,
  },
  clientName: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginBottom: 6,
  },
  timeInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  timeRange: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontVariant: ["tabular-nums"],
  },
  duration: {
    fontSize: 13,
    fontWeight: "600",
    color: COLORS.primary,
    fontVariant: ["tabular-nums"],
  },
  deleteButton: {
    paddingLeft: 12,
  },
  deleteText: {
    fontSize: 14,
    color: "#d32f2f",
    fontWeight: "500",
  },
});
