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
import {
  fonts,
  seniorTypography,
} from '@/constants/typography';

const payments = [
  {
    id: 1,
    name: '월세',
    message: '3일 뒤 나가요',
    amount: '650,000원',
    date: '9월 7일',
    status: 'scheduled',
  },
  {
    id: 2,
    name: '통신비',
    message: '2일 전 나갔어요',
    amount: '68,500원',
    date: '9월 1일',
    status: 'complete',
  },
  {
    id: 3,
    name: '관리비',
    message: '오늘 나가요',
    amount: '120,000원',
    date: '9월 5일',
    status: 'scheduled',
  },
  {
    id: 4,
    name: '보험료',
    message: '결제가 안됐어요',
    amount: '42,000원',
    date: '9월 3일',
    status: 'failed',
  },
];

export default function NotificationsScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.backRow}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
              activeOpacity={0.6}
            >
              <Text style={styles.back}>‹</Text>
            </TouchableOpacity>

            <Text style={styles.backLabel}>
              뒤로가기
            </Text>
          </View>

          <Text style={styles.title}>
            정기결제 확인
          </Text>
        </View>

        {/* Payment Cards */}
        <View style={styles.paymentList}>
          {payments.map((item) => (
            <View
              key={item.id}
              style={styles.paymentCard}
            >
              <View style={styles.paymentRow}>
                <Text style={styles.paymentName}>
                  {item.name}
                </Text>

                <Text
                  style={[
                    styles.paymentMessage,
                    item.status === 'complete' &&
                      styles.completeText,
                    item.status === 'failed' &&
                      styles.failedText,
                  ]}
                >
                  {item.message}
                </Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.amount}>
                  {item.amount}
                </Text>

                <Text style={styles.date}>
                  {item.date}
                </Text>
              </View>
            </View>
          ))}
        </View>
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
    minHeight: 128,
    alignItems: 'flex-start',
    paddingTop: spacing.item,
    marginBottom: spacing.content,
  },

  backRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  backButton: {
    width: 32,
    minHeight: spacing.touchTarget,
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    paddingTop: 0,
    marginRight: 0,
  },

  back: {
    fontSize: 38,
    color: colors.text,
  },

  backLabel: {
    marginLeft: 0,
    fontSize: seniorTypography.body,
    fontFamily: fonts.semiBold,
    color: colors.text,
  },

  title: {
    marginTop: spacing.item,
    fontSize: 32,
    lineHeight: 40,
    fontFamily: fonts.bold,
    color: '#191F28',
  },

  paymentList: {
    gap: spacing.item,
  },

  paymentCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: spacing.cardRadius,
    paddingHorizontal: 26,
    paddingVertical: 26,
  },

  paymentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },

  paymentName: {
    width: 96,
    fontSize: 24,
    lineHeight: 34,
    fontFamily: fonts.bold,
    color: '#191F28',
  },

  paymentMessage: {
    flex: 1,
    fontSize: 23,
    lineHeight: 32,
    fontFamily: fonts.bold,
    color: '#191F28',
  },

  completeText: {
    color: '#318866',
  },

  failedText: {
    color: '#F04452',
  },

  detailRow: {
    marginTop: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },

  amount: {
    width: 96,
    fontSize: 20,
    lineHeight: 28,
    fontFamily: fonts.regular,
    color: '#8B95A1',
  },

  date: {
    flex: 1,
    fontSize: 20,
    lineHeight: 28,
    fontFamily: fonts.regular,
    color: '#8B95A1',
  },
});