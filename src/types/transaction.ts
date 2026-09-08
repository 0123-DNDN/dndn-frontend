export type TransactionStatus =
  | 'CREATED'
  | 'RECIPIENT_CONFIRMED'
  | 'AMOUNT_CONFIRMED'
  | 'NORMAL'
  | 'HIGH_RISK'
  | 'WAITING_GUARDIAN'
  | 'FINAL_CONFIRMED'
  | 'GUARDIAN_APPROVED'
  | 'CANCELLED'
  | 'COMPLETED';

export type RiskLevel =
  | 'LOW'
  | 'CAUTION'
  | 'HIGH'
  | 'CRITICAL';

export type TransactionResponse = {
  transactionId: number;
  receiverBankCode: string;
  receiverAccountNumber: string;
  receiverName: string;
  amount: number;
  status: TransactionStatus;
  riskLevel: RiskLevel | null;
  purpose: string | null;
  createdAt: string;
  completedAt: string | null;
};