import { router } from 'expo-router';
import { SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors } from '@/constants/colors';
import { spacing } from '@/constants/spacing';
import { seniorTypography } from '@/constants/typography';

const accounts = [
  ['KB 국민 든든통장', '123456-01-****', '3,450,000원'],
  ['KB 생활비 통장', '987654-02-****', '820,000원'],
];

export default function OtherAccountsScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.back}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.title}>다른 계좌 보기</Text>
        <Text style={styles.subtitle}>확인할 계좌를 선택해 주세요.</Text>
        {accounts.map(([name, number, balance], index) => (
          <TouchableOpacity
            key={number}
            style={[styles.accountCard, index === 0 && styles.selectedCard]}
            onPress={() => router.replace('/senior/account')}
            accessibilityRole="button"
          >
            <Text style={styles.accountName}>{name}</Text>
            <Text style={styles.accountNumber}>{number}</Text>
            <Text style={styles.balance}>{balance}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { flex: 1, padding: spacing.page },
  backButton: { minWidth: spacing.touchTarget, minHeight: spacing.touchTarget, justifyContent: 'center' },
  back: { fontSize: 38, color: colors.text },
  title: { marginTop: spacing.item, fontSize: seniorTypography.pageTitle, fontWeight: '800', color: colors.text },
  subtitle: { marginTop: 8, fontSize: seniorTypography.caption, color: colors.muted },
  accountCard: { marginTop: spacing.content, padding: spacing.page, borderRadius: spacing.cardRadius, backgroundColor: colors.white },
  selectedCard: { borderWidth: 2, borderColor: colors.primary },
  accountName: { fontSize: seniorTypography.bodyStrong, fontWeight: '800', color: colors.text },
  accountNumber: { marginTop: 8, fontSize: seniorTypography.caption, color: colors.muted },
  balance: { marginTop: spacing.content, fontSize: seniorTypography.amount, fontWeight: '900', color: colors.text },
});
