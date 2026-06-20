import { DMSerifDisplay_400Regular } from "@expo-google-fonts/dm-serif-display";
import { useFonts } from "expo-font";
import * as Notifications from "expo-notifications";
import { router, Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { Platform } from "react-native";
import "react-native-gesture-handler";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { ThemeProvider } from "../context/ThemeContext";
import { DatabaseProvider } from "../db/Provider";
import { hasUserOpenedAppToday } from "../db/actions";
import { handleNotificationResponse } from "../lib/dailyNotifications";
import "../global.css";

Notifications.setNotificationHandler({
  handleNotification: async (notification) => {
    const data = notification.request.content.data as
      | Record<string, unknown>
      | undefined;
    const isDailyWord = data?.type === "daily_word";

    if (isDailyWord && (await hasUserOpenedAppToday())) {
      return {
        shouldShowAlert: false,
        shouldPlaySound: false,
        shouldSetBadge: false,
        shouldShowBanner: false,
        shouldShowList: false,
      };
    }

    return {
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    };
  },
});

if (Platform.OS === "android") {
  Notifications.setNotificationChannelAsync("default", {
    name: "Daily Word",
    importance: Notifications.AndroidImportance.HIGH,
    vibrationPattern: [0, 250, 250, 250],
    enableVibrate: true,
  });
}

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    "Geist-Regular": require("../assets/fonts/Geist-Regular.ttf"),
    "Geist-Bold": require("../assets/fonts/Geist-Bold.ttf"),
    "Inter-Regular": require("../assets/fonts/Inter-Regular.ttf"),
    "Inter-Bold": require("../assets/fonts/Inter-Bold.ttf"),
    DMSerifDisplay_400Regular,
  });

  useEffect(() => {
    const handleResponse = async (
      response: Notifications.NotificationResponse,
    ) => {
      const data = response.notification.request.content.data as
        | Record<string, unknown>
        | undefined;
      const result = await handleNotificationResponse(
        response.actionIdentifier,
        data,
        response.notification.request.identifier,
      );

      if (result === "open_app") {
        router.replace("/");
      }

      Notifications.clearLastNotificationResponse();
    };

    Notifications.getLastNotificationResponseAsync().then((response) => {
      if (response) handleResponse(response);
    });

    const responseSubscription =
      Notifications.addNotificationResponseReceivedListener(handleResponse);

    return () => {
      responseSubscription.remove();
    };
  }, []);

  useEffect(() => {
    if (loaded || error) SplashScreen.hideAsync();
  }, [loaded, error]);

  if (!loaded && !error) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <DatabaseProvider>
        <ThemeProvider>
          <Stack screenOptions={{ headerShown: false }} />
          <StatusBar style="auto" />
        </ThemeProvider>
      </DatabaseProvider>
    </GestureHandlerRootView>
  );
}
