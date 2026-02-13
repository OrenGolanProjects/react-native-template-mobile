import type { ExpoConfig } from "expo/config";

const config: ExpoConfig = {
  name: "Mobile Template",
  slug: "react-native-template-mobile",
  version: "1.0.0",
  orientation: "portrait",
  icon: "./assets/images/icon.png",
  scheme: "mobile-template",
  userInterfaceStyle: "automatic",
  newArchEnabled: true,
  ios: {
    supportsTablet: true,
    bundleIdentifier: "com.template.mobile",
  },
  android: {
    adaptiveIcon: {
      foregroundImage: "./assets/images/adaptive-icon.png",
      backgroundColor: "#ffffff",
    },
    package: "com.template.mobile",
  },
  web: {
    output: "static",
    favicon: "./assets/images/favicon.png",
  },
  plugins: ["expo-router", "expo-font"],
  experiments: {
    typedRoutes: true,
  },
};

export default config;
