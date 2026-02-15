import type { DateTimePickerEvent } from "@react-native-community/datetimepicker";
import RNDateTimePicker from "@react-native-community/datetimepicker";
import { useState } from "react";
import { Pressable, StyleSheet, Text, type TextStyle, View, type ViewStyle } from "react-native";
import { COLORS } from "@/constants/colors";

interface DateTimePickerProps {
  readonly value: Date;
  readonly onChange: (date: Date) => void;
  readonly mode: "date" | "time";
  readonly label: string;
}

export function DateTimePicker({ value, onChange, mode, label }: DateTimePickerProps): React.JSX.Element {
  const [show, setShow] = useState(false);

  function handleChange(event: DateTimePickerEvent, selectedDate?: Date): void {
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
