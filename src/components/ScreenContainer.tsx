import type { ReactNode } from "react";
import { StyleSheet, View } from "react-native";

interface ScreenContainerProps {
  readonly children: ReactNode;
}

export function ScreenContainer({ children }: ScreenContainerProps): React.JSX.Element {
  return <View style={styles.container}>{children}</View>;
}

const styles: ReturnType<typeof StyleSheet.create> = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
  },
});
