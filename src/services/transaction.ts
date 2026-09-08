import { api } from '@/services/api';

import type { TransactionResponse } from '@/types/transaction';

export async function getTransactions(): Promise<
  TransactionResponse[]
> {
  const response =
    await api.get<TransactionResponse[]>(
      '/api/transactions',
    );

  return response.data;
}

export async function getTransaction(
  transactionId: number,
): Promise<TransactionResponse> {
  const response =
    await api.get<TransactionResponse>(
      `/api/transactions/${transactionId}`,
    );

  return response.data;
}