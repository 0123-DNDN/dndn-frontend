import type { Notification } from '@/types/notification';
import { api } from '@/services/api';

export async function getUnreadNotificationCount(): Promise<number> {
	const response =
		await api.get<number>('/api/notifications/unread-count');

	return response.data;
}

export async function getNotifications(): Promise<Notification[]> {
	const response =
		await api.get<Notification[]>('/api/notifications');

	return response.data;
}

export async function markNotificationAsRead(
	notificationId: number,
): Promise<Notification> {
	const response =
		await api.post<Notification>(
			`/api/notifications/${notificationId}/read`,
		);

	return response.data;
}
