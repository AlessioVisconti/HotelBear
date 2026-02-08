export interface AuthState {
  token: string | null;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  expiration: string | null;
  loading: boolean;
  error: string | null;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface AuthResponseDto {
  token: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  expiration: string;
}
