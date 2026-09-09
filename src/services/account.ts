import { api } from '@/services/api';

import type {
  AccountBalanceResponse,
  AccountConnectRequest,
  AccountResponse,
  AccountVerifyRequest,
  AccountVerifyResponse,
  CurrentUserResponse,
} from '@/types/account';

export type MainAccountResponse = AccountResponse;

export async function getCurrentUser(): Promise<CurrentUserResponse> {
  const response =
    await api.get<CurrentUserResponse>(
      '/api/users/me',
    );

  return response.data;
}

export async function verifyAccount(
  request: AccountVerifyRequest,
): Promise<AccountVerifyResponse> {
  const response =
    await api.post<AccountVerifyResponse>(
      '/api/accounts/verify',
      request,
    );

  return response.data;
}

export async function getAvailableAccounts(): Promise<AccountResponse[]> {
  const response =
    await api.get<AccountResponse[]>(
      '/api/accounts/available',
    );

  return response.data;
}

export async function connectAccount(
  request: AccountConnectRequest,
): Promise<AccountResponse> {
  const response =
    await api.post<AccountResponse>(
      '/api/accounts/connect',
      request,
    );

  return response.data;
}

export async function getMainAccount(): Promise<MainAccountResponse> {
  const response =
    await api.get<MainAccountResponse>(
      '/api/accounts/main',
    );

  return response.data;
}

export async function getAccountBalance(
  accountId: number,
): Promise<AccountBalanceResponse> {
  const response =
    await api.get<AccountBalanceResponse>(
      `/api/accounts/${accountId}/balance`,
    );

  return response.data;
}
