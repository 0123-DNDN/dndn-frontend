export type UserRole =
  | 'senior'
  | 'guardian';

export type ApiUserRole =
  | 'SENIOR'
  | 'GUARDIAN';

export type SignupRequest = {
  name: string;
  password: string;
  role: ApiUserRole;
  phone: string;
  birthDate: string;
};

export type LoginRequest = {
  phone: string;
  password: string;
};

export type LoginResponse = {
  accessToken: string;
  userId: number;
  name: string;
  role: ApiUserRole;
};

export type UserProfileResponse = {
  userId: number;
  name: string;
  role: ApiUserRole;
  phone: string;
  birthDate: string;
};

export type ApiErrorResponse = {
  message?: string;
  error?: string;
  status?: number;
};