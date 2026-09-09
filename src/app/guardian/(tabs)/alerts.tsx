import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { fonts, guardianTypography } from '@/constants/typography';
import { getNotifications, markNotificationAsRead } from '@/services/notification';
import type { Notification } from '@/types/notification';

export default function AlertsScreen() {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const loadNotifications = () => {
    getNotifications()
      .then(setNotifications)
      .catch((error) => console.warn('GUARDIAN ALERTS ERROR:', error));
  };

  useEffect(loadNotifications, []);

  const handleNotificationPress = async (notification: Notification) => {
    try {
      if (!notification.isRead) {
        await markNotificationAsRead(notification.notificationId);
        setNotifications((current) =>
          current.map((item) =>
            item.notificationId === notification.notificationId
              ? { ...item, isRead: true }
              : item,
          ),
        );
      }
    } catch (error) {
      console.warn('GUARDIAN ALERT READ ERROR:', error);
    }

    if (notification.type === 'HIGH_RISK_TRANSFER' && notification.relatedTransactionId) {
      router.push(`/guardian/transaction/${notification.relatedTransactionId}`);
    } else if (notification.type === 'FAMILY_POST_RECEIVED') {
      router.push('/senior/family-news');
    }
  };

  return <SafeAreaView style={styles.container}><View style={styles.content}><Text style={styles.title}>알림</Text>{notifications.map((notification) => <TouchableOpacity key={notification.notificationId} style={[styles.card, notification.type === 'HIGH_RISK_TRANSFER' && styles.warning, notification.isRead && styles.readCard]} onPress={() => handleNotificationPress(notification)}><Text style={styles.tag}>{notification.isRead ? '확인함' : notification.type === 'HIGH_RISK_TRANSFER' ? '확인 필요' : '새 알림'}</Text><Text style={styles.cardTitle}>{notification.title}</Text><Text style={styles.detail}>{notification.content}</Text></TouchableOpacity>)}</View></SafeAreaView>;
}
const styles = StyleSheet.create({ container: { flex: 1, backgroundColor: '#F7F8FA' }, content: { flex: 1, padding: 24 }, title: { fontSize: guardianTypography.pageTitle, fontFamily: fonts.bold, color: '#191F28', marginBottom: 24 }, card: { padding: 20, borderRadius: 20, backgroundColor: '#FFFFFF', marginBottom: 12 }, warning: { backgroundColor: '#FFF7F7' }, readCard: { opacity: 0.65 }, tag: { fontSize: guardianTypography.caption, fontFamily: fonts.semiBold, color: '#F04452' }, cardTitle: { marginTop: 12, fontSize: guardianTypography.bodyStrong, fontFamily: fonts.bold, color: '#191F28' }, detail: { marginTop: 8, fontSize: guardianTypography.secondary, fontFamily: fonts.regular, color: '#8B95A1' } });
