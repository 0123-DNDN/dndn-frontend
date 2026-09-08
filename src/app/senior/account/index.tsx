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

const transactions = [
  {
    id: 1,
    name: '허경민',
    description: '오늘 14:20 · 송금 완료',
    value: '-500,000원',
    type: 'expense',
  },
  {
    id: 2,
    name: '김상우',
    description: '오늘 11:05 · 위험 거래 확인 후 취소',
    value: '송금 취소',
    type: 'cancel',
  },
  {
    id: 3,
    name: '국민연금',
    description: '9월 2일 · 입금',
    value: '+680,000원',
    type: 'income',
  },
];

export default function AccountScreen() {
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

          <View style={styles.titleRow}>
            <Text style={styles.title}>
              내 통장
            </Text>

            <TouchableOpacity
              style={styles.otherAccountButton}
              activeOpacity={0.75}
              onPress={() =>
                router.push(
                  '/senior/account/other-accounts',
                )
              }
            >
              <Text style={styles.otherAccountText}>
                다른 통장 보기
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Account Card */}
        <View style={styles.accountCard}>
          <Text style={styles.accountName}>
            KB 국민 든든통장
          </Text>

          <Text style={styles.accountNumber}>
            123456-01-****
          </Text>

          <Text style={styles.balanceLabel}>
            총 잔액
          </Text>

          <Text style={styles.balance}>
            3,450,000원
          </Text>
        </View>

        {/* Transactions */}
        <Text style={styles.sectionTitle}>
          거래내역
        </Text>

        <View style={styles.transactionList}>
          {transactions.map((item) => (
            <View
              key={item.id}
              style={styles.transactionCard}
            >
              <View style={styles.transactionRow}>
                <View style={styles.transactionLeft}>
                  <Text style={styles.transactionName}>
                    {item.name}
                  </Text>

                  <Text
                    style={styles.transactionDescription}
                    numberOfLines={1}
                    ellipsizeMode="tail"
                  >
                    {item.description}
                  </Text>
                </View>

                <View style={styles.transactionRight}>
                  {item.type === 'cancel' ? (
                    <View style={styles.cancelBadge}>
                      <Text style={styles.cancelBadgeText}>
                        {item.value}
                      </Text>
                    </View>
                  ) : (
                    <Text
                      style={[
                        styles.transactionValue,
                        item.type === 'income' &&
                          styles.incomeValue,
                      ]}
                      numberOfLines={1}
                    >
                      {item.value}
                    </Text>
                  )}
                </View>
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
  },

  back: {
    fontSize: 38,
    color: colors.text,
  },

  backLabel: {
    fontSize: seniorTypography.body,
    fontFamily: fonts.semiBold,
    color: colors.text,
  },

  titleRow: {
    marginTop: spacing.item,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
  },

  title: {
    flexShrink: 0,
    fontSize: 32,
    lineHeight: 40,
    fontFamily: fonts.bold,
    color: '#191F28',
  },

  otherAccountButton: {
    minHeight: 60,
    paddingHorizontal: 22,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',

    alignItems: 'center',
    justifyContent: 'center',
  },

  otherAccountText: {
    fontSize: seniorTypography.body,
    lineHeight: 30,
    fontFamily: fonts.bold,
    color: '#191F28',
  },

  accountCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: spacing.cardRadius,
    padding: spacing.page,
  },

  accountName: {
    fontSize: 26,
    lineHeight: 36,
    fontFamily: fonts.bold,
    color: '#191F28',
  },

  accountNumber: {
    marginTop: 8,
    fontSize: seniorTypography.body,
    lineHeight: 30,
    fontFamily: fonts.regular,
    color: '#8B95A1',
  },

  balanceLabel: {
    marginTop: 28,
    fontSize: seniorTypography.body,
    lineHeight: 30,
    fontFamily: fonts.regular,
    color: '#8B95A1',
  },

  balance: {
    marginTop: 8,
    fontSize: 36,
    lineHeight: 46,
    fontFamily: fonts.bold,
    color: '#191F28',
  },

  sectionTitle: {
    marginTop: spacing.section,
    marginBottom: spacing.content,
    fontSize: 30,
    lineHeight: 40,
    fontFamily: fonts.bold,
    color: '#191F28',
  },

  transactionList: {
    gap: spacing.item,
  },

  transactionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: spacing.cardRadius,
    paddingHorizontal: 20,
    paddingVertical: 20,
  },

  transactionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },

  transactionLeft: {
    flex: 1,
    minWidth: 0,
  },

  transactionName: {
    fontSize: 22,
    lineHeight: 30,
    fontFamily: fonts.bold,
    color: '#191F28',
  },

  transactionDescription: {
    marginTop: 4,
    fontSize: 17,
    lineHeight: 24,
    fontFamily: fonts.regular,
    color: '#8B95A1',
  },

  transactionRight: {
    flexShrink: 0,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },

  transactionValue: {
    fontSize: 22,
    lineHeight: 30,
    fontFamily: fonts.bold,
    color: '#191F28',
  },

  incomeValue: {
    color: '#191F28',
  },

  cancelBadge: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 12,
    backgroundColor: '#FFF1F3',
  },

  cancelBadgeText: {
    fontSize: 18,
    lineHeight: 24,
    fontFamily: fonts.bold,
    color: '#F04452',
  },
});