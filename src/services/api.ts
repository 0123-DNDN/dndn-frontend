import axios from 'axios';

import { getAccessToken } from '@/services/token';

export const api = axios.create({
  baseURL:
    process.env.EXPO_PUBLIC_API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  async (config) => {
    const token =
      await getAccessToken();

    if (token) {
      config.headers.set(
        'Authorization',
        `Bearer ${token}`,
      );
    }

    return config;
  },
);