import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';

import AppHeader from '@/components/navigation/AppHeader';
import { colors } from '@/constants/colors';
import {
  fonts,
  guardianTypography,
} from '@/constants/typography';

export default function GuardianTabsLayout() {
  return (
    <Tabs
      screenOptions={{
        // 보호자 메인 탭에서는 공통 헤더 표시
        headerShown: true,

        header: () => (
          <AppHeader mode="guardian" />
        ),

        // Bottom Navigation
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: '#B0B8C1',

        tabBarStyle: {
          height: 78,
          paddingTop: 8,
          paddingBottom: 10,

          backgroundColor: '#FFFFFF',

          borderTopWidth: 1,
          borderTopColor: '#F2F4F6',

          elevation: 0,
          shadowOpacity: 0,
        },

        tabBarLabelStyle: {
          fontSize: guardianTypography.tabLabel,
          fontFamily: fonts.semiBold,
          marginTop: 1,
        },

        tabBarItemStyle: {
          paddingVertical: 2,
        },
      }}
    >
      {/* 홈 */}
      <Tabs.Screen
        name="home"
        options={{
          title: '홈',

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
              size={24}
              color={color}
            />
          ),
        }}
      />

      {/* 알림 */}
      <Tabs.Screen
        name="alerts"
        options={{
          title: '알림',

          tabBarIcon: ({
            color,
            focused,
          }) => (
            <Ionicons
              name={
                focused
                  ? 'notifications'
                  : 'notifications-outline'
              }
              size={24}
              color={color}
            />
          ),
        }}
      />

      {/* 리포트 */}
      <Tabs.Screen
        name="report"
        options={{
          title: '리포트',

          tabBarIcon: ({
            color,
            focused,
          }) => (
            <Ionicons
              name={
                focused
                  ? 'stats-chart'
                  : 'stats-chart-outline'
              }
              size={24}
              color={color}
            />
          ),
        }}
      />

      {/* 설정 */}
      <Tabs.Screen
        name="settings"
        options={{
          title: '설정',

          tabBarIcon: ({
            color,
            focused,
          }) => (
            <Ionicons
              name={
                focused
                  ? 'settings'
                  : 'settings-outline'
              }
              size={24}
              color={color}
            />
          ),
        }}
      />
    </Tabs>
  );
}