import { Tabs } from 'expo-router';
import { guardianTypography } from '@/constants/typography';

export default function GuardianTabLayout() {
  return (
    <Tabs screenOptions={{ headerShown: false, tabBarLabelStyle: { fontSize: guardianTypography.tabLabel, fontWeight: '700' } }}>
      <Tabs.Screen name="home" options={{ title: '홈' }} />
      <Tabs.Screen name="alerts" options={{ title: '알림' }} />
      <Tabs.Screen name="report" options={{ title: '리포트' }} />
      <Tabs.Screen name="settings" options={{ title: '설정' }} />
    </Tabs>
  );
}
