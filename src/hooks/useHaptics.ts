import { ImpactFeedbackStyle, impactAsync, NotificationFeedbackType, notificationAsync } from "expo-haptics";

export function triggerHapticLight(): void {
  impactAsync(ImpactFeedbackStyle.Light);
}

export function triggerHapticSuccess(): void {
  notificationAsync(NotificationFeedbackType.Success);
}

export function triggerHapticError(): void {
  notificationAsync(NotificationFeedbackType.Error);
}
