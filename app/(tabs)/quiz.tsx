import { Ionicons } from "@expo/vector-icons";
import BottomSheet, { BottomSheetScrollView } from "@gorhom/bottom-sheet";
import { useFocusEffect } from "expo-router";
import { useCallback, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { LoadingSpinner } from "../../components/LoadingSpinner";
import { useTheme } from "../../context/ThemeContext";
import {
  getTodayDrop,
  getTodayPracticeAttempts,
  savePracticeAttempt,
} from "../../db/actions";

// ─── Types ────────────────────────────────────────────────────────────────────
type Drop = {
  id: number;
  term: string;
  type: string;
  phonetic?: string | null;
  definition: string;
  examples?: string[] | null;
};

type SavedAttempt = {
  id: number;
  dropId: number;
  sentence: string;
  attemptNb: number;
  practiceDate: string;
  aiFeedback: null; // sera typé plus tard quand l'IA est intégrée
  createdAt: string;
};

const MAX_ATTEMPTS = 2;

// ─── Attempt Dots ─────────────────────────────────────────────────────────────
function AttemptDots({ used, total }: { used: number; total: number }) {
  return (
    <View className="flex-row items-center justify-between mb-4">
      <Text className="text-[12px] text-muted-light dark:text-muted-dark">
        Attempts remaining
      </Text>
      <View className="flex-row gap-1.5">
        {Array.from({ length: total }).map((_, i) => (
          <View
            key={i}
            style={{
              width: 10,
              height: 10,
              borderRadius: 5,
              backgroundColor: i < used ? "#E8410A" : "#E8E4DE",
            }}
          />
        ))}
      </View>
    </View>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function Practice() {
  const { isDark } = useTheme();

  const [drop, setDrop] = useState<Drop | null>(null);
  const [loading, setLoading] = useState(true);

  const [sentence, setSentence] = useState("");
  const [attemptsUsed, setAttemptsUsed] = useState(0);
  const [savedAttempts, setSavedAttempts] = useState<SavedAttempt[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [exhausted, setExhausted] = useState(false);

  const bottomSheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ["50%", "75%"], []);
  const inputRef = useRef<TextInput>(null);
  const scrollRef = useRef<ScrollView>(null);

  const openSheet = useCallback(
    () => bottomSheetRef.current?.snapToIndex(0),
    [],
  );
  const closeSheet = useCallback(() => bottomSheetRef.current?.close(), []);

  // ── Charger le mot du jour + tentatives existantes ──
  useFocusEffect(
    useCallback(() => {
      const load = async () => {
        try {
          setLoading(true);
          const todayDrop = await getTodayDrop();
          if (!todayDrop) {
            setDrop(null);
            setLoading(false);
            return;
          }
          setDrop(todayDrop as Drop);

          // Récupérer les tentatives déjà faites aujourd'hui
          const existing = await getTodayPracticeAttempts(todayDrop.id);
          setSavedAttempts(existing as SavedAttempt[]);
          setAttemptsUsed(existing.length);
          if (existing.length >= MAX_ATTEMPTS) setExhausted(true);
        } catch (e) {
          console.error("Practice load error:", e);
        } finally {
          setLoading(false);
        }
      };
      load();
    }, []),
  );

  // ── Soumettre une tentative ──
  const handleSubmit = async () => {
    if (!drop || !sentence.trim() || sentence.trim().length < 5) return;
    if (attemptsUsed >= MAX_ATTEMPTS) return;

    // Vérifie que la phrase n'est pas identique à une tentative précédente
    const isDuplicate = savedAttempts.some(
      (a) => a.sentence.trim().toLowerCase() === sentence.trim().toLowerCase(),
    );
    if (isDuplicate) {
      alert(
        "You already submitted this sentence! Try writing a different one 💡",
      );
      return;
    }

    setSubmitting(true);
    inputRef.current?.blur();

    try {
      const newAttemptNb = attemptsUsed + 1;

      const saved = await savePracticeAttempt({
        dropId: drop.id,
        sentence: sentence.trim(),
        attemptNb: newAttemptNb,
      });

      setSavedAttempts((prev) => [...prev, saved as SavedAttempt]);
      setAttemptsUsed(newAttemptNb);

      if (newAttemptNb >= MAX_ATTEMPTS) setExhausted(true);

      openSheet();
    } catch (e) {
      console.error("Save attempt error:", e);
    } finally {
      setSubmitting(false);
    }
  };

  const canSubmit =
    !!drop && sentence.trim().length >= 5 && !submitting && !exhausted;

  // ── Loading ──
  if (loading) {
    return <LoadingSpinner />;
  }

  // ── No word available ──
  if (!drop) {
    return (
      <View className="flex-1 justify-center items-center bg-bg-light dark:bg-bg-dark px-8">
        <Text style={{ fontSize: 44, marginBottom: 16 }}>📭</Text>
        <Text
          style={{ fontFamily: "DMSerifDisplay_400Regular", fontSize: 26 }}
          className="dark:text-primary-dark text-center mb-2"
        >
          No word today
        </Text>
        <Text className="text-[13px] text-muted-light dark:text-muted-dark text-center leading-6">
          Come back tomorrow for a new word to practice.
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-bg-light dark:bg-bg-dark">
      {/* ── Header ── */}
      <View className="px-6 pt-14 pb-2 border-b border-border-light dark:border-border-dark">
        <Text className="text-[11px] text-muted-light dark:text-muted-dark tracking-[3px] uppercase">
          Daily practice
        </Text>
        <Text
          style={{
            fontFamily: "DMSerifDisplay_400Regular",
            fontSize: 36,
            lineHeight: 40,
          }}
          className="dark:text-primary-dark mb-2"
        >
          Practice
        </Text>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
      >
        <ScrollView
          ref={scrollRef}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 120 }}
          keyboardShouldPersistTaps="handled"
          automaticallyAdjustKeyboardInsets
        >
          <View className="px-6 pt-6">
            {/* ── Word Card ── */}
            <View className="bg-bg-dark dark:bg-white/5 rounded-2xl p-6 mb-5">
              <Text className="text-[10px] text-white/35 uppercase tracking-[2px] mb-2">
                Word of the day
              </Text>
              <Text
                style={{
                  fontFamily: "DMSerifDisplay_400Regular",
                  fontSize: 44,
                  color: "#fff",
                  lineHeight: 48,
                }}
                className="mb-1"
              >
                {drop.term}
              </Text>
              <Text className="text-[11px] text-white/35 mb-3">
                {drop.type}
              </Text>
              <View className="border-t border-white/10 pt-3">
                <Text className="text-[14px] text-white/65 leading-6">
                  {drop.definition}
                </Text>
              </View>
            </View>

            {/* ── Attempt dots ── */}
            <AttemptDots used={attemptsUsed} total={MAX_ATTEMPTS} />

            {/* ── Exhausted state ── */}
            {exhausted ? (
              <View
                className="rounded-2xl p-4 mb-4 border"
                style={{
                  backgroundColor: isDark ? "rgba(232,65,10,0.10)" : "#FFF0EB",
                  borderColor: isDark ? "rgba(232,65,10,0.25)" : "#FDDDD2",
                }}
              >
                <Text className="text-[13px] text-accent font-geist-bold mb-1">
                  All attempts used!
                </Text>
                <Text className="text-[12px] text-muted-light dark:text-muted-dark leading-5">
                  Come back tomorrow for a new word to practice. Keep it up! 🔥
                </Text>
              </View>
            ) : null}

            {/* ── Input ── */}
            {!exhausted ? (
              <View
                className="rounded-2xl p-4 mb-3 border"
                style={{
                  backgroundColor: isDark ? "rgba(255,255,255,0.05)" : "#fff",
                  borderColor: isDark ? "rgba(255,255,255,0.08)" : "#E8E4DE",
                }}
              >
                <Text className="text-[11px] text-muted-light dark:text-muted-dark uppercase tracking-widest mb-3">
                  Your sentence
                </Text>
                <TextInput
                  ref={inputRef}
                  value={sentence}
                  onChangeText={setSentence}
                  placeholder={`Write a sentence using "${drop.term.toLowerCase()}"...`}
                  placeholderTextColor={
                    isDark ? "rgba(255,255,255,0.2)" : "#9A948C"
                  }
                  multiline
                  onFocus={() => {
                    setTimeout(() => {
                      scrollRef.current?.scrollToEnd({ animated: true });
                    }, 100);
                  }}
                  onBlur={() => {
                    scrollRef.current?.scrollTo({ y: 0, animated: true });
                  }}
                  style={{
                    fontFamily: "Geist-Regular",
                    fontSize: 15,
                    color: isDark ? "#fff" : "#1A1510",
                    minHeight: 90,
                    lineHeight: 24,
                    textAlignVertical: "top",
                  }}
                />
                <View className="flex-row items-center gap-1 mt-3 pt-3 border-t border-border-light dark:border-border-dark">
                  <Ionicons
                    name="information-circle-outline"
                    size={12}
                    color={isDark ? "rgba(255,255,255,0.25)" : "#9A948C"}
                  />
                  <Text className="text-[11px] text-muted-light dark:text-muted-dark flex-1">
                    Show you understand the meaning, not just the definition
                  </Text>
                </View>
              </View>
            ) : null}

            {/* ── Example chip ── */}
            {!exhausted && drop.examples?.[0] ? (
              <TouchableOpacity
                onPress={() => setSentence(drop.examples![0])}
                className="flex-row items-center gap-2 self-start mb-4"
                style={{
                  backgroundColor: isDark ? "rgba(232,65,10,0.12)" : "#FFF0EB",
                  borderWidth: 1,
                  borderColor: isDark ? "rgba(232,65,10,0.25)" : "#FDDDD2",
                  borderRadius: 20,
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                }}
              >
                <Ionicons name="bulb-outline" size={14} color="#E8410A" />
                <Text
                  style={{ fontSize: 12, color: "#993C1D", fontWeight: "600" }}
                >
                  See an example sentence
                </Text>
              </TouchableOpacity>
            ) : null}

            {/* ── Submit Button ── */}
            {!exhausted ? (
              <Pressable
                onPress={handleSubmit}
                disabled={!canSubmit}
                style={{ opacity: canSubmit ? 1 : 0.45 }}
                className="flex-row items-center bg-accentText-dark justify-center gap-2 py-4 rounded-2xl"
              >
                {submitting ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <>
                    <Ionicons
                      name="checkmark-circle-outline"
                      size={18}
                      color="#fff"
                    />
                    <Text
                      style={{
                        color: "#fff",
                        fontSize: 15,
                        fontFamily: "Geist-Bold",
                      }}
                    >
                      Submit sentence
                    </Text>
                  </>
                )}
              </Pressable>
            ) : null}

            {/* ── View attempts button (quand exhausted) ── */}
            {exhausted && savedAttempts.length > 0 ? (
              <TouchableOpacity
                onPress={openSheet}
                className="flex-row items-center justify-center gap-2 py-4 rounded-2xl border border-border-light dark:border-border-dark"
              >
                <Ionicons name="eye-outline" size={18} color="#E8410A" />
                <Text className="text-accent font-geist-bold text-[15px]">
                  View my sentences
                </Text>
              </TouchableOpacity>
            ) : null}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* ── Bottom Sheet : récap des tentatives ── */}
      <BottomSheet
        ref={bottomSheetRef}
        index={-1}
        snapPoints={snapPoints}
        enablePanDownToClose
        backgroundStyle={{
          backgroundColor: isDark ? "#1E1C19" : "#fff",
          borderRadius: 24,
        }}
        handleIndicatorStyle={{
          backgroundColor: isDark ? "rgba(255,255,255,0.2)" : "#E8E4DE",
          width: 36,
        }}
      >
        <BottomSheetScrollView
          contentContainerStyle={{ paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Sheet Header */}
          <View
            className="px-6 pb-4 border-b border-border-light dark:border-border-dark"
            style={{ paddingTop: 8 }}
          >
            <Text
              style={{ fontFamily: "DMSerifDisplay_400Regular", fontSize: 24 }}
              className="dark:text-primary-dark mb-1"
            >
              Your sentences
            </Text>
            <Text className="text-[12px] text-muted-light dark:text-muted-dark">
              {savedAttempts.length === MAX_ATTEMPTS
                ? "Both attempts submitted — AI feedback coming soon 🚀"
                : `Attempt ${savedAttempts.length} of ${MAX_ATTEMPTS} submitted`}
            </Text>
          </View>

          <View className="px-6 pt-4">
            {savedAttempts.map((attempt, i) => (
              <View
                key={attempt.id}
                className="rounded-2xl p-4 mb-3 border"
                style={{
                  backgroundColor: isDark
                    ? "rgba(255,255,255,0.04)"
                    : "#FAFAF8",
                  borderColor: isDark ? "rgba(255,255,255,0.08)" : "#E8E4DE",
                }}
              >
                <Text className="text-[10px] text-muted-light dark:text-muted-dark uppercase tracking-widest mb-2">
                  Attempt {attempt.attemptNb}
                </Text>
                <Text className="text-[14px] dark:text-primary-dark leading-6 italic">
                  "{attempt.sentence}"
                </Text>
              </View>
            ))}

            {/* Placeholder AI feedback */}
            <View
              className="rounded-2xl p-4 border"
              style={{
                backgroundColor: isDark ? "rgba(232,65,10,0.08)" : "#FFF8F6",
                borderColor: isDark ? "rgba(232,65,10,0.2)" : "#FDDDD2",
                borderStyle: "dashed",
              }}
            >
              <View className="flex-row items-center gap-2 mb-1">
                <Ionicons name="sparkles-outline" size={14} color="#E8410A" />
                <Text className="text-[12px] text-accent font-geist-bold">
                  AI Feedback
                </Text>
              </View>
              <Text className="text-[12px] text-muted-light dark:text-muted-dark leading-5">
                Detailed feedback on your sentences will appear here once AI is
                enabled.
              </Text>
            </View>

            <TouchableOpacity
              onPress={closeSheet}
              className="bg-bg-dark dark:bg-white/10 rounded-2xl py-4 items-center mt-4"
            >
              <Text className="text-white font-geist-bold text-[15px]">
                Close
              </Text>
            </TouchableOpacity>
          </View>
        </BottomSheetScrollView>
      </BottomSheet>
    </View>
  );
}
