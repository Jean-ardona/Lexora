import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import * as TaskManager from 'expo-task-manager';
import {
  getOrAssignDropForDate,
  getOrAssignTodayDropForNotif,
  hasUserOpenedAppToday,
  markTodayDropLearnedFromNotif,
} from '../db/actions';

export const STORAGE_KEYS = {
  notifOn: 'settings_notif_on',
  reminderTime: 'settings_reminder_time',
  handledDate: 'daily_notif_handled_date',
} as const;

export const BACKGROUND_NOTIFICATION_TASK = 'daily-word-background-task';

const dateToString = (date: Date) => date.toISOString().split('T')[0];

export async function getReminderTime(): Promise<Date> {
  const saved = await AsyncStorage.getItem(STORAGE_KEYS.reminderTime);
  if (saved) {
    const parsed = new Date(saved);
    if (!isNaN(parsed.getTime())) return parsed;
  }
  const fallback = new Date();
  fallback.setHours(8, 0, 0, 0);
  return fallback;
}

export async function isNotificationsEnabled(): Promise<boolean> {
  const saved = await AsyncStorage.getItem(STORAGE_KEYS.notifOn);
  return saved !== 'false';
}

function computeNextFireDate(reminderTime: Date, skipToday: boolean): Date {
  const now = new Date();
  const fire = new Date(now);
  fire.setSeconds(0, 0);
  fire.setHours(reminderTime.getHours(), reminderTime.getMinutes(), 0, 0);

  if (skipToday || fire <= now) {
    fire.setDate(fire.getDate() + 1);
  }

  return fire;
}

export const NOTIFICATION_ACTIONS = {
  GOT_IT: 'GOT_IT',
  LEARN_MORE: 'LEARN_MORE',
} as const;

async function ensureNotificationCategory() {
  await Notifications.setNotificationCategoryAsync('DAILY_WORD', [
    {
      identifier: NOTIFICATION_ACTIONS.GOT_IT,
      buttonTitle: '✅ Got it',
      options: {
        isDestructive: false,
        isAuthenticationRequired: false,
        opensAppToForeground: false,
      },
    },
    {
      identifier: NOTIFICATION_ACTIONS.LEARN_MORE,
      buttonTitle: '📖 Learn more',
      options: {
        isDestructive: false,
        isAuthenticationRequired: false,
        opensAppToForeground: true,
      },
    },
  ]);
}

export async function handleGotItFromNotification(): Promise<void> {
  const today = dateToString(new Date());
  const alreadyHandled = await AsyncStorage.getItem(STORAGE_KEYS.handledDate);
  if (alreadyHandled === today) {
    await scheduleNextDailyNotification();
    return;
  }

  if (await hasUserOpenedAppToday()) {
    await scheduleNextDailyNotification();
    return;
  }

  await markTodayDropLearnedFromNotif();
  await AsyncStorage.setItem(STORAGE_KEYS.handledDate, today);
  await scheduleNextDailyNotification();
}

export async function scheduleNextDailyNotification(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();

  const enabled = await isNotificationsEnabled();
  if (!enabled) return;

  const { status } = await Notifications.getPermissionsAsync();
  if (status !== 'granted') return;

  const reminderTime = await getReminderTime();
  const openedToday = await hasUserOpenedAppToday();
  const fireDate = computeNextFireDate(reminderTime, openedToday);
  const fireDateStr = dateToString(fireDate);

  const drop = await getOrAssignDropForDate(fireDateStr);
  if (!drop) return;

  await ensureNotificationCategory();

  await Notifications.scheduleNotificationAsync({
    content: {
      title: drop.term,
      body: drop.definition,
      categoryIdentifier: 'DAILY_WORD',
      data: { type: 'daily_word', dropId: drop.id, fireDate: fireDateStr },
      sound: true,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: fireDate,
      channelId: 'default',
    },
  });
}

async function dismissNotification(notificationId?: string) {
  try {
    if (notificationId) {
      await Notifications.dismissNotificationAsync(notificationId);
    } else {
      await Notifications.dismissAllNotificationsAsync();
    }
  } catch (error) {
    console.warn('Failed to dismiss notification:', error);
  }
}

export async function handleNotificationResponse(
  actionId: string,
  data: Record<string, unknown> | undefined,
  notificationId?: string
): Promise<'got_it' | 'open_app' | 'ignored'> {
  if (actionId === NOTIFICATION_ACTIONS.GOT_IT) {
    if (isDailyWordNotification(data)) {
      await handleGotItFromNotification();
    }
    await dismissNotification(notificationId);
    return 'got_it';
  }

  if (!isDailyWordNotification(data)) return 'ignored';

  if (
    actionId === NOTIFICATION_ACTIONS.LEARN_MORE ||
    actionId === Notifications.DEFAULT_ACTION_IDENTIFIER
  ) {
    return 'open_app';
  }

  return 'ignored';
}

export async function onAppOpenedForNotifications(): Promise<void> {
  await Notifications.dismissAllNotificationsAsync();
  await scheduleNextDailyNotification();
}

function isDailyWordNotification(data: Record<string, unknown> | undefined) {
  return data?.type === 'daily_word';
}

TaskManager.defineTask(BACKGROUND_NOTIFICATION_TASK, async ({ data, error }) => {
  if (error) {
    console.error('Background notification task error:', error);
    return;
  }

  const payload = data as
    | {
        actionIdentifier?: string;
        notification?: Notifications.Notification;
      }
    | undefined;
  if (!payload) return;

  const notificationData = payload.notification?.request.content.data as
    | Record<string, unknown>
    | undefined;

  if ('actionIdentifier' in payload && payload.actionIdentifier) {
    const notificationId = payload.notification?.request.identifier;
    await handleNotificationResponse(
      payload.actionIdentifier,
      notificationData,
      notificationId
    );
    return;
  }

  // Réception en arrière-plan : on affiche seulement la notif, pas de marquage auto
});

Notifications.registerTaskAsync(BACKGROUND_NOTIFICATION_TASK).catch((error) => {
  console.warn('Background notification task registration failed:', error);
});

// Les réponses aux actions sont gérées dans app/_layout.tsx (navigation incluse).

export async function scheduleTestNotification(): Promise<void> {
  await ensureNotificationCategory();
  const drop = await getOrAssignTodayDropForNotif();

  await Notifications.scheduleNotificationAsync({
    content: {
      title: drop ? drop.term : 'Your word of the day 📖',
      body: drop ? drop.definition : 'A new word is waiting for you!',
      categoryIdentifier: 'DAILY_WORD',
      data: { type: 'daily_word_test', dropId: drop?.id ?? null },
      sound: true,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: 5,
      channelId: 'default',
    },
  });
}
