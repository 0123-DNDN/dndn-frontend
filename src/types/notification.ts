export type Notification = {
	notificationId: number;
	type: string;
	title: string;
	content: string;
	relatedTransactionId: number | null;
	isRead: boolean;
	createdAt: string;
	readAt: string | null;
};
