import { useEffect, useRef } from "react";
import { AppState } from "react-native";
import { checkAndUpdateStreak, hasUserOpenedAppToday } from "../db/actions";
import {
  onAppOpenedForNotifications,
  scheduleNextDailyNotification,
} from "../lib/dailyNotifications";

async function handleAppForeground() {
  if (!(await hasUserOpenedAppToday())) {
    // getTodayDrop() est volontairement absent ici :
    // le charger depuis deux endroits en même temps (Bootstrap + index.tsx)
    // créait une race condition qui marquait 2 mots comme appris au premier lancement.
    // L'écran d'accueil (index.tsx) est le seul responsable du mot du jour.
    await checkAndUpdateStreak();
  }
  await onAppOpenedForNotifications();
}

export function NotificationBootstrap() {
  const appState = useRef(AppState.currentState);

  useEffect(() => {
    scheduleNextDailyNotification();
    handleAppForeground();

    const appStateSub = AppState.addEventListener("change", (nextState) => {
      if (
        appState.current.match(/inactive|background/) &&
        nextState === "active"
      ) {
        handleAppForeground();
      }
      appState.current = nextState;
    });

    return () => {
      appStateSub.remove();
    };
  }, []);

  return null;
}
