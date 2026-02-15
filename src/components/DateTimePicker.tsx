import type { DateTimePickerEvent } from "@react-native-community/datetimepicker";
import RNDateTimePicker from "@react-native-community/datetimepicker";
import { useState } from "react";
import { Platform, Pressable, StyleSheet, Text, type TextStyle, View, type ViewStyle } from "react-native";
import { COLORS } from "@/constants/colors";

interface DateTimePickerProps {
  readonly value: Date;
  readonly onChange: (date: Date) => void;
  readonly mode: "date" | "time";
  readonly label: string;
}

export function DateTimePicker({ value, onChange, mode, label }: DateTimePickerProps): React.JSX.Element {
  const [show, setShow] = useState(false);

  function handleChange(_event: DateTimePickerEvent, selectedDate?: Date): void {
    if (Platform.OS === "android") {
      setShow(false);
    }
    if (selectedDate) {
      onChange(selectedDate);
    }
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
      <Pressable style={styles.button} onPress={(): void => setShow(true)}>
        <Text style={styles.buttonText}>{formatDisplay()}</Text>
      </Pressable>
      {show && (
        <RNDateTimePicker
          value={value}
          mode={mode}
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={handleChange}
        />
      )}
    </View>
  );
}

const styles: { container: ViewStyle; label: TextStyle; button: ViewStyle; buttonText: TextStyle } = StyleSheet.create({
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
    padding: 12,
    backgroundColor: COLORS.background,
  },
  buttonText: {
    fontSize: 16,
    color: COLORS.text,
  },
});
