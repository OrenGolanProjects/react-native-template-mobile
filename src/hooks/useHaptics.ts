import { ImpactFeedbackStyle, impactAsync, NotificationFeedbackType, notificationAsync } from "expo-haptics";

export function triggerHapticLight(): void {
  try {
    impactAsync(ImpactFeedbackStyle.Light);
  } catch {
    // Haptics unsupported on web
  }
}

export function triggerHapticSuccess(): void {
  try {
    notificationAsync(NotificationFeedbackType.Success);
  } catch {
    // Haptics unsupported on web
  }
}

export function triggerHapticError(): void {
  try {
    notificationAsync(NotificationFeedbackType.Error);
  } catch {
    // Haptics unsupported on web
  }
}
