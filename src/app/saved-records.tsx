import { useFocusEffect, useRouter } from "expo-router";
import { useCallback } from "react";
import { Alert, Pressable, SectionList, StyleSheet, Text, type TextStyle, View, type ViewStyle } from "react-native";
import { TimeEntryRow } from "@/components/TimeEntryRow";
import { COLORS } from "@/constants/colors";
import { triggerHapticLight } from "@/hooks/useHaptics";
import { useTimeEntries } from "@/hooks/useTimeEntries";
import type { TimeEntry } from "@/types/api";

interface Section {
  readonly title: string;
  readonly data: readonly TimeEntry[];
}

function groupByDate(entries: readonly TimeEntry[]): readonly Section[] {
  const completed = entries.filter((e) => e.endTime !== null);
  const groups = new Map<string, TimeEntry[]>();
  for (const entry of completed) {
    const existing = groups.get(entry.date);
    if (existing) {
      existing.push(entry);
    } else {
      groups.set(entry.date, [entry]);
    }
  }
  return [...groups.entries()].sort(([a], [b]) => b.localeCompare(a)).map(([title, data]) => ({ title, data }));
}

export default function SavedRecordsScreen(): React.JSX.Element {
  const router = useRouter();
  const { entries, completedCount, removeEntry, reload } = useTimeEntries();

  useFocusEffect(
    useCallback(() => {
      reload();
    }, [reload])
  );

  const sections = groupByDate(entries);

  const handleDelete = useCallback(
    (id: string): void => {
      Alert.alert("Delete Entry", "Are you sure you want to delete this time entry?", [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async (): Promise<void> => {
            await removeEntry(id);
          },
        },
      ]);
    },
    [removeEntry]
  );

  const renderItem = useCallback(
    ({ item }: { item: TimeEntry }): React.JSX.Element => {
      return <TimeEntryRow entry={item} onDelete={handleDelete} />;
    },
    [handleDelete]
  );

  const renderSectionHeader = useCallback(({ section }: { section: Section }): React.JSX.Element => {
    return (
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionHeaderText}>{section.title}</Text>
      </View>
    );
  }, []);

  const keyExtractor = useCallback((item: TimeEntry): string => {
    return item.id;
  }, []);

  return (
    <View style={styles.container}>
      <SectionList
        sections={sections as Section[]}
        renderItem={renderItem}
        renderSectionHeader={renderSectionHeader}
        keyExtractor={keyExtractor}
        contentContainerStyle={styles.listContent}
        contentInsetAdjustmentBehavior="automatic"
        ListEmptyComponent={<Text style={styles.emptyText}>No saved records yet. Track time from the Hive.</Text>}
      />

      <View style={styles.bottomBar}>
        <Pressable
          style={[styles.primaryButton, completedCount === 0 && styles.buttonDisabled]}
          disabled={completedCount === 0}
          onPress={(): void => {
            triggerHapticLight();
            router.push("/validate-records");
          }}
        >
          <Text style={styles.primaryButtonText}>Send All ({completedCount})</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles: {
  container: ViewStyle;
  listContent: ViewStyle;
  sectionHeader: ViewStyle;
  sectionHeaderText: TextStyle;
  emptyText: TextStyle;
  bottomBar: ViewStyle;
  primaryButton: ViewStyle;
  primaryButtonText: TextStyle;
  buttonDisabled: ViewStyle;
} = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  listContent: {
    padding: 16,
  },
  sectionHeader: {
    backgroundColor: "#f5f5f5",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    borderCurve: "continuous",
    marginBottom: 8,
    marginTop: 4,
  },
  sectionHeaderText: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.textSecondary,
  },
  emptyText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: "center",
    marginTop: 40,
  },
  bottomBar: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  primaryButton: {
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
  buttonDisabled: {
    opacity: 0.5,
  },
});
