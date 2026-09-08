import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';

import AppHeader from '@/components/navigation/AppHeader';
import { colors } from '@/constants/colors';
import {
  fonts,
  seniorTypography,
} from '@/constants/typography';

export default function SeniorTabsLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: '#B0B8C1',

        tabBarStyle: {
          height: 86,
          paddingTop: 10,
          paddingBottom: 12,
          backgroundColor: '#FFFFFF',

          borderTopWidth: 1,
          borderTopColor: '#F2F4F6',

          elevation: 0,
          shadowOpacity: 0,
        },

        tabBarLabelStyle: {
          fontSize: seniorTypography.tabLabel,
          fontFamily: fonts.semiBold,
          marginTop: 2,
        },

        tabBarItemStyle: {
          paddingVertical: 2,
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: '홈',

          headerShown: true,
          header: () => (
            <AppHeader mode="senior" />
          ),

          tabBarIcon: ({
            color,
            focused,
          }) => (
            <Ionicons
              name={
                focused
                  ? 'home'
                  : 'home-outline'
              }
              size={26}
              color={color}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="assistant"
        options={{
          title: 'AI 비서',

          headerShown: false,

          tabBarIcon: ({
            color,
            focused,
          }) => (
            <Ionicons
              name={
                focused
                  ? 'chatbubble-ellipses'
                  : 'chatbubble-ellipses-outline'
              }
              size={27}
              color={color}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="activity"
        options={{
          title: '활동',

          headerShown: true,
          header: () => (
            <AppHeader mode="senior" />
          ),

          tabBarIcon: ({
            color,
            focused,
          }) => (
            <Ionicons
              name={
                focused
                  ? 'walk'
                  : 'walk-outline'
              }
              size={28}
              color={color}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="account"
        options={{
          href: null,
          headerShown: false,
        }}
      />
    </Tabs>
  );
}