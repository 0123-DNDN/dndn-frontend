import { Tabs } from 'expo-router';
import { Text } from 'react-native';
import { colors } from '@/constants/colors';
import { spacing } from '@/constants/spacing';
import { seniorTypography } from '@/constants/typography';

export default function SeniorTabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: '#B0B8C1',

        tabBarStyle: {
          minHeight: spacing.touchTarget + 36,
          paddingTop: 10,
          paddingBottom: 12,
          backgroundColor: colors.white,
          borderTopWidth: 0,
        },

        tabBarLabelStyle: {
          fontSize: seniorTypography.tabLabel,
          fontWeight: '700',
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: '홈',
          tabBarIcon: ({ color }) => (
            <Text style={{ fontSize: 24, color }}>⌂</Text>
          ),
        }}
      />

      <Tabs.Screen
        name="assistant"
        options={{
          title: 'AI 비서',
          tabBarIcon: ({ color }) => (
            <Text style={{ fontSize: 23, color }}>✦</Text>
          ),
        }}
      />

      <Tabs.Screen
        name="activity"
        options={{
          title: '활동',
          tabBarIcon: ({ color }) => (
            <Text style={{ fontSize: 23, color }}>✓</Text>
          ),
        }}
      />

      <Tabs.Screen
        name="account"
        options={{
          href: null,
        }}
      />

      {/* 하단 탭에는 노출하지 않는 상세 화면 */}
      <Tabs.Screen
        name="notifications"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}