import { useTheme } from '@/hooks/useTheme';
import { Pressable, ScrollView, Text, View } from 'react-native';

const WORD_OF_THE_DAY = {
  word: 'Serendipity',
  phonetic: '/ˌser.ənˈdɪp.ɪ.ti/',
  type: 'noun',
  definition:
    'The occurrence of events by chance in a happy or beneficial way; a fortunate accident.',
  examples: [
    'Finding that old letter was pure serendipity.',
    'Their meeting was a wonderful act of serendipity.',
  ],
  streak: 7,
};

export default function HomeScreen() {
  const theme = useTheme();

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: theme.background }}
      contentContainerStyle={{ padding: 24, paddingTop: 60 }}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
        <View>
          <Text style={{ fontSize: 13, color: theme.textMuted, letterSpacing: 1.5, textTransform: 'uppercase' }}>
            Word of the Day
          </Text>
          <Text style={{ fontSize: 28, fontWeight: '700', color: theme.textPrimary, marginTop: 2 }}>
            Lexora
          </Text>
        </View>

        {/* Streak badge */}
        <View style={{
          backgroundColor: theme.primaryLight,
          borderRadius: 20,
          paddingHorizontal: 14,
          paddingVertical: 8,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 6,
        }}>
          <Text style={{ fontSize: 16 }}>🔥</Text>
          <Text style={{ fontSize: 15, fontWeight: '700', color: theme.primary }}>
            {WORD_OF_THE_DAY.streak} days
          </Text>
        </View>
      </View>

      {/* Word card */}
      <View style={{
        backgroundColor: theme.surface,
        borderRadius: 24,
        padding: 24,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: theme.border,
      }}>
        {/* Type badge */}
        <View style={{
          alignSelf: 'flex-start',
          backgroundColor: theme.primaryMuted,
          borderRadius: 8,
          paddingHorizontal: 10,
          paddingVertical: 4,
          marginBottom: 12,
        }}>
          <Text style={{ fontSize: 12, fontWeight: '600', color: theme.primary, textTransform: 'uppercase', letterSpacing: 1 }}>
            {WORD_OF_THE_DAY.type}
          </Text>
        </View>

        {/* Word + phonetic */}
        <Text style={{ fontSize: 38, fontWeight: '800', color: theme.textPrimary, letterSpacing: -0.5 }}>
          {WORD_OF_THE_DAY.word}
        </Text>
        <Text style={{ fontSize: 15, color: theme.textMuted, marginTop: 4, marginBottom: 16 }}>
          {WORD_OF_THE_DAY.phonetic}
        </Text>

        {/* Divider */}
        <View style={{ height: 1, backgroundColor: theme.border, marginBottom: 16 }} />

        {/* Definition */}
        <Text style={{ fontSize: 16, color: theme.textSecondary, lineHeight: 24 }}>
          {WORD_OF_THE_DAY.definition}
        </Text>
      </View>

      {/* Examples card */}
      <View style={{
        backgroundColor: theme.surface,
        borderRadius: 24,
        padding: 24,
        marginBottom: 32,
        borderWidth: 1,
        borderColor: theme.border,
      }}>
        <Text style={{ fontSize: 12, fontWeight: '600', color: theme.textMuted, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 14 }}>
          Examples
        </Text>
        {WORD_OF_THE_DAY.examples.map((example, i) => (
          <View key={i} style={{ flexDirection: 'row', gap: 10, marginBottom: i === 0 ? 10 : 0 }}>
            <View style={{ width: 3, borderRadius: 2, backgroundColor: theme.primary, marginTop: 4 }} />
            <Text style={{ flex: 1, fontSize: 15, color: theme.textSecondary, lineHeight: 22, fontStyle: 'italic' }}>
              "{example}"
            </Text>
          </View>
        ))}
      </View>

      {/* CTA Buttons */}
      <Pressable
        style={{
          backgroundColor: theme.primary,
          borderRadius: 16,
          paddingVertical: 18,
          alignItems: 'center',
          marginBottom: 12,
        }}
      >
        <Text style={{ fontSize: 16, fontWeight: '700', color: theme.textOnPrimary }}>
          Practice this word →
        </Text>
      </Pressable>

      <Pressable
        style={{
          backgroundColor: theme.surface,
          borderRadius: 16,
          paddingVertical: 18,
          alignItems: 'center',
          borderWidth: 1,
          borderColor: theme.border,
        }}
      >
        <Text style={{ fontSize: 16, fontWeight: '600', color: theme.textSecondary }}>
          ✨ Ask AI about this word
        </Text>
      </Pressable>

    </ScrollView>
  );
}