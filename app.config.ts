import { ExpoConfig, ConfigContext } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: "Hackathon-Practice",
  slug: "Hackathon-Practice",
  version: "1.0.0",
  orientation: "portrait",
  icon: "./assets/images/icon.png",
  scheme: "hackathonpractice",
  userInterfaceStyle: "automatic",
  ios: {
    icon: "./assets/expo.icon"
  },
  android: {
    package: "com.hackathon.practice",
    adaptiveIcon: {
      backgroundColor: "#E6F4FE",
      foregroundImage: "./assets/images/android-icon-foreground.png",
      backgroundImage: "./assets/images/android-icon-background.png",
      monochromeImage: "./assets/images/android-icon-monochrome.png"
    },
    predictiveBackGestureEnabled: false,
    config: {
      googleMaps: {
        apiKey: process.env.GOOGLE_MAPS_ANDROID_API_KEY || ""
      }
    }
  },
  web: {
    output: "static",
    favicon: "./assets/images/favicon.png"
  },
  plugins: [
    "expo-router",
    [
      "expo-splash-screen",
      {
        "backgroundColor": "#208AEF",
        "image": "./assets/images/splash-icon.png",
        "imageWidth": 76
      }
    ],
    [
      "expo-camera",
      {
        "cameraPermission": "Allow this app to access your camera to scan ID cards."
      }
    ],
    [
      "expo-location",
      {
        "locationAlwaysAndWhenInUsePermission": "Allow this app to access your location to show it on the map."
      }
    ]
  ],
  experiments: {
    typedRoutes: true,
    reactCompiler: true
  }
});
