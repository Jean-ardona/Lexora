import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { Platform, Text, useColorScheme, View } from 'react-native';

const TABS = [
  { name: 'index',    label: 'Home',     icon: 'flame-outline' as const },
  { name: 'quiz',     label: 'Practice',     icon: 'book-outline' as const },
  { name: 'progress', label: 'Progress', icon: 'pie-chart-outline'   as const },
  { name: 'settings',  label: 'Settings',  icon: 'settings-outline' as const },
];

function TabIcon({ icon, label, focused, isDark }: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  focused: boolean;
  isDark: boolean;
}) {
  const acc = '#E8410A';
  const inactiveColor = isDark ? '#666' : '#9A948C';

  return (
    <View style={{ alignItems: 'center', gap: 3, paddingTop: 4 }}>
      <View style={{
        width: focused ? 16 : 0,
        height: 3,
        borderRadius: 2,
        backgroundColor: acc,
        marginBottom: 2,
        opacity: focused ? 1 : 0,
      }} />
      <View style={{
        width: 48, height: 30, borderRadius: 10,
        alignItems: 'center', justifyContent: 'center',
        backgroundColor: focused
          ? isDark ? 'rgba(232,65,10,0.15)' : 'rgba(232,65,10,0.10)'
          : 'transparent',
      }}>
        <Ionicons
          name={focused ? icon.replace('-outline', '') as keyof typeof Ionicons.glyphMap : icon}
          size={20}
          color={focused ? acc : inactiveColor}
        />
      </View>
      <Text numberOfLines={1} style={{
        fontSize: 10, letterSpacing: 0.3,
        fontFamily: 'Geist-Regular',
        color: focused ? acc : inactiveColor,
        fontWeight: focused ? '600' : '400',
        width: 60, textAlign: 'center',
      }}>
        {label}
      </Text>
    </View>
  );
}

export default function TabsLayout() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
          height: Platform.OS === 'ios' ? 80 : 72,
          paddingBottom: Platform.OS === 'ios' ? 20 : 8,
          paddingTop: 6,
          paddingHorizontal: 4,
          backgroundColor: isDark ? '#1E1C19' : '#FFFFFF',
          borderTopWidth: 1,
          borderTopColor: isDark ? '#2A2825' : '#E8E4DE',
          elevation: 0,
        },
      }}
    >
      {TABS.map((tab) => (
        <Tabs.Screen
          key={tab.name}
          name={tab.name}
          options={{
            title: tab.label,
            tabBarIcon: ({ focused }) => (
              <TabIcon icon={tab.icon} label={tab.label} focused={focused} isDark={isDark} />
            ),
          }}
        />
      ))}
    </Tabs>
  );
}