export type UserRole = 'senior' | 'guardian';

export type ApiUserRole = 'SENIOR' | 'GUARDIAN';

export type User = {
  id: string;
  name: string;
  role: UserRole;
};

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

export type ApiErrorResponse = {
  status: number;
  message: string;
};