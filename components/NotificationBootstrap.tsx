import { useEffect, useRef } from 'react';
import { AppState } from 'react-native';
import { checkAndUpdateStreak, getTodayDrop, hasUserOpenedAppToday } from '../db/actions';
import {
  onAppOpenedForNotifications,
  scheduleNextDailyNotification,
} from '../lib/dailyNotifications';

async function handleAppForeground() {
  if (!(await hasUserOpenedAppToday())) {
    await getTodayDrop();
    await checkAndUpdateStreak();
  }
  await onAppOpenedForNotifications();
}

export function NotificationBootstrap() {
  const appState = useRef(AppState.currentState);

  useEffect(() => {
    scheduleNextDailyNotification();
    handleAppForeground();

    const appStateSub = AppState.addEventListener('change', (nextState) => {
      if (appState.current.match(/inactive|background/) && nextState === 'active') {
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
