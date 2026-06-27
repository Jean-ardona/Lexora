import AskAIButton from "@/components/AskAiBtn";
import { LoadingSpinner } from "../../components/LoadingSpinner";
import StreakCard from "@/components/StreakCard";
import { WordCard } from "@/components/WordCard";
import { Ionicons } from "@expo/vector-icons";
import { Link, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useTheme } from "../../context/ThemeContext";
import {
  checkAndUpdateLearningMilestone,
  checkAndUpdateStreak,
  getTodayDrop,
} from "../../db/actions";
import { useIsDbReady } from "../../db/Provider";

export default function Index() {
  const { isDark } = useTheme();
  const isDbReady = useIsDbReady();
  const [word, setWord] = useState<any>(null);
  const [streak, setStreak] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [milestone, setMilestone] = useState<number | null>(null); // nb de mots au milestone

  // ── useFocusEffect : se relance à chaque fois qu'on revient sur l'écran ──
  // isDbReady est en dépendance : le fetch se déclenche aussi quand la DB
  // devient prête (cas du premier lancement avec l'overlay de chargement).
  useFocusEffect(
    useCallback(() => {
      if (!isDbReady) return;

      const fetchData = async () => {
        try {
          setLoading(true);
          const [todayDrop, streakResult, milestoneResult] = await Promise.all([
            getTodayDrop(),
            checkAndUpdateStreak(),
            checkAndUpdateLearningMilestone(),
          ]);

          setWord(todayDrop);
          setStreak(streakResult.streak);

          // Si c'est un nouveau milestone → on affiche l'overlay
          if (milestoneResult.isNewMilestone) {
            setMilestone(milestoneResult.wordsLearned);
          }

          // La reprogrammation des notifs est gérée globalement par NotificationBootstrap
        } catch (error) {
          console.error("Error fetching home data:", error);
        } finally {
          setLoading(false);
        }
      };

      fetchData();
    }, [isDbReady]),
  );

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <View className="flex-1 bg-bg-light dark:bg-bg-dark pt-14 px-6">
      {/* ── Milestone Overlay ── */}
      <Modal
        visible={milestone !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setMilestone(null)}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.75)",
            justifyContent: "center",
            alignItems: "center",
            padding: 32,
          }}
        >
          <View
            style={{
              backgroundColor: isDark ? "#1E1C19" : "#fff",
              borderRadius: 28,
              padding: 32,
              alignItems: "center",
              width: "100%",
            }}
          >
            <Text style={{ fontSize: 64, marginBottom: 12 }}>🎉</Text>
            <Text
              style={{
                fontFamily: "DMSerifDisplay_400Regular",
                fontSize: 32,
                color: "#E8410A",
                marginBottom: 8,
              }}
            >
              {milestone} words!
            </Text>
            <Text
              style={{
                fontFamily: "DMSerifDisplay_400Regular",
                fontSize: 22,
                marginBottom: 12,
              }}
              className="dark:text-primary-dark"
            >
              New milestone reached!
            </Text>
            <Text
              className="text-[13px] text-muted-light dark:text-muted-dark text-center leading-6"
              style={{ marginBottom: 28 }}
            >
              You've learned {milestone} words. Keep the streak going — you're
              building something real. 🔥
            </Text>
            <Pressable
              onPress={() => setMilestone(null)}
              style={{
                backgroundColor: "#E8410A",
                borderRadius: 16,
                paddingVertical: 14,
                paddingHorizontal: 40,
              }}
            >
              <Text
                style={{
                  color: "#fff",
                  fontFamily: "Geist-Bold",
                  fontSize: 15,
                }}
              >
                Let's keep going!
              </Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* ── Header ── */}
      <View className="flex-row items-center justify-between pb-3 border-b border-b-border-light dark:border-b-border-dark">
        <View className="flex-row gap-2 items-center justify-center">
          <Ionicons name="flame-outline" size={32} color="#E85D26" />
          <View>
            <Text className="dark:text-muted-dark tracking-[3px] font-inter text-sm">
              365
            </Text>
            <View className="flex-row -mt-2 ml-[1px]">
              <Text
                className="dark:text-primary-dark font-geist-bold text-4xl"
                style={{
                  fontFamily: "DMSerifDisplay_400Regular",
                  fontWeight: "600",
                }}
              >
                W
              </Text>
              <Text
                className="text-accent font-geist-bold text-4xl"
                style={{
                  fontFamily: "DMSerifDisplay_400Regular",
                  fontWeight: "600",
                }}
              >
                o
              </Text>
              <Text
                className="dark:text-primary-dark font-geist-bold text-4xl"
                style={{
                  fontFamily: "DMSerifDisplay_400Regular",
                  fontWeight: "600",
                }}
              >
                rds
              </Text>
            </View>
          </View>
        </View>
        <View className="flex-row gap-6 items-center">
          <Link href="/history" asChild>
            <TouchableOpacity>
              <Ionicons
                name="time-outline"
                size={26}
                color={isDark ? "#eee" : "#000"}
              />
            </TouchableOpacity>
          </Link>
          <Link href="/settings" asChild>
            <TouchableOpacity>
              <Ionicons
                name="settings-outline"
                size={24}
                color={isDark ? "#eee" : "#000"}
              />
            </TouchableOpacity>
          </Link>
        </View>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 30 }}
      >
        {/* ── Streak Card ── */}
        <View className="py-3 flex-row items-center justify-center">
          <StreakCard streak={streak} label="Daily streak" />
        </View>

        {/* ── Word of the day ── */}
        <View className="py-3">
          <View className="flex-row items-center pb-3">
            <View className="w-8 h-1 bg-accent" />
            <Text
              className="text-sm text-muted-light dark:text-muted-dark uppercase tracking-widest ml-2"
              style={{ fontFamily: "serif" }}
            >
              Word of the day
            </Text>
          </View>

          {word ? (
            <>
              <WordCard
                word={word.term}
                phonetic={word.phonetic ? `/${word.phonetic}/` : undefined}
                type={word.type ? word.type.slice(0, 3) : undefined}
                definition={word.definition}
                examples={[
                  {
                    sentence: word.examples?.[0] || "",
                    highlighted: word.term,
                  },
                  {
                    sentence: word.examples?.[1] || "",
                    highlighted: word.term,
                  },
                ]}
              />

              <AskAIButton onPress={() => console.log("Ask AI pressed!")} />

              <Link href="/quiz" asChild>
                <TouchableOpacity
                  className="mt-5 flex-row items-center justify-center gap-2 py-4 rounded-2xl"
                  style={{
                    backgroundColor: isDark
                      ? "rgba(255,255,255,0.06)"
                      : "rgba(0,0,0,0.04)",
                    borderWidth: 1,
                    borderColor: isDark ? "rgba(255,255,255,0.08)" : "#E8E4DE",
                  }}
                >
                  <Ionicons
                    name="pencil-outline"
                    size={16}
                    color={isDark ? "#aaa" : "#555"}
                  />
                  <Text
                    style={{
                      fontFamily: "Geist-Bold",
                      fontSize: 14,
                      color: isDark ? "#ccc" : "#444",
                    }}
                  >
                    Let's Practice
                  </Text>
                </TouchableOpacity>
              </Link>
            </>
          ) : (
            <View
              style={{
                borderRadius: 24,
                padding: 32,
                alignItems: "center",
                borderWidth: 1,
                borderColor: isDark ? "rgba(255,255,255,0.08)" : "#E8E4DE",
                backgroundColor: isDark
                  ? "rgba(255,255,255,0.03)"
                  : "rgba(0,0,0,0.02)",
              }}
            >
              <Text style={{ fontSize: 48, marginBottom: 16 }}>🎓</Text>
              <Text
                style={{
                  fontFamily: "DMSerifDisplay_400Regular",
                  fontSize: 26,
                  color: "#E8410A",
                  marginBottom: 8,
                  textAlign: "center",
                }}
              >
                All caught up!
              </Text>
              <Text className="text-[13px] text-muted-light dark:text-muted-dark text-center leading-6">
                You've learned every word in the collection. New words are
                coming soon — check back later!
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}
