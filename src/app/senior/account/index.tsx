import { router } from 'expo-router';
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors } from '@/constants/colors';
import { spacing } from '@/constants/spacing';
import { seniorTypography } from '@/constants/typography';

const transactions = [
  ['허경민', '-500,000원', '오늘 14:20 · 송금 완료'],
  ['김상우', '송금 취소', '오늘 11:05 · 위험 거래 확인 후 취소'],
  ['국민연금', '+680,000원', '9월 2일 · 입금'],
];

export default function AccountScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.back}>‹</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>내 통장</Text>
          <TouchableOpacity style={styles.otherAccountButton}>
            <Text style={styles.otherAccountText}>다른 계좌 보기</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.accountCard}>
          <Text style={styles.accountName}>KB 국민 든든통장</Text>
          <Text style={styles.accountNumber}>123456-01-****</Text>
          <Text style={styles.balanceLabel}>총 잔액</Text>
          <Text style={styles.balance}>3,450,000원</Text>
        </View>
        <Text style={styles.sectionTitle}>거래내역</Text>
        {transactions.map(([name, amount, info]) => (
          <View key={name} style={styles.transactionCard}>
            <View style={styles.transactionTop}>
              <Text style={styles.transactionName}>{name}</Text>
              <Text style={styles.transactionAmount}>{amount}</Text>
            </View>
            <Text style={styles.transactionInfo}>{info}</Text>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { paddingHorizontal: spacing.page, paddingBottom: spacing.section },
  header: { minHeight: 64, flexDirection: 'row', alignItems: 'center' },
  backButton: { minWidth: spacing.touchTarget, minHeight: spacing.touchTarget, justifyContent: 'center' },
  back: { fontSize: 38, color: colors.text },
  headerTitle: { flex: 1, fontSize: seniorTypography.pageTitle, fontWeight: '800', color: colors.text },
  otherAccountButton: { minHeight: spacing.touchTarget, paddingHorizontal: spacing.item, borderRadius: spacing.buttonRadius, backgroundColor: colors.white, justifyContent: 'center' },
  otherAccountText: { fontSize: 15, fontWeight: '700', color: '#4E5968' },
  accountCard: { backgroundColor: colors.white, borderRadius: spacing.cardRadius, padding: spacing.page, marginTop: spacing.item },
  accountName: { fontSize: 20, fontWeight: '800', color: colors.text },
  accountNumber: { fontSize: seniorTypography.body, color: colors.muted, marginTop: 6 },
  balanceLabel: { fontSize: seniorTypography.caption, color: colors.muted, marginTop: 26 },
  balance: { fontSize: seniorTypography.amount, fontWeight: '900', color: colors.text, marginTop: 6 },
  sectionTitle: { fontSize: 24, fontWeight: '800', color: colors.text, marginTop: spacing.section, marginBottom: spacing.item },
  transactionCard: { backgroundColor: colors.white, borderRadius: spacing.cardRadius, padding: spacing.content, marginBottom: spacing.item },
  transactionTop: { flexDirection: 'row', justifyContent: 'space-between' },
  transactionName: { fontSize: 19, fontWeight: '700', color: colors.text },
  transactionAmount: { fontSize: 19, fontWeight: '800', color: colors.text },
  transactionInfo: { marginTop: spacing.base * 2, fontSize: 15, color: colors.muted },
});
