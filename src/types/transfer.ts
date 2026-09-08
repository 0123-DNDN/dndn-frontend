export type TransferStatus =
  | 'CREATED'
  | 'RECIPIENT_CONFIRMED'
  | 'AMOUNT_CONFIRMED'
  | 'FDS_CHECKING'
  | 'NORMAL'
  | 'HIGH_RISK'
  | 'WAITING_GUARDIAN'
  | 'GUARDIAN_APPROVED'
  | 'FINAL_CONFIRMED'
  | 'COMPLETED'
  | 'CANCELLED';

export type TransferResponse = {
  transactionId: number;
  senderAccountId: number;
  receiverAccountId: number | null;
  receiverBankCode: string;
  receiverAccountNumber: string;
  receiverName: string;
  amount: number;
  senderBalanceBefore: number;
  senderBalanceAfter: number | null;
  purpose: string;
  status: TransferStatus;
  createdAt: string;
  completedAt: string | null;
};