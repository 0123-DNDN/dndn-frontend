export type AccountStatus =
  | 'ACTIVE'
  | 'BLOCKED'
  | 'INACTIVE';

export type AccountVerifyRequest = {
  bankCode: string;
  accountNumber: string;
  accountHolder: string;
  birthDate: string;
};

export type AccountVerifyResponse = {
  verified: boolean;
  message: string;
};

export type AccountConnectRequest = {
  accountId: number;
};

export type AccountResponse = {
  accountId: number;
  bankCode: string;
  accountNumber: string;
  accountName: string;
  balance: number;
  isPrimary: boolean;
  status: AccountStatus;
};

export type AccountBalanceResponse = {
  accountId: number;
  balance: number;
};

export type CurrentUserResponse = {
  userId: number;
  name: string;
  role: 'SENIOR' | 'GUARDIAN';
  phone: string;
  birthDate: string;
};