const TOKEN_KEY = "auth_token";
const ROLE_KEY = "auth_role";
const EXP_KEY = "auth_expiration";

export const setToken = (token: string, expirationMinutes?: number) => {
  const expires = expirationMinutes ? `; expires=${new Date(new Date().getTime() + expirationMinutes * 60 * 1000).toUTCString()}` : "";
  document.cookie = `${TOKEN_KEY}=${token}; path=/${expires}`;
};

export const getToken = (): string | null => {
  const match = document.cookie.match(new RegExp("(^| )" + TOKEN_KEY + "=([^;]+)"));
  return match ? match[2] : null;
};

export const removeToken = () => {
  document.cookie = `${TOKEN_KEY}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;`;
};

export const setRole = (role: string) => {
  document.cookie = `${ROLE_KEY}=${role}; path=/;`;
};

export const getRole = (): string | null => {
  const match = document.cookie.match(new RegExp("(^| )" + ROLE_KEY + "=([^;]+)"));
  return match ? match[2] : null;
};

export const removeRole = () => {
  document.cookie = `${ROLE_KEY}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;`;
};

export const setExpiration = (expirationISO: string | null) => {
  if (!expirationISO) return removeExpiration();
  document.cookie = `${EXP_KEY}=${expirationISO}; path=/;`;
};

export const getExpiration = (): string | null => {
  const match = document.cookie.match(new RegExp("(^| )" + EXP_KEY + "=([^;]+)"));
  return match ? match[2] : null;
};

export const removeExpiration = () => {
  document.cookie = `${EXP_KEY}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;`;
};

export const setAuthCookies = (token: string, role: string, expirationISO: string) => {
  setToken(token);
  setRole(role);
  setExpiration(expirationISO);
};

export const clearAuthCookies = () => {
  removeToken();
  removeRole();
  removeExpiration();
};
