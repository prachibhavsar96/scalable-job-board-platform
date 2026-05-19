import api from "./client";
import type { AuthResponse, LoginInput, RegisterInput } from "../types";

export async function loginUser(data: LoginInput) {
  const response = await api.post<AuthResponse>("/api/auth/login", data);

  return response.data;
}

export async function registerUser(data: RegisterInput) {
  const response = await api.post<AuthResponse>("/api/auth/register", data);

  return response.data;
}
