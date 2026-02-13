import { useColorScheme } from "react-native";

import { COLORS } from "@/constants/colors";

interface AppColors {
  readonly background: string;
  readonly text: string;
}

export function useAppColorScheme(): AppColors {
  const colorScheme = useColorScheme();

  if (colorScheme === "dark") {
    return {
      background: "#1a1a1a",
      text: "#ffffff",
    };
  }

  return {
    background: COLORS.background,
    text: COLORS.text,
  };
}
