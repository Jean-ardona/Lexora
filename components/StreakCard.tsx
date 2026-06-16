import { Text, View } from 'react-native';

// ─── Paliers alignés sur les badges de progress.tsx ──────────────────────────
const MILESTONES = [7, 21, 50, 90, 140, 200, 280, 365];

function getStreakProgress(streak: number): { next: number; prev: number; progress: number } {
  // Trouve le prochain palier à atteindre
  const next = MILESTONES.find(m => m > streak) ?? MILESTONES[MILESTONES.length - 1];
  // Trouve le palier précédent (point de départ de la progress bar)
  const prevIndex = MILESTONES.indexOf(next) - 1;
  const prev = prevIndex >= 0 ? MILESTONES[prevIndex] : 0;

  // Progress entre prev et next
  const progress = streak >= next
    ? 100
    : Math.round(((streak - prev) / (next - prev)) * 100);

  return { next, prev, progress };
}

interface StreakCardProps {
  streak: number;
  label?: string;
}

export default function StreakCard({
  streak = 0,
  label = 'Day streak',
}: StreakCardProps) {
  const { next, progress } = getStreakProgress(streak);
  const isMaxed = streak >= MILESTONES[MILESTONES.length - 1];

  return (
    <View className="w-full bg-black dark:bg-white/5 rounded-2xl p-5">
      <View className="flex-row items-center gap-3 mb-4">
        <View className="w-12 h-12 rounded-xl bg-accent items-center justify-center">
          <Text className="text-2xl">🔥</Text>
        </View>
        <View>
          <Text className="text-4xl font-geist-bold text-white leading-none">
            {streak}
          </Text>
          <Text className="text-sm text-white/60 mt-0.5">
            {label}
          </Text>
        </View>
      </View>

      <View className="w-full h-2 bg-[#cc998536] rounded-full overflow-hidden mb-1.5">
        <View
          className="h-full bg-accent rounded-full"
          style={{ width: `${progress}%` }}
        />
      </View>

      <Text className="text-xs text-white/60">
        {isMaxed
          ? '🏆 You completed the full year streak!'
          : streak === 0
            ? `Open the app every day to build your streak!`
            : `${progress}% of the way to a ${next}-day streak!`
        }
      </Text>
    </View>
  );
}