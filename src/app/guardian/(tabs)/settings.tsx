import { router } from 'expo-router';
import { SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { guardianTypography } from '@/constants/typography';

export default function SettingsScreen() {
  return <SafeAreaView style={styles.container}><View style={styles.content}><Text style={styles.title}>설정</Text><View style={styles.profile}><Text style={styles.name}>박민수 보호자</Text><Text style={styles.detail}>김영희님과 연결됨</Text></View>{['가족 연결 관리', '알림 설정', '도움말'].map((item) => <TouchableOpacity key={item} style={styles.item} onPress={() => item === '가족 연결 관리' && router.push('/auth/family-connect')}><Text style={styles.itemText}>{item}</Text><Text style={styles.arrow}>›</Text></TouchableOpacity>)}</View></SafeAreaView>;
}

const styles = StyleSheet.create({ container: { flex: 1, backgroundColor: '#F7F8FA' }, content: { flex: 1, padding: 24 }, title: { fontSize: guardianTypography.pageTitle, fontWeight: '800', color: '#191F28', marginBottom: 24 }, profile: { padding: 24, borderRadius: 20, backgroundColor: '#FFFFFF', marginBottom: 16 }, name: { fontSize: guardianTypography.bodyStrong, fontWeight: '800', color: '#191F28' }, detail: { marginTop: 8, fontSize: guardianTypography.secondary, color: '#8B95A1' }, item: { minHeight: 60, paddingHorizontal: 20, borderRadius: 16, backgroundColor: '#FFFFFF', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }, itemText: { fontSize: guardianTypography.button, fontWeight: '700', color: '#191F28' }, arrow: { fontSize: 28, color: '#8B95A1' } });
