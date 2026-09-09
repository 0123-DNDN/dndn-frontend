import { api } from '@/services/api';

import type {
  TransferResponse,
} from '@/types/transfer';

export async function getTransfer(
  transactionId: number,
): Promise<TransferResponse> {
  const response =
    await api.get<TransferResponse>(
      `/api/transfers/${transactionId}`,
    );

  return response.data;
}

export async function guardianApproveTransfer(
  transactionId: number,
): Promise<TransferResponse> {
  const response =
    await api.post<TransferResponse>(
      `/api/transfers/${transactionId}/guardian-approve`,
    );

  return response.data;
}

export async function guardianRejectTransfer(
  transactionId: number,
): Promise<TransferResponse> {
  const response =
    await api.post<TransferResponse>(
      `/api/transfers/${transactionId}/guardian-reject`,
    );

  return response.data;
}
import type { Transfer } from '@/types/transfer';

export async function getTransfers(): Promise<Transfer[]> { return []; }

export type ApiTransferStatus =
  | 'CREATED'
  | 'RECIPIENT_CONFIRMED'
  | 'AMOUNT_CONFIRMED'
  | 'FDS_CHECKING'
  | 'NORMAL'
  | 'HIGH_RISK'
  | 'WAITING_GUARDIAN'
  | 'GUARDIAN_APPROVED'
  | 'GUARDIAN_REJECTED'
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
  status: ApiTransferStatus;
  createdAt: string;
  completedAt: string | null;
};

export type TransferFdsResponse = {
  transactionId: number;
  status: ApiTransferStatus;
  fds: {
    recommendedAction: 'PROCEED' | 'RECONFIRM' | 'WARN' | 'HOLD';
    riskLevel: 'LOW' | 'CAUTION' | 'HIGH' | 'CRITICAL';
    riskScore: number;
    reasons: string[];
  };
};

export async function createTransfer(request: {
  senderAccountId: number;
  receiverAccountId: number | null;
  receiverBankCode: string;
  receiverAccountNumber: string;
  receiverName: string;
  amount: number;
  purpose: string;
}): Promise<TransferResponse> {
  const response = await api.post<TransferResponse>('/api/transfers', request);
  return response.data;
}

async function advanceTransfer(transactionId: number, action: string) {
  const response = await api.post<TransferResponse>(
    `/api/transfers/${transactionId}/${action}`,
  );
  return response.data;
}

export const confirmTransferRecipient = (id: number) => advanceTransfer(id, 'recipient-confirm');
export const confirmTransferAmount = (id: number) => advanceTransfer(id, 'amount-confirm');
export const finalConfirmTransfer = (id: number) => advanceTransfer(id, 'final-confirm');
export const completeTransfer = (id: number) => advanceTransfer(id, 'complete');
export const cancelTransfer = (id: number) => advanceTransfer(id, 'cancel');

export async function checkTransferFds(transactionId: number): Promise<TransferFdsResponse> {
  const response = await api.post<TransferFdsResponse>(
    `/api/transfers/${transactionId}/fds-check`,
  );
  return response.data;
}
