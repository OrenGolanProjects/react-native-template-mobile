import { StyleSheet, Text, type TextStyle, View, type ViewStyle } from "react-native";

export default function HomeScreen(): React.JSX.Element {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>React Native Template</Text>
      <Text style={styles.subtitle}>Edit src/app/index.tsx to get started</Text>
    </View>
  );
}

const styles: { container: ViewStyle; title: TextStyle; subtitle: TextStyle } = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#666666",
    textAlign: "center",
  },
});
