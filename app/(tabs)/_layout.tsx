import React from 'react';
import { Tabs } from 'expo-router';
import { BarChart2, LineChart, Settings } from 'lucide-react-native';
import { darkTheme } from '@/constants/colors';
import NotificationBell from '@/components/NotificationBell';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarStyle: {
          backgroundColor: darkTheme.background,
          borderTopColor: darkTheme.border,
          height: 60,
          paddingBottom: 10,
        },
        tabBarActiveTintColor: darkTheme.accent,
        tabBarInactiveTintColor: darkTheme.secondaryText,
        tabBarLabelStyle: {
          fontSize: 12,
        },
        headerStyle: {
          backgroundColor: darkTheme.background,
        },
        headerTintColor: darkTheme.text,
        headerShadowVisible: false,
        headerRight: () => <NotificationBell />,
        headerRightContainerStyle: {
          paddingRight: 16,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Signals',
          tabBarIcon: ({ color }) => <BarChart2 size={24} color={color} />,
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="statistics"
        options={{
          title: 'Statistics',
          tabBarIcon: ({ color }) => <LineChart size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color }) => <Settings size={24} color={color} />,
        }}
      />
    </Tabs>
  );
}