import { Ionicons } from "@expo/vector-icons";
import { useMigrations } from "drizzle-orm/expo-sqlite/migrator";
import LottieView from "lottie-react-native";
import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { Animated, StyleSheet, Text, useColorScheme, View } from "react-native";
import { NotificationBootstrap } from "../components/NotificationBootstrap";
import migrations from "../drizzle/migrations";
import { db } from "./client";
import { seedDatabase } from "./seed";

// ─── Context ──────────────────────────────────────────────────────────────────

// Seul isReady est nécessaire en contexte — db est un singleton module-level
// utilisé directement dans db/actions.ts (pas via useDb).
const DatabaseContext = createContext<{ isReady: boolean }>({ isReady: false });

export const useIsDbReady = () => useContext(DatabaseContext).isReady;

/** @deprecated Les actions DB utilisent directement le singleton `db`. */
export const useDb = () => {
  const { isReady } = useContext(DatabaseContext);
  if (!isReady) throw new Error("Database not ready yet");
  return db;
};

// ─── Palette ──────────────────────────────────────────────────────────────────

const COLORS = {
  light: { bg: "#FAF8F4", primary: "#1A1714", muted: "#A89F96" },
  dark: { bg: "#131210", primary: "#F5F2ED", muted: "#5C5651" },
} as const;

// ─── Loading Screen (overlay) ─────────────────────────────────────────────────

function LoadingScreen() {
  const scheme = useColorScheme();
  const c = scheme === "dark" ? COLORS.dark : COLORS.light;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    // Fond opaque immédiatement → index.tsx jamais visible derrière
    <View style={[styles.overlay, { backgroundColor: c.bg }]}>
      {/* Seul le contenu (logo + animation + texte) fait le fade-in */}
      <Animated.View style={{ alignItems: "center", opacity: fadeAnim }}>
        {/* ── Animation ── */}
        <LottieView
          source={require("../app/loading.json")}
          autoPlay
          loop
          style={{ width: 110, height: 110, marginTop: 8 }}
        />
        {/* ── Logo ── */}
        <View style={{ alignItems: "center", marginBottom: 30 }}>
          <Text
            style={{
              fontFamily: "Inter-Regular",
              fontSize: 11,
              letterSpacing: 5,
              color: c.muted,
              marginBottom: -2,
            }}
          >
            DAILY
          </Text>

          <View style={{ flexDirection: "row" }}>
            <Text
              style={{
                fontFamily: "Geist-Bold",
                fontSize: 30,
                color: c.primary,
              }}
            >
              DR
            </Text>
            <Text
              style={{
                fontFamily: "Geist-Bold",
                fontSize: 30,
                color: "#E85D26",
              }}
            >
              O
            </Text>
            <Text
              style={{
                fontFamily: "Geist-Bold",
                fontSize: 30,
                color: c.primary,
              }}
            >
              P
            </Text>
          </View>
        </View>

        {/* ── Sous-titre ── */}
        <Text
          style={{
            fontFamily: "Geist-Regular",
            fontSize: 13,
            color: c.muted,
            letterSpacing: 0.3,
            marginTop: 4,
          }}
        >
          Preparing your daily word…
        </Text>
      </Animated.View>
    </View>
  );
}

// ─── Error Screen ─────────────────────────────────────────────────────────────

function ErrorScreen({ message }: { message: string }) {
  const scheme = useColorScheme();
  const c = scheme === "dark" ? COLORS.dark : COLORS.light;

  return (
    <View
      style={[
        styles.overlay,
        { backgroundColor: c.bg, justifyContent: "center", padding: 40 },
      ]}
    >
      <Ionicons
        name="warning-outline"
        size={52}
        color="#E85D26"
        style={{ marginBottom: 20 }}
      />

      <Text
        style={{
          fontFamily: "Geist-Bold",
          fontSize: 20,
          color: c.primary,
          marginBottom: 10,
          textAlign: "center",
        }}
      >
        Something went wrong
      </Text>

      <Text
        style={{
          fontFamily: "Geist-Regular",
          fontSize: 13,
          color: c.muted,
          textAlign: "center",
          lineHeight: 22,
        }}
      >
        {message}
      </Text>
    </View>
  );
}

// ─── Provider ─────────────────────────────────────────────────────────────────

export const DatabaseProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { success, error } = useMigrations(db, migrations);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (success) {
      seedDatabase()
        .then(() => setIsReady(true))
        .catch((err) => {
          console.error("Seeding error:", err);
          setIsReady(true);
        });
    }
  }, [success]);

  // En cas d'erreur fatale de migration, on remplace tout l'arbre
  if (error) return <ErrorScreen message={error.message} />;

  return (
    <DatabaseContext.Provider value={{ isReady }}>
      {/* Le Stack expo-router est TOUJOURS monté — évite le warning
          "state update on unmounted component" de useLinking. */}
      {children}

      {/* NotificationBootstrap uniquement quand la DB est prête */}
      {isReady && <NotificationBootstrap />}

      {/* Overlay qui couvre tout pendant l'init — disparaît quand isReady */}
      {!isReady && <LoadingScreen />}
    </DatabaseContext.Provider>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFill,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 9999,
  },
});
