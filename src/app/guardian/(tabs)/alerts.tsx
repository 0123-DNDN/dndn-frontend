import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { fonts, guardianTypography } from '@/constants/typography';
import { getNotifications } from '@/services/notification';
import type { Notification } from '@/types/notification';

export default function AlertsScreen() {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    getNotifications()
      .then(setNotifications)
      .catch((error) => console.warn('GUARDIAN ALERTS ERROR:', error));
  }, []);

  return <SafeAreaView style={styles.container}><View style={styles.content}><Text style={styles.title}>알림</Text>{notifications.map((notification) => <TouchableOpacity key={notification.notificationId} style={[styles.card, notification.type === 'HIGH_RISK_TRANSFER' && styles.warning]} onPress={() => notification.relatedTransactionId && router.push(`/guardian/transaction/${notification.relatedTransactionId}`)}><Text style={styles.tag}>{notification.type === 'HIGH_RISK_TRANSFER' ? '확인 필요' : '알림'}</Text><Text style={styles.cardTitle}>{notification.title}</Text><Text style={styles.detail}>{notification.content}</Text></TouchableOpacity>)}</View></SafeAreaView>;
}

const styles = StyleSheet.create({ container: { flex: 1, backgroundColor: '#F7F8FA' }, content: { flex: 1, padding: 24 }, title: { fontSize: guardianTypography.pageTitle, fontFamily: fonts.bold, color: '#191F28', marginBottom: 24 }, card: { padding: 20, borderRadius: 20, backgroundColor: '#FFFFFF', marginBottom: 12 }, warning: { backgroundColor: '#FFF7F7' }, tag: { fontSize: guardianTypography.caption, fontFamily: fonts.semiBold, color: '#F04452' }, cardTitle: { marginTop: 12, fontSize: guardianTypography.bodyStrong, fontFamily: fonts.bold, color: '#191F28' }, detail: { marginTop: 8, fontSize: guardianTypography.secondary, fontFamily: fonts.regular, color: '#8B95A1' } });
