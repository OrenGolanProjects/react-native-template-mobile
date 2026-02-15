import { Stack, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { ActivityIndicator, StyleSheet, View, type ViewStyle } from "react-native";
import { COLORS } from "@/constants/colors";
import { AuthProvider, useAuth } from "@/services/authContext";

function AuthGate(): React.JSX.Element {
  const { user, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  console.warn("[APP] AuthGate render — isLoading:", isLoading, "user:", user?.email ?? "null");

  useEffect(() => {
    if (isLoading) {
      return;
    }

    const currentRoute = segments[0] as string | undefined;
    const isOnSignIn = currentRoute === "sign-in";

    if (!(user || isOnSignIn)) {
      console.warn("[APP] AuthGate: no user → redirecting to sign-in");
      router.replace("/sign-in");
    } else if (user && isOnSignIn) {
      console.warn("[APP] AuthGate: authenticated → redirecting to home");
      router.replace("/");
    }
  }, [user, isLoading, segments, router]);

  if (isLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: "Reports" }} />
      <Stack.Screen name="submit-report" options={{ title: "Submit Report" }} />
      <Stack.Screen name="sign-in" options={{ headerShown: false }} />
      <Stack.Screen name="+not-found" />
    </Stack>
  );
}

export default function RootLayout(): React.JSX.Element {
  console.warn("[APP] RootLayout render");
  return (
    <AuthProvider>
      <StatusBar style="auto" />
      <AuthGate />
    </AuthProvider>
  );
}

const styles: { loading: ViewStyle } = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.background,
  },
});
