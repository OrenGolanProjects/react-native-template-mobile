import { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  type TextStyle,
  View,
  type ViewStyle,
} from "react-native";
import { COLORS } from "@/constants/colors";
import { triggerHapticError } from "@/hooks/useHaptics";
import { saveUserCredentials } from "@/services/api";
import { useAuth } from "@/services/authContext";

export default function SignInScreen(): React.JSX.Element {
  const { signIn, signUp } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [employeeCode, setEmployeeCode] = useState("");
  const [employeePass, setEmployeePass] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(): Promise<void> {
    if (!(email.trim() && password.trim())) {
      setError("Email and password are required");
      return;
    }

    if (isSignUp && !(employeeCode.trim() && employeePass.trim())) {
      setError("Employee code and password are required for sign up");
      return;
    }

    setError("");
    setIsLoading(true);
    try {
      if (isSignUp) {
        await signUp(email.trim(), password);
        await saveUserCredentials({
          employeeCode: employeeCode.trim(),
          employeePass: employeePass.trim(),
        });
      } else {
        await signIn(email.trim(), password);
      }
    } catch (err: unknown) {
      const firebaseError = err as { message?: string };
      setError(firebaseError.message ?? "Authentication failed");
      triggerHapticError();
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView style={styles.container} behavior={process.env.EXPO_OS === "ios" ? "padding" : "height"}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>DH Reporting</Text>
        <Text style={styles.subtitle}>{isSignUp ? "Create an account" : "Sign in to continue"}</Text>

        <Text style={styles.sectionLabel}>Firebase Account</Text>

        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor={COLORS.textSecondary}
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          textContentType="emailAddress"
        />

        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor={COLORS.textSecondary}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          textContentType="password"
        />

        {isSignUp ? (
          <View>
            <Text style={styles.sectionLabel}>ERP Credentials</Text>

            <TextInput
              style={styles.input}
              placeholder="Employee Code"
              placeholderTextColor={COLORS.textSecondary}
              value={employeeCode}
              onChangeText={setEmployeeCode}
              autoCapitalize="none"
            />

            <TextInput
              style={styles.input}
              placeholder="Employee Password"
              placeholderTextColor={COLORS.textSecondary}
              value={employeePass}
              onChangeText={setEmployeePass}
              secureTextEntry
            />
          </View>
        ) : null}

        {error ? (
          <Text selectable style={styles.error}>
            {error}
          </Text>
        ) : null}

        <Pressable
          style={[styles.primaryButton, isLoading && styles.buttonDisabled]}
          onPress={handleSubmit}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color={COLORS.background} />
          ) : (
            <Text style={styles.primaryButtonText}>{isSignUp ? "Sign Up" : "Sign In"}</Text>
          )}
        </Pressable>

        <Pressable style={styles.secondaryButton} onPress={(): void => setIsSignUp((prev) => !prev)}>
          <Text style={styles.secondaryButtonText}>
            {isSignUp ? "Already have an account? Sign In" : "Don't have an account? Sign Up"}
          </Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles: {
  container: ViewStyle;
  content: ViewStyle;
  title: TextStyle;
  subtitle: TextStyle;
  sectionLabel: TextStyle;
  input: TextStyle;
  error: TextStyle;
  primaryButton: ViewStyle;
  primaryButtonText: TextStyle;
  buttonDisabled: ViewStyle;
  secondaryButton: ViewStyle;
  secondaryButtonText: TextStyle;
} = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: COLORS.text,
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: "center",
    marginBottom: 32,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: COLORS.textSecondary,
    textTransform: "uppercase",
    marginBottom: 8,
    marginTop: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    borderCurve: "continuous",
    padding: 14,
    fontSize: 16,
    color: COLORS.text,
    marginBottom: 16,
    backgroundColor: COLORS.background,
  },
  error: {
    color: "#d32f2f",
    fontSize: 14,
    marginBottom: 16,
    textAlign: "center",
  },
  primaryButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    borderCurve: "continuous",
    padding: 16,
    alignItems: "center",
    marginBottom: 12,
  },
  primaryButtonText: {
    color: COLORS.background,
    fontSize: 16,
    fontWeight: "600",
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  secondaryButton: {
    padding: 12,
    alignItems: "center",
  },
  secondaryButtonText: {
    color: COLORS.primary,
    fontSize: 14,
  },
});
