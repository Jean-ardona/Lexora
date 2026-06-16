import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, FlatList, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { getLearnedWords, getTodayPracticeAttempts } from '../db/actions';

// ─── Types ────────────────────────────────────────────────────────────────────
type WordEntry = {
  id: string;
  word: string;
  definition: string;
  dropDate: string;
  mastered: boolean;
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
function formatDate(dateStr: string): string {
  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yStr = yesterday.toISOString().split('T')[0];

  if (dateStr === today) return 'Today';
  if (dateStr === yStr) return 'Yesterday';

  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

// ─── Section Label ────────────────────────────────────────────────────────────
function SectionLabel({ title }: { title: string }) {
  return (
    <View className="flex-row items-center gap-2 mb-4">
      <View className="w-6 h-0.5 bg-accent rounded-full" />
      <Text className="text-[11px] text-muted-light dark:text-muted-dark uppercase tracking-[2.5px]">
        {title}
      </Text>
    </View>
  );
}

// ─── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({ value, label }: { value: number | string; label: string }) {
  return (
    <View className="flex-1 bg-white dark:bg-white/5 border border-border-light dark:border-border-dark rounded-2xl p-3 items-center">
      <Text
        style={{ fontFamily: 'DMSerifDisplay_400Regular', fontSize: 26, lineHeight: 30, color: '#E8410A' }}
      >
        {value}
      </Text>
      <Text className="text-[10px] text-secondary-light dark:text-secondary-dark mt-1 tracking-wide">
        {label}
      </Text>
    </View>
  );
}

// ─── Notice Banner ────────────────────────────────────────────────────────────
function NoticeBanner() {
  return (
    <View className="bg-bg-dark dark:bg-white/5 rounded-2xl px-4 py-3 flex-row items-center gap-3 mb-5">
      <Ionicons name="information-circle-outline" size={16} color="rgba(255,255,255,0.4)" />
      <View className="flex-1">
        <Text className="text-[12px] text-white/55 leading-5">
          <Text>Words you've seen so far — </Text>
          <Text className="text-white/85 font-geist-bold">mastered</Text>
          <Text> means you used both practice attempts on that word.</Text>
        </Text>
      </View>
    </View>
  );
}

// ─── Word Card ────────────────────────────────────────────────────────────────
function WordCard({ item, index }: { item: WordEntry; index: number }) {
  const { isDark } = useTheme();

  const accentColor = item.mastered ? '#2D6A4F' : '#A32D2D';
  const badgeBg = item.mastered
    ? (isDark ? 'rgba(45,106,79,0.2)' : '#EAFAF3')
    : (isDark ? 'rgba(163,45,45,0.2)' : '#FCEBEB');
  const badgeText = item.mastered ? '#2D6A4F' : '#A32D2D';
  const badgeLabel = item.mastered ? 'Mastered' : 'To review';

  return (
    <View
      className="bg-white dark:bg-white/5 rounded-2xl mb-3 flex-row items-center overflow-hidden"
      style={{
        borderWidth: 1,
        borderColor: isDark ? 'rgba(255,255,255,0.08)' : '#E8E4DE',
        borderLeftWidth: 3,
        borderLeftColor: accentColor,
      }}
    >
      <Text
        style={{
          fontFamily: 'DMSerifDisplay_400Regular',
          fontSize: 18,
          color: isDark ? 'rgba(255,255,255,0.12)' : '#E8E4DE',
          width: 44,
          textAlign: 'center',
        }}
      >
        {index + 1}
      </Text>

      <View className="flex-1 py-3 pr-3">
        <Text className="font-geist-bold text-[16px] dark:text-primary-dark mb-0.5">
          {item.word}
        </Text>
        <Text
          className="text-[12px] text-secondary-light dark:text-secondary-dark"
          numberOfLines={1}
        >
          {item.definition}
        </Text>
        <View className="flex-row items-center gap-1 mt-1.5">
          <Ionicons
            name="calendar-outline"
            size={11}
            color={isDark ? 'rgba(255,255,255,0.3)' : '#9A948C'}
          />
          <Text className="text-[10px] text-muted-light dark:text-muted-dark">
            {formatDate(item.dropDate)}
          </Text>
        </View>
      </View>

      <View
        style={{
          backgroundColor: badgeBg,
          borderRadius: 20,
          paddingHorizontal: 10,
          paddingVertical: 4,
          marginRight: 12,
        }}
      >
        <Text style={{ fontSize: 10, fontWeight: '600', color: badgeText }}>
          {badgeLabel}
        </Text>
      </View>
    </View>
  );
}

// ─── List Header ──────────────────────────────────────────────────────────────
function ListHeader({
  totalWords,
  mastered,
  toReview,
}: {
  totalWords: number;
  mastered: number;
  toReview: number;
}) {
  return (
    <View>
      <View className="flex-row gap-3 px-6 pt-5 pb-6">
        <StatCard value={totalWords} label="Words seen" />
        <StatCard value={mastered} label="Mastered" />
        <StatCard value={toReview} label="To review" />
      </View>
      <View className="px-6">
        <SectionLabel title="Recent words" />
        <NoticeBanner />
      </View>
    </View>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────
function EmptyState() {
  return (
    <View className="items-center px-8 pt-16">
      <Text style={{ fontSize: 44, marginBottom: 16 }}>📖</Text>
      <Text
        style={{ fontFamily: 'DMSerifDisplay_400Regular', fontSize: 26 }}
        className="dark:text-primary-dark text-center mb-2"
      >
        No history yet
      </Text>
      <Text className="text-[13px] text-muted-light dark:text-muted-dark text-center leading-6">
        Complete your first practice to see the words you've learned here.
      </Text>
    </View>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function History() {
  const router = useRouter();
  const [words, setWords] = useState<WordEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      const load = async () => {
        try {
          setLoading(true);
          const learned = await getLearnedWords();

          // Pour chaque mot appris, on vérifie s'il a 2 tentatives de practice
          // (= mastered). On fait les checks en parallèle pour la perf.
          const entries = await Promise.all(
            learned.map(async (drop) => {
              const attempts = await getTodayPracticeAttempts(drop.id);
              return {
                id: String(drop.id),
                word: drop.term,
                definition: drop.definition,
                dropDate: drop.dropDate ?? '',
                mastered: attempts.length >= 2,
              };
            })
          );

          setWords(entries);
        } catch (e) {
          console.error('History load error:', e);
        } finally {
          setLoading(false);
        }
      };
      load();
    }, [])
  );

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-bg-light dark:bg-bg-dark">
        <ActivityIndicator size="large" color="#E8410A" />
      </View>
    );
  }

  const totalWords = words.length;
  const mastered = words.filter(w => w.mastered).length;
  const toReview = words.filter(w => !w.mastered).length;

  return (
    <View className="flex-1 bg-bg-light dark:bg-bg-dark">
      {/* Header */}
      <View className="px-6 pt-14 pb-3 border-b border-border-light dark:border-border-dark flex-row items-center justify-between">
        <View>
          <Text className="text-[11px] text-muted-light dark:text-muted-dark tracking-[3px] uppercase">
            Vocabulary
          </Text>
          <Text
            style={{ fontFamily: 'DMSerifDisplay_400Regular', fontSize: 36, lineHeight: 40 }}
            className="dark:text-primary-dark"
          >
            History
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-9 h-9 rounded-full border border-border-light dark:border-border-dark bg-white dark:bg-white/5 items-center justify-center mt-1"
        >
          <Ionicons name="close" size={16} color="#7A7268" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={words}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
        ListHeaderComponent={
          <ListHeader
            totalWords={totalWords}
            mastered={mastered}
            toReview={toReview}
          />
        }
        ListEmptyComponent={<EmptyState />}
        renderItem={({ item, index }) => (
          <View className="px-6">
            <WordCard item={item} index={index} />
          </View>
        )}
      />
    </View>
  );
}