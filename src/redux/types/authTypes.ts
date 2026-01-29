// Dati ricevuti dal backend dopo login/registrazione
export interface AuthResponse {
  token: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  expiration: string;
}

// Dati inviati al backend per registrazione cliente
export interface RegisterCustomerDto {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

// Dati inviati al backend per login
export interface LoginDto {
  email: string;
  password: string;
}
