import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  type TextStyle,
  View,
  type ViewStyle,
} from "react-native";
import { DateTimePicker } from "@/components/DateTimePicker";
import { COLORS } from "@/constants/colors";
import { useBrowserId } from "@/hooks/useBrowserId";
import { triggerHapticError, triggerHapticLight, triggerHapticSuccess } from "@/hooks/useHaptics";
import { getUserProjects, sendReport } from "@/services/api";
import type { Project, SendReportResult } from "@/types/api";

function formatDate(date: Date): string {
  return date.toISOString().split("T")[0];
}

function formatTime(date: Date): string {
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${hours}:${minutes}`;
}

export default function SubmitReportScreen(): React.JSX.Element {
  const router = useRouter();
  const browserId = useBrowserId();
  const [projects, setProjects] = useState<readonly Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [reportDate, setReportDate] = useState(() => new Date());
  const [startTime, setStartTime] = useState(() => {
    const d = new Date();
    d.setHours(9, 0, 0, 0);
    return d;
  });
  const [endTime, setEndTime] = useState(() => {
    const d = new Date();
    d.setHours(17, 0, 0, 0);
    return d;
  });
  const [notes, setNotes] = useState("");
  const [isLoadingProjects, setIsLoadingProjects] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<SendReportResult | null>(null);

  const isSubmitDisabled = isSubmitting || !selectedProject;

  useEffect(() => {
    async function loadProjects(): Promise<void> {
      if (!browserId) {
        return;
      }
      try {
        const data = await getUserProjects(browserId);
        setProjects(data);
      } catch (err: unknown) {
        const apiError = err as { message?: string };
        setError(apiError.message ?? "Failed to load projects");
      } finally {
        setIsLoadingProjects(false);
      }
    }
    loadProjects();
  }, [browserId]);

  async function handleSubmit(): Promise<void> {
    if (!(selectedProject && browserId)) {
      setError("Please select a project");
      return;
    }
    setError("");
    setIsSubmitting(true);
    try {
      const dateStr = formatDate(reportDate);
      const submitResult = await sendReport({
        minStartDate: dateStr,
        maxEndDate: dateStr,
        browserID: browserId,
        projectReports: {
          [selectedProject.btCode]: [
            {
              reportDate: dateStr,
              startTime: formatTime(startTime),
              endTime: formatTime(endTime),
              location: 1,
              originalLocation: 1,
              notes: notes.trim(),
            },
          ],
        },
      });
      setResult(submitResult);
      triggerHapticSuccess();
    } catch (err: unknown) {
      const apiError = err as { message?: string };
      setError(apiError.message ?? "Failed to submit report");
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
        <Pressable style={styles.primaryButton} onPress={(): void => router.back()}>
          <Text style={styles.primaryButtonText}>Back to Reports</Text>
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
      <Text style={styles.sectionTitle}>Select Project</Text>

      {isLoadingProjects ? (
        <ActivityIndicator color={COLORS.primary} style={styles.loader} />
      ) : (
        <View style={styles.projectList}>
          {projects.map((project) => (
            <Pressable
              key={project.btCode}
              style={[styles.projectCard, selectedProject?.btCode === project.btCode && styles.projectCardSelected]}
              onPress={(): void => {
                triggerHapticLight();
                setSelectedProject(project);
              }}
            >
              <Text style={styles.projectCode}>{project.btCode}</Text>
              <Text style={styles.projectName}>{project.shortDescription}</Text>
              <Text style={styles.projectClient}>{project.btaccName}</Text>
            </Pressable>
          ))}
        </View>
      )}

      <Text style={styles.sectionTitle}>Report Details</Text>

      <DateTimePicker value={reportDate} onChange={setReportDate} mode="date" label="Date" />

      <View style={styles.timeRow}>
        <View style={styles.timePickerWrapper}>
          <DateTimePicker value={startTime} onChange={setStartTime} mode="time" label="Start Time" />
        </View>
        <View style={styles.timePickerWrapper}>
          <DateTimePicker value={endTime} onChange={setEndTime} mode="time" label="End Time" />
        </View>
      </View>

      <Text style={styles.inputLabel}>Notes</Text>
      <TextInput
        style={styles.notesInput}
        placeholder="Optional notes..."
        placeholderTextColor={COLORS.textSecondary}
        value={notes}
        onChangeText={setNotes}
        multiline
        numberOfLines={3}
      />

      {error ? (
        <Text selectable style={styles.error}>
          {error}
        </Text>
      ) : null}

      <Pressable
        style={[styles.primaryButton, isSubmitDisabled && styles.buttonDisabled]}
        onPress={handleSubmit}
        disabled={isSubmitDisabled}
      >
        {isSubmitting ? (
          <ActivityIndicator color={COLORS.background} />
        ) : (
          <Text style={styles.primaryButtonText}>Submit Report</Text>
        )}
      </Pressable>
    </ScrollView>
  );
}

const styles: {
  container: ViewStyle;
  scrollContent: ViewStyle;
  sectionTitle: TextStyle;
  loader: ViewStyle;
  projectList: ViewStyle;
  projectCard: ViewStyle;
  projectCardSelected: ViewStyle;
  projectCode: TextStyle;
  projectName: TextStyle;
  projectClient: TextStyle;
  timeRow: ViewStyle;
  timePickerWrapper: ViewStyle;
  inputLabel: TextStyle;
  notesInput: TextStyle;
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
  loader: {
    marginVertical: 20,
  },
  projectList: {
    marginBottom: 16,
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
  timeRow: {
    flexDirection: "row",
    gap: 12,
  },
  timePickerWrapper: {
    flex: 1,
  },
  inputLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 6,
  },
  notesInput: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    borderCurve: "continuous",
    padding: 12,
    fontSize: 16,
    color: COLORS.text,
    marginBottom: 16,
    minHeight: 80,
    textAlignVertical: "top",
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
