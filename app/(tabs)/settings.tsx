import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as Notifications from 'expo-notifications';
import { useEffect, useState } from 'react';
import {
  Alert,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  Share,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import {
  scheduleNextDailyNotification,
  scheduleTestNotification,
  STORAGE_KEYS,
} from '../../lib/dailyNotifications';

// ─── Storage Keys ─────────────────────────────────────────────────────────────
const SETTINGS_KEYS = {
  streakRemind: 'settings_streak_remind',
  ...STORAGE_KEYS,
};
type ThemeMode = 'light' | 'dark' | 'auto';

// ─── Helpers ──────────────────────────────────────────────────────────────────
function formatTime(date: Date): string {
  const h = date.getHours();
  const m = date.getMinutes().toString().padStart(2, '0');
  const ampm = h >= 12 ? 'PM' : 'AM';
  const hour = h % 12 === 0 ? 12 : h % 12;
  return `${hour}:${m} ${ampm}`;
}

// ─── Section Label ────────────────────────────────────────────────────────────
function SectionLabel({ title }: { title: string }) {
  return (
    <View className="flex-row items-center gap-2 mb-3">
      <View className="w-5 h-0.5 bg-accent rounded-full" />
      <Text className="text-[11px] text-muted-light dark:text-muted-dark uppercase tracking-[2.5px]">
        {title}
      </Text>
    </View>
  );
}

// ─── Setting Group wrapper ────────────────────────────────────────────────────
function SettingGroup({ children }: { children: React.ReactNode }) {
  return (
    <View className="bg-white dark:bg-white/5 border border-border-light dark:border-border-dark rounded-2xl overflow-hidden">
      {children}
    </View>
  );
}

// ─── Setting Row ──────────────────────────────────────────────────────────────
function SettingRow({
  icon,
  iconBg,
  iconColor,
  title,
  subtitle,
  right,
  onPress,
  dimmed = false,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  iconBg: string;
  iconColor: string;
  title: string;
  subtitle: string;
  right: React.ReactNode;
  onPress?: () => void;
  dimmed?: boolean;
}) {
  const Row = onPress ? TouchableOpacity : View;

  return (
    <Row
      onPress={onPress}
      style={{ opacity: dimmed ? 0.4 : 1 }}
      className="flex-row items-center px-4 py-3.5 border-b border-border-light dark:border-border-dark last:border-b-0 gap-3"
    >
      <View
        style={{ backgroundColor: iconBg }}
        className="w-9 h-9 rounded-xl items-center justify-center"
      >
        <Ionicons name={icon} size={18} color={iconColor} />
      </View>
      <View className="flex-1">
        <Text className="font-geist-bold text-[14px] dark:text-primary-dark">{title}</Text>
        <Text className="text-[11px] text-muted-light dark:text-muted-dark mt-0.5">{subtitle}</Text>
      </View>
      {right}
    </Row>
  );
}

// ─── Custom Toggle ────────────────────────────────────────────────────────────
function CustomToggle({ value, onValueChange }: { value: boolean; onValueChange: (v: boolean) => void }) {
  return (
    <Switch
      value={value}
      onValueChange={onValueChange}
      trackColor={{ false: '#E8E4DE', true: '#E8410A' }}
      thumbColor="#fff"
      ios_backgroundColor="#E8E4DE"
    />
  );
}

// ─── Theme Selector ───────────────────────────────────────────────────────────
function ThemeSelector({
  value,
  onChange,
  isDark,
}: {
  value: ThemeMode;
  onChange: (v: ThemeMode) => void;
  isDark: boolean;
}) {
  const options: { key: ThemeMode; label: string }[] = [
    { key: 'light', label: 'Light' },
    { key: 'dark', label: 'Dark' },
    { key: 'auto', label: 'Auto' },
  ];

  return (
    <View className="flex-row gap-1.5">
      {options.map((opt) => {
        const active = value === opt.key;
        return (
          <Pressable
            key={opt.key}
            onPress={() => onChange(opt.key)}
            style={{
              paddingHorizontal: 10,
              paddingVertical: 5,
              borderRadius: 8,
              borderWidth: 1.5,
              borderColor: active
                ? '#1A1510'
                : isDark ? 'rgba(255,255,255,0.12)' : '#E8E4DE',
              backgroundColor: active ? '#1A1510' : 'transparent',
            }}
          >
            <Text
              style={{
                fontSize: 11,
                fontWeight: '600',
                color: active ? '#fff' : isDark ? '#666' : '#9A948C',
              }}
            >
              {opt.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function Settings() {
  const { isDark, setTheme } = useTheme();

  const [themeMode, setThemeMode] = useState<ThemeMode>('auto');
  const [notifOn, setNotifOn] = useState(true);
  const [streakRemind, setStreakRemind] = useState(true);
  const [reminderTime, setReminderTime] = useState(() => {
    const d = new Date();
    d.setHours(8, 0, 0, 0);
    return d;
  });
  const [showPicker, setShowPicker] = useState(false);

  // ── Charger les préférences sauvegardées au démarrage ──
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const [savedNotif, savedStreak, savedTime] = await Promise.all([
          AsyncStorage.getItem(STORAGE_KEYS.notifOn),
          AsyncStorage.getItem(SETTINGS_KEYS.streakRemind),
          AsyncStorage.getItem(STORAGE_KEYS.reminderTime),
        ]);

        if (savedNotif !== null) setNotifOn(savedNotif === 'true');
        if (savedStreak !== null) setStreakRemind(savedStreak === 'true');
        if (savedTime !== null) {
          const parsed = new Date(savedTime);
          if (!isNaN(parsed.getTime())) setReminderTime(parsed);
        }

        if (savedNotif !== 'false') {
          await scheduleNextDailyNotification();
        }
      } catch (e) {
        console.error('Failed to load settings:', e);
      }
    };

    loadSettings();
  }, []);

  // ── Theme handler ──
  const handleThemeChange = (mode: ThemeMode) => {
    setThemeMode(mode);
    if (mode === 'light') setTheme('light');
    else if (mode === 'dark') setTheme('dark');
    else setTheme('system');
  };

  // ── Notification toggle ──
  const handleNotifToggle = async (value: boolean) => {
    if (value) {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission required',
          'Please enable notifications in your device settings.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Open settings', onPress: () => Linking.openSettings() },
          ]
        );
        return;
      }
    }
    setNotifOn(value);
    await AsyncStorage.setItem(STORAGE_KEYS.notifOn, String(value));
    if (value) {
      await scheduleNextDailyNotification();
    } else {
      await Notifications.cancelAllScheduledNotificationsAsync();
    }
  };

  // ── Streak remind toggle ──
  const handleStreakRemindToggle = async (value: boolean) => {
    setStreakRemind(value);
    await AsyncStorage.setItem(SETTINGS_KEYS.streakRemind, String(value));
  };

  // ── Reminder time change ──
  const handleTimeChange = async (selected: Date) => {
    setReminderTime(selected);
    await AsyncStorage.setItem(STORAGE_KEYS.reminderTime, selected.toISOString());
    if (notifOn) {
      await scheduleNextDailyNotification();
    }
  };

  // ── Share ──
  const handleShare = async () => {
    await Share.share({
      message: "I'm learning new words every day with Wordly! Join me 🚀",
    });
  };

  // ── Test notification ──
  const handleTestNotif = async () => {
    await scheduleTestNotification();
    Alert.alert('Test sent!', 'Put the app in the background — notification arrives in 5 seconds.');
  };

  return (
    <View className="flex-1 bg-bg-light dark:bg-bg-dark">
      {/* ── Header ── */}
      <View className="px-6 pt-14 pb-3 border-b border-border-light dark:border-border-dark">
        <Text className="text-[11px] text-muted-light dark:text-muted-dark tracking-[3px] uppercase">
          Preferences
        </Text>
        <Text
          style={{ fontFamily: 'DMSerifDisplay_400Regular', fontSize: 36, lineHeight: 40 }}
          className="dark:text-primary-dark"
        >
          Settings
        </Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 48 }}
      >
        {/* ── Appearance ── */}
        <View className="px-6 pt-6">
          <SectionLabel title="Appearance" />
          <SettingGroup>
            <SettingRow
              icon="moon-outline"
              iconBg={isDark ? 'rgba(255,255,255,0.08)' : 'rgba(26,21,16,0.08)'}
              iconColor={isDark ? '#fff' : '#1A1510'}
              title="Theme"
              subtitle="Choose your preferred look"
              right={
                <ThemeSelector
                  value={themeMode}
                  onChange={handleThemeChange}
                  isDark={isDark}
                />
              }
            />
          </SettingGroup>
        </View>

        {/* ── Notifications ── */}
        <View className="px-6 pt-6">
          <SectionLabel title="Notifications" />
          <SettingGroup>

            <SettingRow
              icon="notifications-outline"
              iconBg="rgba(232,65,10,0.10)"
              iconColor="#E8410A"
              title="Daily word"
              subtitle="Receive a word every day"
              right={
                <CustomToggle value={notifOn} onValueChange={handleNotifToggle} />
              }
            />

            <SettingRow
              icon="time-outline"
              iconBg="#E6F1FB"
              iconColor="#185FA5"
              title="Reminder time"
              subtitle="When to receive your daily word"
              dimmed={!notifOn}
              onPress={notifOn ? () => setShowPicker(true) : undefined}
              right={
                <View className="flex-row items-center gap-1">
                  <Text
                    style={{
                      fontFamily: 'DMSerifDisplay_400Regular',
                      fontSize: 18,
                      color: '#E8410A',
                    }}
                  >
                    {formatTime(reminderTime)}
                  </Text>
                  <Ionicons
                    name="chevron-forward"
                    size={14}
                    color={isDark ? '#555' : '#9A948C'}
                  />
                </View>
              }
            />

          </SettingGroup>

          {showPicker ? (
            <DateTimePicker
              value={reminderTime}
              mode="time"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onValueChange={(_event, selected) => {
                if (selected) handleTimeChange(selected);
              }}
              onDismiss={() => setShowPicker(false)}
            />
          ) : null}

          {/* ── Test notification button (dev only) ── */}
          <TouchableOpacity
            onPress={handleTestNotif}
            style={{
              marginTop: 12,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              paddingVertical: 13,
              borderRadius: 16,
              borderWidth: 1,
              borderColor: isDark ? 'rgba(255,255,255,0.10)' : '#E8E4DE',
              backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)',
            }}
          >
            <Ionicons name="flask-outline" size={15} color={isDark ? '#aaa' : '#666'} />
            <Text style={{ fontFamily: 'Geist-Bold', fontSize: 13, color: isDark ? '#aaa' : '#555' }}>
              Test notification (5s)
            </Text>
          </TouchableOpacity>
        </View>

        {/* ── About ── */}
        <View className="px-6 pt-6">
          <SectionLabel title="About" />
          <SettingGroup>

            <SettingRow
              icon="star-outline"
              iconBg="#EEEDFE"
              iconColor="#534AB7"
              title="Rate the app"
              subtitle="Enjoying it? Leave a review!"
              onPress={() => Linking.openURL('https://apps.apple.com')}
              right={
                <Ionicons
                  name="chevron-forward"
                  size={16}
                  color={isDark ? '#555' : '#9A948C'}
                />
              }
            />

            <SettingRow
              icon="share-outline"
              iconBg="rgba(232,65,10,0.10)"
              iconColor="#E8410A"
              title="Share with a friend"
              subtitle="Spread the love of learning"
              onPress={handleShare}
              right={
                <Ionicons
                  name="chevron-forward"
                  size={16}
                  color={isDark ? '#555' : '#9A948C'}
                />
              }
            />

          </SettingGroup>
        </View>

        {/* ── App info ── */}
        <View className="items-center pt-8">
          <Text
            style={{ fontFamily: 'DMSerifDisplay_400Regular', fontSize: 20 }}
            className="dark:text-primary-dark mb-1"
          >
            Wordly
          </Text>
          <Text className="text-[12px] text-muted-light dark:text-muted-dark">
            Version 1.0.0
          </Text>
        </View>

      </ScrollView>
    </View>
  );
}