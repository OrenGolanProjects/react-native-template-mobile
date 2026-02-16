import { useFocusEffect, useRouter } from "expo-router";
import { useCallback } from "react";
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
import { ProjectHiveCard } from "@/components/ProjectHiveCard";
import { COLORS } from "@/constants/colors";
import { triggerHapticLight } from "@/hooks/useHaptics";
import { useProjects } from "@/hooks/useProjects";
import { useTimeEntries } from "@/hooks/useTimeEntries";
import type { Project } from "@/types/api";

export default function ProjectHiveScreen(): React.JSX.Element {
  const router = useRouter();
  const { activeEntry, elapsedSeconds, completedCount, toggleTracking, reload } = useTimeEntries();
  const { projects, isLoading: isLoadingProjects, error } = useProjects();

  useFocusEffect(
    useCallback(() => {
      reload();
    }, [reload])
  );

  const handleToggle = useCallback(
    async (project: Project): Promise<void> => {
      await toggleTracking(project);
    },
    [toggleTracking]
  );

  const renderProjectCard = useCallback(
    ({ item }: { item: Project }): React.JSX.Element => {
      const isActive = activeEntry?.projectCode === item.btCode;
      return (
        <ProjectHiveCard
          project={item}
          isActive={isActive}
          elapsedSeconds={isActive ? elapsedSeconds : 0}
          onPress={handleToggle}
        />
      );
    },
    [activeEntry, elapsedSeconds, handleToggle]
  );

  const keyExtractor = useCallback((item: Project): string => {
    return item.btCode;
  }, []);

  return (
    <View style={styles.container}>
      {error ? (
        <Text selectable style={styles.error}>
          {error}
        </Text>
      ) : null}

      {isLoadingProjects ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading projects...</Text>
        </View>
      ) : (
        <FlatList
          data={projects}
          renderItem={renderProjectCard}
          keyExtractor={keyExtractor}
          numColumns={2}
          contentContainerStyle={styles.gridContent}
          contentInsetAdjustmentBehavior="automatic"
          ListEmptyComponent={
            <Text style={styles.emptyText}>No projects found. Check your credentials in Settings.</Text>
          }
        />
      )}

      <View style={styles.bottomBar}>
        <Pressable
          style={styles.secondaryButton}
          onPress={(): void => {
            triggerHapticLight();
            router.push("/reports");
          }}
        >
          <Text style={styles.secondaryButtonText}>View Reports</Text>
        </Pressable>
        <Pressable
          style={styles.primaryButton}
          onPress={(): void => {
            triggerHapticLight();
            router.push("/saved-records");
          }}
        >
          <Text style={styles.primaryButtonText}>Saved Records ({completedCount})</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles: {
  container: ViewStyle;
  error: TextStyle;
  loadingContainer: ViewStyle;
  loadingText: TextStyle;
  gridContent: ViewStyle;
  emptyText: TextStyle;
  bottomBar: ViewStyle;
  secondaryButton: ViewStyle;
  secondaryButtonText: TextStyle;
  primaryButton: ViewStyle;
  primaryButtonText: TextStyle;
} = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  error: {
    color: "#d32f2f",
    fontSize: 14,
    padding: 16,
    textAlign: "center",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  gridContent: {
    padding: 10,
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
  secondaryButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: COLORS.primary,
    borderRadius: 8,
    borderCurve: "continuous",
    padding: 14,
    alignItems: "center",
  },
  secondaryButtonText: {
    color: COLORS.primary,
    fontSize: 16,
    fontWeight: "600",
  },
  primaryButton: {
    flex: 1,
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    borderCurve: "continuous",
    padding: 14,
    alignItems: "center",
  },
  primaryButtonText: {
    color: COLORS.background,
    fontSize: 16,
    fontWeight: "600",
  },
});
