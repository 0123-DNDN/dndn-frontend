import { api } from '@/services/api';

export type Recipient = {
  aliasId: number;
  aliasName: string;
  bankCode: string;
  accountNumber: string;
  recipientName: string;
  createdAt: string;
};

export async function searchRecipients(keyword: string): Promise<Recipient[]> {
  const response = await api.get<Recipient[]>('/api/recipients/search', {
    params: { keyword },
  });
  return response.data;
}
