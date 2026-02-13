export const COLORS = {
  primary: "#2e78b7",
  background: "#ffffff",
  text: "#1a1a1a",
  textSecondary: "#666666",
  border: "#e0e0e0",
} as const;

export type ColorName = keyof typeof COLORS;
