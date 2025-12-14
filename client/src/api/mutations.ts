import { useMutation } from "@tanstack/vue-query";
import type {
  LoginPayload,
  RegisterPayload,
  AuthResponse,
} from "../interface/auth.interface";
import api from "@/lib/axios";
import type { AxiosError } from "axios";

interface ApiError {
  success: false;
  error: string | Array<any>;
}

export const useLogin = () =>
  useMutation<AuthResponse, AxiosError<ApiError>, LoginPayload>({
    mutationFn: async (payload: LoginPayload) => {
      const { data } = await api.post<AuthResponse>("/users/login", payload);
      // Save token on login
      localStorage.setItem("access_token", data.token);
      return data;
    },
  });

export const useRegister = () =>
  useMutation<AuthResponse, AxiosError<ApiError>, RegisterPayload>({
    mutationFn: async (payload: RegisterPayload) => {
      const { data } = await api.post<AuthResponse>("/users/register", payload);
      return data;
    },
  });
