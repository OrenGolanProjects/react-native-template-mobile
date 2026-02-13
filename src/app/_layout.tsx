import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

export default function RootLayout(): React.JSX.Element {
  return (
    <>
      <StatusBar style="auto" />
      <Stack>
        <Stack.Screen name="index" options={{ title: "Home" }} />
        <Stack.Screen name="+not-found" />
      </Stack>
    </>
  );
}
