import { router } from 'expo-router';
import { SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { guardianTypography } from '@/constants/typography';

export default function GuardianHomeScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.eyebrow}>든든 보호자</Text>
        <Text style={styles.title}>김영희님의 금융 안전을{'\n'}함께 지켜보고 있어요.</Text>

        <View style={styles.summaryCard}>
          <Text style={styles.cardLabel}>오늘 확인할 거래</Text>
          <Text style={styles.number}>1건</Text>
          <Text style={styles.muted}>확인이 필요한 송금이 있어요.</Text>
        </View>

        <TouchableOpacity style={styles.riskCard} onPress={() => router.push('/guardian/transaction/1')}>
          <View style={styles.row}>
            <Text style={styles.riskLabel}>확인 필요</Text>
            <Text style={styles.arrow}>›</Text>
          </View>
          <Text style={styles.riskTitle}>김상우님에게 5,000,000원</Text>
          <Text style={styles.muted}>처음 보내는 계좌 · 오늘 14:20</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.reportLink} onPress={() => router.push('/guardian/report')}>
          <Text style={styles.reportText}>이번 달 안전 리포트 보기</Text>
          <Text style={styles.arrow}>›</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAF7',
    padding: 24,
  },
  content: { flex: 1 },
  eyebrow: { fontSize: guardianTypography.bodyStrong, fontWeight: '700', color: '#318866', marginBottom: 16 },
  summaryCard: { marginTop: 32, padding: 24, borderRadius: 20, backgroundColor: '#FFFFFF' },
  cardLabel: { fontSize: 18, color: '#6B7684' },
  number: { marginTop: 8, fontSize: guardianTypography.amount, fontWeight: '900', color: '#191F28' },
  muted: { marginTop: 8, fontSize: guardianTypography.secondary, color: '#8B95A1' },
  riskCard: { marginTop: 16, padding: 24, borderRadius: 20, backgroundColor: '#FFF7F7' },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  riskLabel: { fontSize: 16, fontWeight: '800', color: '#F04452' },
  riskTitle: { marginTop: 16, fontSize: guardianTypography.bodyStrong, fontWeight: '800', color: '#191F28' },
  arrow: { fontSize: 28, color: '#8B95A1' },
  reportLink: { minHeight: 60, marginTop: 16, paddingHorizontal: 20, borderRadius: 16, backgroundColor: '#FFFFFF', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  reportText: { fontSize: guardianTypography.button, fontWeight: '700', color: '#191F28' },

  title: {
    fontSize: 30,
    fontWeight: '800',
  },
});