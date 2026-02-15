import { memo } from "react";
import { Pressable, StyleSheet, Text, type TextStyle, View, type ViewStyle } from "react-native";
import { COLORS } from "@/constants/colors";
import type { Project } from "@/types/api";

interface ProjectHiveCardProps {
  readonly project: Project;
  readonly isActive: boolean;
  readonly elapsedSeconds: number;
  readonly onPress: (project: Project) => void;
}

function formatElapsed(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function ProjectHiveCardInner({ project, isActive, elapsedSeconds, onPress }: ProjectHiveCardProps): React.JSX.Element {
  return (
    <Pressable style={[styles.card, isActive && styles.cardActive]} onPress={(): void => onPress(project)}>
      <View style={[styles.indicator, isActive && styles.indicatorActive]} />
      <Text style={styles.projectCode} numberOfLines={1}>
        {project.btCode}
      </Text>
      <Text style={styles.projectName} numberOfLines={2}>
        {project.shortDescription}
      </Text>
      <Text style={styles.clientName} numberOfLines={1}>
        {project.btaccName}
      </Text>
      {isActive ? (
        <Text style={styles.timer}>{formatElapsed(elapsedSeconds)}</Text>
      ) : (
        <Text style={styles.tapHint}>Tap to start</Text>
      )}
    </Pressable>
  );
}

export const ProjectHiveCard: React.MemoExoticComponent<typeof ProjectHiveCardInner> = memo(ProjectHiveCardInner);

const styles: {
  card: ViewStyle;
  cardActive: ViewStyle;
  indicator: ViewStyle;
  indicatorActive: ViewStyle;
  projectCode: TextStyle;
  projectName: TextStyle;
  clientName: TextStyle;
  timer: TextStyle;
  tapHint: TextStyle;
} = StyleSheet.create({
  card: {
    flex: 1,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    borderCurve: "continuous",
    padding: 14,
    margin: 6,
    minHeight: 140,
    justifyContent: "space-between",
  },
  cardActive: {
    borderColor: COLORS.primary,
    backgroundColor: "#e8f0fe",
  },
  indicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.border,
    marginBottom: 8,
  },
  indicatorActive: {
    backgroundColor: "#4caf50",
  },
  projectCode: {
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.primary,
    marginBottom: 4,
  },
  projectName: {
    fontSize: 14,
    fontWeight: "500",
    color: COLORS.text,
    marginBottom: 4,
  },
  clientName: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 8,
  },
  timer: {
    fontSize: 16,
    fontWeight: "bold",
    fontVariant: ["tabular-nums"],
    color: COLORS.primary,
    textAlign: "center",
  },
  tapHint: {
    fontSize: 12,
    color: COLORS.textSecondary,
    textAlign: "center",
  },
});
