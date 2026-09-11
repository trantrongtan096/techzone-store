export interface User {
  email: string;
  fullName: string;
  role: string;
}

export interface AuthResponse {
  token: string;
  email: string;
  fullName: string;
  role: string;
  message: string;
}
