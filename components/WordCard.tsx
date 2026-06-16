import { Text, View } from 'react-native';

type Example = {
  sentence: string;
  highlighted: string;
};

type WordCardProps = {
  word: string;
  phonetic?: string;
  type?: string;
  definition: string;
  examples?: Example[];
};

function HighlightedSentence({ sentence, highlighted }: { sentence: string; highlighted: string }) {
  if (!sentence) {
    return null;
  }

  const idx = sentence.toLowerCase().indexOf(highlighted.toLowerCase());

  if (idx === -1) {
    return <Text className="text-sm text-secondary-light dark:text-secondary-dark leading-6">{sentence}</Text>;
  }

  const before = sentence.slice(0, idx);
  const match = sentence.slice(idx, idx + highlighted.length);
  const after = sentence.slice(idx + highlighted.length);

  return (
    <Text className="text-secondary-light dark:text-secondary-dark leading-6 font-geist">
      {before}
      <Text className="text-accentText-light dark:text-accentText-dark font-geist">{match}</Text>
      {after}
    </Text>
  );
}

export function WordCard({ word, phonetic, type, definition, examples }: WordCardProps) {
  const validExamples = examples?.filter((ex) => ex.sentence.trim().length > 0) ?? [];

  return (
    <View className="w-full bg-bg-cardLight dark:bg-bg-cardDark rounded-3xl p-5 shadow-lg border border-border-light dark:border-border-dark">
      <View className="flex-row justify-between items-start mb-1">
        <Text className="text-4xl text-primary-light dark:text-primary-dark capitalize" style={{ width: '85%', fontFamily: 'DMSerifDisplay_400Regular' }}>
          {word}
        </Text>
        {type ? (
          <View className="bg-accentSoft-light dark:bg-accentSoft-dark rounded-lg px-2 py-1 mt-1 items-center justify-center">
            <Text className="text-sm text-accentText-light dark:text-accentText-dark tracking-widest font-geist-bold">{type}.</Text>
          </View>
        ) : null}
      </View>
      {phonetic ? (
        <Text className="text-sm text-muted-light dark:text-muted-dark mb-4">{phonetic}</Text>
      ) : null}
      <View className="w-full h-px bg-border-light dark:bg-border-dark mb-4" />
      <Text className="text-xs text-muted-light dark:text-muted-dark uppercase tracking-widest mb-2" style={{ fontFamily: 'serif' }}>
        Definition
      </Text>
      <Text className="text-primary-light dark:text-primary-dark font-geist text-xl leading-7 mb-4">
        {definition}
      </Text>
      {validExamples.length > 0 ? (
        <>
          <View className="w-full h-px bg-border-light dark:bg-border-dark mb-4" />
          <Text className="text-xs text-muted-light dark:text-muted-dark uppercase tracking-widest mb-3" style={{ fontFamily: 'serif' }}>
            Examples
          </Text>
          <View className="gap-4">
            {validExamples.map((ex, i) => (
              <View key={i} className="flex-row gap-3">
                <Text className="text-accentText-light dark:text-accentText-dark text-sm font-inter w-4 mt-0.5" style={{ fontFamily: 'DMSerifDisplay_400Regular' }}>
                  {i + 1}
                </Text>
                <View className="flex-1">
                  <HighlightedSentence sentence={ex.sentence} highlighted={ex.highlighted} />
                </View>
              </View>
            ))}
          </View>
        </>
      ) : null}
    </View>
  );
}
