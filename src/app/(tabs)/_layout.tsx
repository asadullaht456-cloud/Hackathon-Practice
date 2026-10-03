import React from 'react';
import { Tabs } from 'expo-router';
import { Icon } from 'react-native-paper';
import { useAppTheme } from '@/hooks/ui/useAppTheme';

/**
 * Bottom Tabs Layout for Chalo app
 * Tabs: Live Map, Plan Trip, Wallet & Pass, Profile
 */
export default function TabLayout() {
  const { colors, isGlare } = useAppTheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: isGlare ? '#333333' : colors.textMuted,
        tabBarStyle: {
          backgroundColor: colors.card,
          borderTopColor: isGlare ? colors.border : colors.borderStrong,
          borderTopWidth: isGlare ? 2 : 1,
          height: 64,
          paddingBottom: 10,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: isGlare ? '800' : '600',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Live Map',
          tabBarIcon: ({ color, size }) => (
            <Icon source="map-marker-radius" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="plan"
        options={{
          title: 'Plan',
          tabBarIcon: ({ color, size }) => (
            <Icon source="transit-detour" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="wallet"
        options={{
          title: 'Wallet',
          tabBarIcon: ({ color, size }) => (
            <Icon source="wallet-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => (
            <Icon source="account-circle-outline" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
