export type Notification = {
	notificationId: number;
	type: NotificationType;
	title: string;
	content: string;
	relatedTransactionId: number | null;
	isRead: boolean;
	createdAt: string;
	readAt: string | null;
};

export type NotificationType =
	| 'HIGH_RISK_TRANSFER'
	| 'GUARDIAN_APPROVED'
	| 'GUARDIAN_REJECTED'
	| 'FAMILY_POST_RECEIVED'
	| 'FAMILY_CONNECTED'
	| 'WEEKLY_REPORT_READY';
