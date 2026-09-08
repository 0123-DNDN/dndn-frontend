import { router } from 'expo-router';
import { SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { guardianTypography } from '@/constants/typography';

export default function ReportScreen() {
  return <SafeAreaView style={styles.container}><View style={styles.content}><Text style={styles.title}>안전 리포트</Text><Text style={styles.subtitle}>9월의 금융 활동을 한눈에 확인해요.</Text><View style={styles.scoreCard}><Text style={styles.label}>이번 달 안전 점수</Text><Text style={styles.score}>92점</Text><Text style={styles.good}>안전하게 관리되고 있어요.</Text></View><TouchableOpacity style={styles.item} onPress={() => router.push('/guardian/report/detail')}><Text style={styles.itemTitle}>거래 분석 리포트</Text><Text style={styles.arrow}>›</Text></TouchableOpacity></View></SafeAreaView>;
}

const styles = StyleSheet.create({ container: { flex: 1, backgroundColor: '#F7F8FA' }, content: { flex: 1, padding: 24 }, title: { fontSize: guardianTypography.pageTitle, fontWeight: '800', color: '#191F28' }, subtitle: { marginTop: 8, fontSize: guardianTypography.body, color: '#8B95A1' }, scoreCard: { marginTop: 32, padding: 24, borderRadius: 20, backgroundColor: '#EAF3EE' }, label: { fontSize: guardianTypography.body, color: '#318866' }, score: { marginTop: 8, fontSize: guardianTypography.amount, fontWeight: '900', color: '#191F28' }, good: { marginTop: 8, fontSize: guardianTypography.secondary, color: '#4E5968' }, item: { minHeight: 60, marginTop: 16, paddingHorizontal: 20, borderRadius: 16, backgroundColor: '#FFFFFF', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }, itemTitle: { fontSize: guardianTypography.button, fontWeight: '700', color: '#191F28' }, arrow: { fontSize: 28, color: '#8B95A1' } });
