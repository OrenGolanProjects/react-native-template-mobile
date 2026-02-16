import { useState } from "react";
import { Platform, Pressable, StyleSheet, Text, type TextStyle, View, type ViewStyle } from "react-native";
import { COLORS } from "@/constants/colors";

interface DateTimePickerProps {
  readonly value: Date;
  readonly onChange: (date: Date) => void;
  readonly mode: "date" | "time";
  readonly label: string;
}

function formatDateInput(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function formatTimeInput(date: Date): string {
  const h = String(date.getHours()).padStart(2, "0");
  const min = String(date.getMinutes()).padStart(2, "0");
  return `${h}:${min}`;
}

function WebDateTimePicker({ value, onChange, mode, label }: DateTimePickerProps): React.JSX.Element {
  const inputValue = mode === "date" ? formatDateInput(value) : formatTimeInput(value);

  function handleWebChange(e: React.ChangeEvent<HTMLInputElement>): void {
    const raw = e.target.value;
    if (!raw) {
      return;
    }
    if (mode === "date") {
      const [y, m, d] = raw.split("-").map(Number);
      const next = new Date(value);
      next.setFullYear(y, m - 1, d);
      onChange(next);
    } else {
      const [h, min] = raw.split(":").map(Number);
      const next = new Date(value);
      next.setHours(h, min);
      onChange(next);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <input
        type={mode === "date" ? "date" : "time"}
        value={inputValue}
        onChange={handleWebChange}
        style={{
          fontSize: 16,
          padding: 12,
          borderWidth: 1,
          borderColor: COLORS.border,
          borderRadius: 8,
          backgroundColor: COLORS.background,
          color: COLORS.text,
          outline: "none",
          border: `1px solid ${COLORS.border}`,
        }}
      />
    </View>
  );
}

function NativeDateTimePicker({ value, onChange, mode, label }: DateTimePickerProps): React.JSX.Element {
  const [show, setShow] = useState(false);

  function handleChange(event: { type: string }, selectedDate?: Date): void {
    if (process.env.EXPO_OS === "android") {
      setShow(false);
    }
    if (event.type === "dismissed") {
      setShow(false);
      return;
    }
    if (selectedDate) {
      onChange(selectedDate);
    }
  }

  function togglePicker(): void {
    setShow((prev) => !prev);
  }

  function formatDisplay(): string {
    if (mode === "date") {
      return value.toISOString().split("T")[0];
    }
    return value.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false });
  }

  // biome-ignore lint/style/noCommonJs: dynamic require to avoid loading native module on web
  const RNDateTimePicker = require("@react-native-community/datetimepicker").default;

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <Pressable style={styles.button} onPress={togglePicker}>
        <Text style={styles.buttonText}>{formatDisplay()}</Text>
      </Pressable>
      {show && (
        <>
          <RNDateTimePicker
            value={value}
            mode={mode}
            display={process.env.EXPO_OS === "ios" ? "spinner" : "default"}
            onChange={handleChange}
          />
          {process.env.EXPO_OS === "ios" && (
            <Pressable style={styles.doneButton} onPress={(): void => setShow(false)}>
              <Text style={styles.doneButtonText}>Done</Text>
            </Pressable>
          )}
        </>
      )}
    </View>
  );
}

export function DateTimePicker(props: DateTimePickerProps): React.JSX.Element {
  if (Platform.OS === "web") {
    return <WebDateTimePicker {...props} />;
  }
  return <NativeDateTimePicker {...props} />;
}

const styles: {
  container: ViewStyle;
  label: TextStyle;
  button: ViewStyle;
  buttonText: TextStyle;
  doneButton: ViewStyle;
  doneButtonText: TextStyle;
} = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 6,
  },
  button: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    borderCurve: "continuous",
    padding: 12,
    backgroundColor: COLORS.background,
  },
  buttonText: {
    fontSize: 16,
    color: COLORS.text,
  },
  doneButton: {
    alignSelf: "flex-end",
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  doneButtonText: {
    color: COLORS.primary,
    fontSize: 16,
    fontWeight: "600",
  },
});
