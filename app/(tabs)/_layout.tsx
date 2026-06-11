import { useTheme } from '@/hooks/useTheme';
import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { ColorValue, View } from 'react-native';

type IoniconsName = React.ComponentProps<typeof Ionicons>['name'];

function TabIcon({
  name,
  color,
  focused,
}: {
  name: IoniconsName;
  color: string | ColorValue;
  focused: boolean;
}) {
  return (
    <View style={{ alignItems: 'center', gap: 5, paddingTop: 4 }}>
      <Ionicons name={name} size={20} color={color} />
      {focused && (
        <View
          style={{
            width: 6,
            height: 6,
            borderRadius: 5,
            backgroundColor: color,
            position: 'absolute',
            top: 45,
          }}
        />
      )}
    </View>
  );
}

export default function TabLayout() {
  const theme = useTheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.primary,
        tabBarInactiveTintColor: theme.textMuted,
        tabBarShowLabel: true,
        tabBarLabelStyle: {
          fontSize: 11,
          fontFamily: 'Inter_500Medium',
          marginBottom: 4,
        },
        tabBarStyle: {
          backgroundColor: theme.surface,
          borderTopColor: theme.border,
          borderTopWidth: 1,
          height: 70,
          paddingTop: 5,
          paddingBottom: 0,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="home-outline" color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="progress"
        options={{
          title: 'Progress',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="bar-chart-outline" color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="quiz"
        options={{
          title: 'Practice',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="pencil-outline" color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="settings-outline" color={color} focused={focused} />
          ),
        }}
      />
    </Tabs>
  );
}