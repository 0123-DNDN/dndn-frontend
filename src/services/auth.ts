import axios from 'axios';

import { api } from '@/services/api';
import { saveAccessToken } from '@/services/token';
import type {
  ApiErrorResponse,
  LoginRequest,
  LoginResponse,
  SignupRequest,
  User,
} from '@/types/user';

export async function getCurrentUser(): Promise<User> {
  const response =
    await api.get<User>('/api/users/me');

  return response.data;
}

export async function signup(
  request: SignupRequest,
): Promise<void> {
  await api.post(
    '/api/auth/signup',
    request,
  );
}

export async function login(
  request: LoginRequest,
): Promise<LoginResponse> {
  const response =
    await api.post<LoginResponse>(
      '/api/auth/login',
      request,
    );

  return response.data;
}

export async function loginAndSaveToken(
  request: LoginRequest,
): Promise<LoginResponse> {
  const response = await login(request);

  await saveAccessToken(
    response.accessToken,
  );

  return response;
}

export function getApiErrorMessage(
  error: unknown,
  fallbackMessage: string,
): string {
  if (axios.isAxiosError<ApiErrorResponse>(error)) {
    console.log('===== API ERROR =====');
    console.log('message:', error.message);
    console.log('code:', error.code);
    console.log('status:', error.response?.status);
    console.log('data:', error.response?.data);
    console.log('url:', error.config?.baseURL, error.config?.url);
    console.log('=====================');

    if (error.response?.data?.message) {
      return error.response.data.message;
    }

    if (error.code === 'ERR_NETWORK') {
      return '서버에 연결할 수 없어요. 백엔드 주소와 네트워크를 확인해 주세요.';
    }
  }

  console.log('UNKNOWN ERROR:', error);

  return fallbackMessage;
}

// export async function getCurrentUser(): Promise<User | null> {
//   return null;
// }