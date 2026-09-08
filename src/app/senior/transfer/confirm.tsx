import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { fonts, seniorTypography } from '@/constants/typography';

export default function TransferConfirmScreen() {
  const { risk } = useLocalSearchParams<{ risk?: string }>();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View>
          <Text style={styles.title}>송금 내용을 확인해 주세요</Text>
          <View style={styles.card}>
            <Text style={styles.label}>받는 분</Text>
            <Text style={styles.value}>{risk === 'true' ? '김상우' : '허경민'}</Text>
            <Text style={styles.detail}>{risk === 'true' ? '신한은행 · 110-***-4821' : 'KB국민은행 · 123-***-8890'}</Text>
            <Text style={styles.label}>보낼 금액</Text>
            <Text style={styles.amount}>{risk === 'true' ? '5,000,000원' : '500,000원'}</Text>
            <Text style={styles.label}>출금계좌</Text>
            <Text style={styles.value}>KB 국민 든든통장</Text>
            <Text style={styles.detail}>123456-01-**** · 잔액 3,450,000원</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.primaryButton} onPress={() => router.push({ pathname: '/senior/transfer/analyzing', params: { risk: risk === 'true' ? 'true' : 'false' } })}>
          <Text style={styles.primaryButtonText}>이대로 보낼게요</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7F8FA' },
  content: { flex: 1, justifyContent: 'space-between', paddingHorizontal: 24, paddingVertical: 24 },
  title: { fontSize: seniorTypography.sectionTitle, fontFamily: fonts.bold, color: '#191F28' },
  card: { marginTop: 40, backgroundColor: '#FFFFFF', borderRadius: 20, padding: 24 },
  label: { marginTop: 20, fontSize: seniorTypography.caption, fontFamily: fonts.regular, color: '#8B95A1' },
  value: { marginTop: 6, fontSize: seniorTypography.bodyStrong, fontFamily: fonts.bold, color: '#191F28' },
  detail: { marginTop: 4, fontSize: seniorTypography.caption, fontFamily: fonts.regular, color: '#6B7684' },
  amount: { marginTop: 6, fontSize: seniorTypography.amount, fontFamily: fonts.bold, color: '#191F28' },
  primaryButton: { minHeight: 64, borderRadius: 16, backgroundColor: '#318866', alignItems: 'center', justifyContent: 'center' },
  primaryButtonText: { fontSize: seniorTypography.button, fontFamily: fonts.bold, color: '#FFFFFF' },
});
