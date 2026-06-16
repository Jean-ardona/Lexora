import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Animated, FlatList, Text, View } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import {
    checkAndUpdateStreak,
    getDaysActive,
    getLearnedWords,
    getTotalPracticesCount,
} from '../../db/actions';

// ─── Types ────────────────────────────────────────────────────────────────────
type Badge = {
  id: string;
  emoji: string;
  name: string;
  description: string;
  requiredWords: number;
};

// ─── Config badges sur 365 jours ─────────────────────────────────────────────
const BADGES: Badge[] = [
  { id: '1', emoji: '🌱', name: 'First Step',  description: 'Learned your first 7 words',  requiredWords: 7   },
  { id: '2', emoji: '📖', name: 'Bookworm',    description: 'Reached 21 words learned',    requiredWords: 21  },
  { id: '3', emoji: '⚡', name: 'On Fire',     description: 'Reached 50 words learned',    requiredWords: 50  },
  { id: '4', emoji: '🌙', name: 'Night Owl',   description: 'Reached 90 words learned',    requiredWords: 90  },
  { id: '5', emoji: '🧠', name: 'Brainiac',    description: 'Reached 140 words learned',   requiredWords: 140 },
  { id: '6', emoji: '🎯', name: 'Sharp Mind',  description: 'Reached 200 words learned',   requiredWords: 200 },
  { id: '7', emoji: '✍️', name: 'Wordsmith',  description: 'Reached 280 words learned',   requiredWords: 280 },
  { id: '8', emoji: '👑', name: 'Lexicon King',description: 'Completed a full year — 365', requiredWords: 365 },
];

function getNextBadge(wordsLearned: number): { badge: Badge; progress: number } | null {
  const next = BADGES.find(b => b.requiredWords > wordsLearned);
  if (!next) return null;
  const prev = BADGES[BADGES.indexOf(next) - 1];
  const from = prev?.requiredWords ?? 0;
  const progress = ((wordsLearned - from) / (next.requiredWords - from)) * 100;
  return { badge: next, progress: Math.round(progress) };
}

// ─── Animated Progress Bar ────────────────────────────────────────────────────
function ProgressBar({
  percentage,
  height = 6,
  color = '#E8410A',
  bgColor,
}: {
  percentage: number;
  height?: number;
  color?: string;
  bgColor?: string;
}) {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(anim, {
      toValue: percentage,
      duration: 1200,
      useNativeDriver: false,
    }).start();
  }, [percentage]);

  const width = anim.interpolate({ inputRange: [0, 100], outputRange: ['0%', '100%'] });

  return (
    <View
      style={{
        height,
        backgroundColor: bgColor ?? 'rgba(0,0,0,0.06)',
        borderRadius: height / 2,
        overflow: 'hidden',
      }}
    >
      <Animated.View style={{ width, height, backgroundColor: color, borderRadius: height / 2 }} />
    </View>
  );
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

// ─── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({
  icon,
  label,
  value,
  tag,
  accent = false,
  isDark,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string | number;
  tag: string;
  accent?: boolean;
  isDark: boolean;
}) {
  return (
    <View
      className="flex-1 rounded-2xl p-4 border"
      style={{
        backgroundColor: accent
          ? isDark ? 'rgba(232,65,10,0.12)' : '#FFF0EB'
          : isDark ? 'rgba(255,255,255,0.05)' : '#FFFFFF',
        borderColor: accent
          ? isDark ? 'rgba(232,65,10,0.3)' : '#FDDDD2'
          : isDark ? 'rgba(255,255,255,0.08)' : '#E8E4DE',
      }}
    >
      <View className="flex-row items-center gap-1.5 mb-2">
        <Ionicons name={icon} size={13} color={isDark ? 'rgba(255,255,255,0.35)' : '#9A948C'} />
        <Text className="text-[11px] text-muted-light dark:text-muted-dark">{label}</Text>
      </View>
      <Text
        style={{ fontFamily: 'DMSerifDisplay_400Regular', fontSize: 36, color: '#E8410A', lineHeight: 40 }}
      >
        {value}
      </Text>
      <Text className="text-[11px] text-muted-light dark:text-muted-dark mt-0.5">{tag}</Text>
    </View>
  );
}

// ─── Next Badge Card ──────────────────────────────────────────────────────────
function NextBadgeCard({
  badge,
  progress,
  wordsLearned,
  isDark,
}: {
  badge: Badge;
  progress: number;
  wordsLearned: number;
  isDark: boolean;
}) {
  const remaining = badge.requiredWords - wordsLearned;

  return (
    <View
      className="rounded-2xl p-4 border"
      style={{
        backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#FFFFFF',
        borderColor: isDark ? 'rgba(255,255,255,0.08)' : '#E8E4DE',
      }}
    >
      <View className="flex-row items-center justify-between mb-4">
        <View className="flex-row items-center gap-3">
          <View
            className="w-12 h-12 rounded-2xl items-center justify-center"
            style={{
              backgroundColor: isDark ? 'rgba(232,65,10,0.15)' : '#FFF0EB',
              borderWidth: 1.5,
              borderColor: isDark ? 'rgba(232,65,10,0.3)' : '#FDDDD2',
            }}
          >
            <Text style={{ fontSize: 22 }}>{badge.emoji}</Text>
          </View>
          <View>
            <Text className="font-geist-bold text-[15px] dark:text-primary-dark">{badge.name}</Text>
            <Text className="text-[12px] text-muted-light dark:text-muted-dark mt-0.5">
              {badge.description}
            </Text>
          </View>
        </View>
        <Text style={{ fontFamily: 'DMSerifDisplay_400Regular', fontSize: 22, color: '#E8410A' }}>
          {progress}%
        </Text>
      </View>

      <ProgressBar percentage={progress} height={6} />

      <View className="flex-row justify-between mt-2">
        <Text className="text-[11px] text-muted-light dark:text-muted-dark">
          {wordsLearned} / {badge.requiredWords} words
        </Text>
        <Text className="text-[11px] text-accent font-geist-bold">
          {remaining} more to go!
        </Text>
      </View>
    </View>
  );
}

// ─── All badges unlocked card ─────────────────────────────────────────────────
function AllBadgesUnlockedCard({ isDark }: { isDark: boolean }) {
  return (
    <View
      className="rounded-2xl p-5 border items-center"
      style={{
        backgroundColor: isDark ? 'rgba(232,65,10,0.12)' : '#FFF0EB',
        borderColor: isDark ? 'rgba(232,65,10,0.3)' : '#FDDDD2',
      }}
    >
      <Text style={{ fontSize: 36, marginBottom: 8 }}>👑</Text>
      <Text className="font-geist-bold text-[16px] dark:text-primary-dark mb-1">
        Lexicon King!
      </Text>
      <Text className="text-[12px] text-muted-light dark:text-muted-dark text-center">
        You've unlocked every badge. Absolute legend. 🔥
      </Text>
    </View>
  );
}

// ─── Badge Card ───────────────────────────────────────────────────────────────
function BadgeCard({
  badge,
  unlocked,
  wordsToGo,
  isDark,
}: {
  badge: Badge;
  unlocked: boolean;
  wordsToGo: number;
  isDark: boolean;
}) {
  return (
    <View
      className="flex-1 rounded-2xl p-4 border items-center"
      style={{
        opacity: unlocked ? 1 : 0.45,
        backgroundColor: unlocked
          ? isDark ? 'rgba(232,65,10,0.12)' : '#FFF0EB'
          : isDark ? 'rgba(255,255,255,0.05)' : '#FFFFFF',
        borderColor: unlocked
          ? isDark ? 'rgba(232,65,10,0.3)' : '#FDDDD2'
          : isDark ? 'rgba(255,255,255,0.08)' : '#E8E4DE',
        borderWidth: 1.5,
      }}
    >
      <View
        className="w-14 h-14 rounded-2xl items-center justify-center mb-2"
        style={{
          backgroundColor: unlocked
            ? isDark ? 'rgba(255,255,255,0.08)' : '#1E1C19'
            : isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)',
        }}
      >
        <Text style={{ fontSize: 26 }}>{badge.emoji}</Text>
      </View>
      <Text className="font-geist-bold text-[13px] dark:text-primary-dark text-center mb-1">
        {badge.name}
      </Text>
      <Text
        className="text-[11px] text-muted-light dark:text-muted-dark text-center leading-4"
        numberOfLines={2}
      >
        {badge.description}
      </Text>
      <Text
        className="text-[10px] font-geist-bold uppercase tracking-wide mt-2"
        style={{ color: unlocked ? '#E8410A' : isDark ? '#555' : '#9A948C' }}
      >
        {unlocked ? 'Unlocked ✓' : `${wordsToGo} left`}
      </Text>
    </View>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function Progress() {
  const { isDark } = useTheme();

  const [stats, setStats] = useState({
    streak: 0,
    bestStreak: 0,
    wordsLearned: 0,
    practicesDone: 0,
    daysActive: 0,
  });

  useFocusEffect(
    useCallback(() => {
      const fetchStats = async () => {
        const [learnedWords, streakData, practicesCount, daysActive] = await Promise.all([
          getLearnedWords(),
          checkAndUpdateStreak(),
          getTotalPracticesCount(),
          getDaysActive(),
        ]);

        setStats({
          streak: streakData.streak,
          bestStreak: streakData.bestStreak,
          wordsLearned: learnedWords.length,
          practicesDone: practicesCount,
          daysActive,
        });
      };

      fetchStats();
    }, [])
  );

  const nextBadge = getNextBadge(stats.wordsLearned);
  const allUnlocked = stats.wordsLearned >= 365;

  const sections = [
    { type: 'streak' },
    { type: 'stats' },
    { type: 'nextBadge' },
    { type: 'badges' },
  ];

  const renderItem = ({ item }: { item: { type: string } }) => {
    switch (item.type) {

      case 'streak':
        return (
          <View className="px-6 pt-6">
            <SectionLabel title="Streak" />
            <View className="bg-bg-dark dark:bg-white/5 rounded-2xl p-5 flex-row items-center justify-between">
              <View>
                <Text className="text-[11px] text-white/35 uppercase tracking-widest mb-1">
                  Current streak
                </Text>
                <Text
                  style={{ fontFamily: 'DMSerifDisplay_400Regular', fontSize: 64, color: '#fff', lineHeight: 68 }}
                >
                  {stats.streak}
                </Text>
                <Text className="text-xs text-white/35 mt-1">consecutive days</Text>
              </View>
              <View className="items-center gap-2">
                <View className="w-16 h-16 rounded-2xl bg-accent items-center justify-center">
                  <Text style={{ fontSize: 28 }}>🔥</Text>
                </View>
                {stats.bestStreak > 0 && (
                  <View className="items-center">
                    <Text className="text-[10px] text-white/35 uppercase tracking-widest">Best</Text>
                    <Text className="text-[13px] font-geist-bold text-white/60">
                      {stats.bestStreak} days
                    </Text>
                  </View>
                )}
              </View>
            </View>
          </View>
        );

      case 'stats':
        return (
          <View className="px-6 pt-5">
            <SectionLabel title="Stats" />
            <View className="flex-row gap-3 mb-3">
              <StatCard
                icon="book-outline"
                label="Words learned"
                value={stats.wordsLearned}
                tag="total words"
                accent
                isDark={isDark}
              />
              <StatCard
                icon="calendar-outline"
                label="Days active"
                value={stats.daysActive}
                tag="since start"
                isDark={isDark}
              />
            </View>
            <View className="flex-row gap-3">
              <StatCard
                icon="create-outline"
                label="Practices done"
                value={stats.practicesDone}
                tag="sentences written"
                isDark={isDark}
              />
              <StatCard
                icon="trophy-outline"
                label="Best streak"
                value={stats.bestStreak}
                tag="days record 🏆"
                accent
                isDark={isDark}
              />
            </View>
          </View>
        );

      case 'nextBadge':
        if (allUnlocked) return null;
        if (!nextBadge) return null;
        return (
          <View className="px-6 pt-5">
            <SectionLabel title="Next badge" />
            <NextBadgeCard
              badge={nextBadge.badge}
              progress={nextBadge.progress}
              wordsLearned={stats.wordsLearned}
              isDark={isDark}
            />
          </View>
        );

      case 'badges':
        return (
          <View className="px-6 pt-5">
            <SectionLabel title="Badges" />
            {allUnlocked ? (
              <AllBadgesUnlockedCard isDark={isDark} />
            ) : (
              <View className="flex-row flex-wrap gap-2.5">
                {BADGES.map((badge, i) => {
                  const unlocked = stats.wordsLearned >= badge.requiredWords;
                  const wordsToGo = badge.requiredWords - stats.wordsLearned;
                  return (
                    <View key={badge.id} style={{ width: '47.5%' }}>
                      <BadgeCard
                        badge={badge}
                        unlocked={unlocked}
                        wordsToGo={Math.max(wordsToGo, 0)}
                        isDark={isDark}
                      />
                    </View>
                  );
                })}
              </View>
            )}
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <View className="flex-1 bg-bg-light dark:bg-bg-dark">
      <View className="px-6 pt-14 pb-2 border-b border-border-light dark:border-border-dark">
        <Text className="text-[11px] text-muted-light dark:text-muted-dark tracking-[3px] uppercase">
          Your journey
        </Text>
        <Text
          style={{ fontFamily: 'DMSerifDisplay_400Regular', fontSize: 36, lineHeight: 40 }}
          className="dark:text-primary-dark mb-2"
        >
          Progress
        </Text>
      </View>

      <FlatList
        data={sections}
        keyExtractor={(item) => item.type}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      />
    </View>
  );
}