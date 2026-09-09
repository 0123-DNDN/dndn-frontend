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
    name: '박윤아',
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
        {/* 정기결제 확인과 동일한 헤더 */}
        <View style={styles.header}>
          <View style={styles.backRow}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
              activeOpacity={0.6}
            >
              <Text style={styles.back}>
                ‹
              </Text>
            </TouchableOpacity>

            <Text style={styles.backLabel}>
              뒤로가기
            </Text>
          </View>

          {/* 제목 위치는 정기결제 확인과 동일 */}
          <View style={styles.titleArea}>
            <Text style={styles.title}>
              내 통장
            </Text>

            {/* absolute라서 제목 위치에 영향 없음 */}
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

        {/* 계좌 카드 */}
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

        {/* 거래내역 */}
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

                  <Text style={styles.transactionDescription}>
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

  /*
   * 정기결제 확인 화면과 동일
   */
  content: {
    paddingHorizontal: spacing.page,
    paddingBottom: spacing.section,
  },

  /*
   * 정기결제 확인 화면과 동일
   */
  header: {
    minHeight: 136,
    alignItems: 'flex-start',
    paddingTop: spacing.item,
    marginBottom: spacing.content,
  },

  /*
   * 정기결제 확인 화면과 동일
   */
  backRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  /*
   * 정기결제 확인 화면과 동일
   */
  backButton: {
    width: 32,
    minHeight: spacing.touchTarget,
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    paddingTop: 0,
    marginRight: 0,
  },

  /*
   * 정기결제 확인 화면과 동일
   */
  back: {
    fontSize: 38,
    color: colors.text,
  },

  /*
   * 정기결제 확인 화면과 동일
   */
  backLabel: {
    marginLeft: 0,
    fontSize: seniorTypography.body,
    fontFamily: fonts.semiBold,
    color: colors.text,
  },

  /*
   * 정기결제 화면의 title과 동일한
   * 시작 Y축을 만들기 위한 영역
   */
  titleArea: {
    width: '100%',
    height: 64,
    marginTop: spacing.item,
    position: 'relative',
  },

  /*
   * 정기결제 확인의 title과
   * fontSize / lineHeight / fontFamily 완전 동일
   */
  title: {
    position: 'absolute',
    left: 0,
    top: 0,

    fontSize: seniorTypography.hero,
    lineHeight: 44,
    fontFamily: fonts.bold,
    color: '#191F28',
  },

  /*
   * 제목과 같은 Row처럼 보이지만
   * 제목 레이아웃에는 전혀 영향 없음
   */
  otherAccountButton: {
    position: 'absolute',
    right: 0,
    top: 0,

    minHeight: 64,
    paddingHorizontal: 24,

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
    fontSize: seniorTypography.sectionTitle,
    lineHeight: 38,
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
    fontSize: seniorTypography.amount,
    lineHeight: 50,
    fontFamily: fonts.bold,
    color: '#191F28',
  },

  sectionTitle: {
    marginTop: spacing.section,
    marginBottom: spacing.content,

    fontSize: seniorTypography.hero,
    lineHeight: 44,
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
    paddingVertical: 22,
  },

  transactionRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 16,
  },

  transactionLeft: {
    flex: 1,
    minWidth: 0,
  },

  transactionName: {
    fontSize: seniorTypography.sectionTitle,
    lineHeight: 38,
    fontFamily: fonts.bold,
    color: '#191F28',
  },

  transactionDescription: {
    marginTop: 6,
    fontSize: seniorTypography.body,
    lineHeight: 30,
    fontFamily: fonts.regular,
    color: '#8B95A1',
  },

  transactionRight: {
    flexShrink: 0,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },

  transactionValue: {
    fontSize: 26,
    lineHeight: 36,
    fontFamily: fonts.bold,
    color: '#191F28',
  },

  incomeValue: {
    color: '#191F28',
  },

  cancelBadge: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: '#FFF1F3',
  },

  cancelBadgeText: {
    fontSize: 20,
    lineHeight: 28,
    fontFamily: fonts.bold,
    color: '#F04452',
  },
});