import { router } from 'expo-router';
import { SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { fonts, guardianTypography } from '@/constants/typography';

const alerts = [
  ['확인 필요', '김상우님에게 5,000,000원 송금 요청', '처음 보내는 계좌예요 · 오늘 14:20'],
  ['완료', '김영희님의 오늘 활동이 완료됐어요', '오늘 12:10'],
];

export default function AlertsScreen() {
  return <SafeAreaView style={styles.container}><View style={styles.content}><Text style={styles.title}>알림</Text>{alerts.map(([tag, title, detail], index) => <TouchableOpacity key={title} style={[styles.card, index === 0 && styles.warning]} onPress={() => index === 0 && router.push('/guardian/transaction/1')}><Text style={styles.tag}>{tag}</Text><Text style={styles.cardTitle}>{title}</Text><Text style={styles.detail}>{detail}</Text></TouchableOpacity>)}</View></SafeAreaView>;
}

const styles = StyleSheet.create({ container: { flex: 1, backgroundColor: '#F7F8FA' }, content: { flex: 1, padding: 24 }, title: { fontSize: guardianTypography.pageTitle, fontFamily: fonts.bold, color: '#191F28', marginBottom: 24 }, card: { padding: 20, borderRadius: 20, backgroundColor: '#FFFFFF', marginBottom: 12 }, warning: { backgroundColor: '#FFF7F7' }, tag: { fontSize: guardianTypography.caption, fontFamily: fonts.semiBold, color: '#F04452' }, cardTitle: { marginTop: 12, fontSize: guardianTypography.bodyStrong, fontFamily: fonts.bold, color: '#191F28' }, detail: { marginTop: 8, fontSize: guardianTypography.secondary, fontFamily: fonts.regular, color: '#8B95A1' } });
