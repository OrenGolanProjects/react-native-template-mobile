import { useEffect, useState } from "react";
import {
  Modal,
  Platform,
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
import { triggerHapticLight, triggerHapticSuccess } from "@/hooks/useHaptics";
import type { Project, TimeEntry, TimeEntryEditable } from "@/types/api";

interface EditEntryModalProps {
  readonly visible: boolean;
  readonly entry: TimeEntry | null;
  readonly projects: readonly Project[];
  readonly onSave: (id: string, updates: TimeEntryEditable) => Promise<void>;
  readonly onClose: () => void;
}

function parseDate(dateStr: string): Date {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function formatDateStr(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function buildISOString(date: Date, time: Date): string {
  const result = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
    time.getHours(),
    time.getMinutes(),
    0,
    0
  );
  return result.toISOString();
}

export function EditEntryModal({ visible, entry, projects, onSave, onClose }: EditEntryModalProps): React.JSX.Element {
  const [editDate, setEditDate] = useState(() => new Date());
  const [editStartTime, setEditStartTime] = useState(() => new Date());
  const [editEndTime, setEditEndTime] = useState(() => new Date());
  const [selectedProjectCode, setSelectedProjectCode] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [validationError, setValidationError] = useState("");

  useEffect(() => {
    if (entry) {
      setEditDate(parseDate(entry.date));
      setEditStartTime(new Date(entry.startTime));
      setEditEndTime(entry.endTime ? new Date(entry.endTime) : new Date());
      setSelectedProjectCode(entry.projectCode);
      setValidationError("");
      setIsSaving(false);
    }
  }, [entry]);

  async function handleSave(): Promise<void> {
    if (!entry) {
      return;
    }

    const newStartISO = buildISOString(editDate, editStartTime);
    const newEndISO = buildISOString(editDate, editEndTime);

    if (new Date(newEndISO).getTime() <= new Date(newStartISO).getTime()) {
      setValidationError("End time must be after start time");
      return;
    }

    setValidationError("");
    setIsSaving(true);

    const newDateStr = formatDateStr(editDate);
    const selectedProject = projects.find((p) => p.btCode === selectedProjectCode);
    const projectChanged = selectedProjectCode !== entry.projectCode && selectedProject;

    const updates: TimeEntryEditable = {
      ...(newDateStr !== entry.date ? { date: newDateStr } : {}),
      ...(newStartISO !== entry.startTime ? { startTime: newStartISO } : {}),
      ...(newEndISO !== entry.endTime ? { endTime: newEndISO } : {}),
      ...(projectChanged
        ? {
            projectCode: selectedProject.btCode,
            projectName: selectedProject.shortDescription,
            clientName: selectedProject.btaccName,
          }
        : {}),
    };

    await onSave(entry.id, updates);
    triggerHapticSuccess();
    setIsSaving(false);
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle={Platform.OS === "ios" ? "pageSheet" : "fullScreen"}
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <Pressable
            onPress={(): void => {
              triggerHapticLight();
              onClose();
            }}
            hitSlop={8}
          >
            <Text style={styles.cancelText}>Cancel</Text>
          </Pressable>
          <Text style={styles.headerTitle}>Edit Entry</Text>
          <Pressable
            onPress={(): void => {
              triggerHapticLight();
              handleSave();
            }}
            disabled={isSaving}
            hitSlop={8}
          >
            <Text style={[styles.saveText, isSaving && styles.saveTextDisabled]}>
              {isSaving ? "Saving..." : "Save"}
            </Text>
          </Pressable>
        </View>

        <ScrollView style={styles.body} contentContainerStyle={styles.bodyContent}>
          <Text style={styles.sectionTitle}>Date</Text>
          <DateTimePicker value={editDate} onChange={setEditDate} mode="date" label="Report date" />

          <Text style={styles.sectionTitle}>Time</Text>
          <View style={styles.timeRow}>
            <View style={styles.timePickerWrapper}>
              <DateTimePicker value={editStartTime} onChange={setEditStartTime} mode="time" label="Start" />
            </View>
            <View style={styles.timePickerWrapper}>
              <DateTimePicker value={editEndTime} onChange={setEditEndTime} mode="time" label="End" />
            </View>
          </View>

          {validationError ? <Text style={styles.error}>{validationError}</Text> : null}

          <Text style={styles.sectionTitle}>Project</Text>
          {projects.map((project) => (
            <Pressable
              key={project.btCode}
              style={[styles.projectCard, selectedProjectCode === project.btCode && styles.projectCardSelected]}
              onPress={(): void => {
                triggerHapticLight();
                setSelectedProjectCode(project.btCode);
              }}
            >
              <Text style={styles.projectCode}>{project.btCode}</Text>
              <Text style={styles.projectName}>{project.shortDescription}</Text>
              <Text style={styles.projectClient}>{project.btaccName}</Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles: {
  container: ViewStyle;
  header: ViewStyle;
  cancelText: TextStyle;
  headerTitle: TextStyle;
  saveText: TextStyle;
  saveTextDisabled: TextStyle;
  body: ViewStyle;
  bodyContent: ViewStyle;
  sectionTitle: TextStyle;
  timeRow: ViewStyle;
  timePickerWrapper: ViewStyle;
  error: TextStyle;
  projectCard: ViewStyle;
  projectCardSelected: ViewStyle;
  projectCode: TextStyle;
  projectName: TextStyle;
  projectClient: TextStyle;
} = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  cancelText: {
    fontSize: 16,
    color: COLORS.textSecondary,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: "600",
    color: COLORS.text,
  },
  saveText: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.primary,
  },
  saveTextDisabled: {
    opacity: 0.5,
  },
  body: {
    flex: 1,
  },
  bodyContent: {
    padding: 16,
    paddingBottom: 40,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: 8,
    marginTop: 8,
  },
  timeRow: {
    flexDirection: "row",
    gap: 12,
  },
  timePickerWrapper: {
    flex: 1,
  },
  error: {
    color: "#d32f2f",
    fontSize: 14,
    marginBottom: 8,
  },
  projectCard: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    borderCurve: "continuous",
    padding: 12,
    marginBottom: 8,
  },
  projectCardSelected: {
    borderColor: COLORS.primary,
    backgroundColor: "#e8f0fe",
  },
  projectCode: {
    fontSize: 13,
    fontWeight: "600",
    color: COLORS.primary,
    marginBottom: 2,
  },
  projectName: {
    fontSize: 15,
    fontWeight: "500",
    color: COLORS.text,
    marginBottom: 2,
  },
  projectClient: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
});
