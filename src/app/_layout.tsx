import { Stack, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, type TextStyle, View, type ViewStyle } from "react-native";
import { COLORS } from "@/constants/colors";
import { AuthProvider, useAuth } from "@/services/authContext";

function AuthGate(): React.JSX.Element {
  const { user, isLoading, signOut } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) {
      return;
    }

    const currentRoute = segments[0] as string | undefined;
    const isOnSignIn = currentRoute === "sign-in";

    if (!(user || isOnSignIn)) {
      router.replace("/sign-in");
    } else if (user && isOnSignIn) {
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
      <Stack.Screen
        name="index"
        options={{
          title: "Project Hive",
          headerRight: () => (
            <Pressable onPress={signOut} hitSlop={8}>
              <Text style={styles.signOutText}>Sign Out</Text>
            </Pressable>
          ),
        }}
      />
      <Stack.Screen name="reports" options={{ title: "Reports" }} />
      <Stack.Screen name="saved-records" options={{ title: "Saved Records" }} />
      <Stack.Screen name="validate-records" options={{ title: "Review & Send" }} />
      <Stack.Screen name="submit-report" options={{ title: "Submit Report" }} />
      <Stack.Screen name="sign-in" options={{ headerShown: false }} />
      <Stack.Screen name="+not-found" />
    </Stack>
  );
}

export default function RootLayout(): React.JSX.Element {
  return (
    <AuthProvider>
      <StatusBar style="auto" />
      <AuthGate />
    </AuthProvider>
  );
}

const styles: { loading: ViewStyle; signOutText: TextStyle } = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.background,
  },
  signOutText: {
    color: COLORS.primary,
    fontSize: 14,
  },
});
