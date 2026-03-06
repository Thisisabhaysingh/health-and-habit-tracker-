import { Tabs } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useMemo } from 'react';
import { useColorScheme } from '@/components/useColorScheme';
import { useTrackerSync } from '@/hooks/useTrackerSync';

const tabConfig = [
  { name: 'dashboard', label: 'Dashboard', icon: 'view-dashboard', color: '#8b5cf6' },
  { name: 'children/index', label: 'Children', icon: 'account-group', color: '#f59e0b' },
  { name: 'meals/index', label: 'Meals', icon: 'food-apple', color: '#10b981' },
  { name: 'exercise/index', label: 'Exercise', icon: 'dumbbell', color: '#ef4444' },
  { name: 'screen-time/index', label: 'Screen Time', icon: 'monitor', color: '#3b82f6' },
  { name: 'profile', label: 'Profile', icon: 'account-circle', color: '#ec4899' },
];

export default function TabLayout() {
  const scheme = useColorScheme();
  useTrackerSync();
  const palette = useMemo(
    () => ({
      active: '#006879',
      inactive: '#94a3b8',
      background: '#ffffff',
    }),
    [],
  );

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: palette.active,
        tabBarInactiveTintColor: palette.inactive,
        tabBarStyle: {
          backgroundColor: palette.background,
          borderTopWidth: 0,
          shadowOpacity: 0.05,
          height: 68,
          paddingBottom: 10,
        },
        headerShown: false,
      }}>
      {tabConfig.map((tab) => (
        <Tabs.Screen
          key={tab.name}
          name={tab.name}
          options={{
            title: tab.label,
            tabBarIcon: ({ color, size, focused }) => (
              <MaterialCommunityIcons 
                name={tab.icon as any} 
                size={size ?? 22} 
                color={focused ? tab.color : '#94a3b8'} 
              />
            ),
          }}
        />
      ))}
    </Tabs>
  );
}
