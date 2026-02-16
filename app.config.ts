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
    infoPlist: {
      // biome-ignore lint/style/useNamingConvention: Apple's required key name
      ITSAppUsesNonExemptEncryption: false,
    },
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
  plugins: ["expo-router", "expo-font", "expo-secure-store", "@react-native-community/datetimepicker"],
  extra: {
    eas: {
      projectId: "e5eabf6b-c943-439e-800a-f9b83059208d",
    },
  },
  experiments: {
    typedRoutes: true,
  },
};

export default config;
