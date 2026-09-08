import { api } from '@/services/api';

import type {
  UserProfileResponse,
} from '@/types/user';

export async function getMyProfile(): Promise<UserProfileResponse> {
  const response =
    await api.get<UserProfileResponse>(
      '/api/users/me',
    );

  return response.data;
}