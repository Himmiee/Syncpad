export interface LoginPayload {
  email: string;
  password: string;
}
export interface RegisterPayload {
  username: string;
  email: string;
  password: string;
  avatar?: string;
}

export interface AuthResponseData {
  id: number;
  username: string;
  email: string;
  avatar?: string;
  createdAt: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: AuthResponseData;
  token: string;
}
