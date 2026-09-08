import { router } from 'expo-router';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { colors } from '@/constants/colors';
import { spacing } from '@/constants/spacing';
import { seniorTypography } from '@/constants/typography';

const alerts = [
  {
    id: 1,
    tag: '예정',
    title: '월세가 3일 뒤에 빠져나가요',
    description: '9월 7일 · 650,000원',
  },
  {
    id: 2,
    tag: '완료',
    title: '통신비가 3일 전에 빠져나갔어요',
    description: '9월 1일 · 68,500원',
  },
  {
    id: 3,
    tag: '가족',
    title: '가족 소식이 도착했어요',
    description: '오늘의 활동을 마치면 확인할 수 있어요',
  },
];

export default function NotificationsScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.back}>‹</Text>
          </TouchableOpacity>

          <Text style={styles.title}>알림</Text>
        </View>

        {alerts.map((alert) => (
          <View key={alert.id} style={styles.card}>
            <View style={styles.tag}>
              <Text style={styles.tagText}>{alert.tag}</Text>
            </View>

            <Text style={styles.alertTitle}>
              {alert.title}
            </Text>

            <Text style={styles.description}>
              {alert.description}
            </Text>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F8FA',
  },

  content: {
    paddingHorizontal: spacing.page,
    paddingBottom: spacing.section,
  },

  header: {
    height: 72,
    flexDirection: 'row',
    alignItems: 'center',
  },

  backButton: {
    minWidth: spacing.touchTarget,
    minHeight: spacing.touchTarget,
    justifyContent: 'center',
  },

  back: {
    fontSize: 38,
    color: colors.text,
  },

  title: {
    fontSize: seniorTypography.pageTitle,
    fontWeight: '800',
    color: '#191F28',
  },

  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: spacing.cardRadius,
    padding: spacing.content,
    marginBottom: spacing.item,
  },

  tag: {
    alignSelf: 'flex-start',
    backgroundColor: '#FFF3BF',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },

  tagText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#765C00',
  },

  alertTitle: {
    marginTop: 14,
    fontSize: seniorTypography.body,
    fontWeight: '800',
    color: '#191F28',
  },

  description: {
    marginTop: 8,
    fontSize: seniorTypography.body,
    lineHeight: 24,
    color: '#8B95A1',
  },
});