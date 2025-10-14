// src/lib/api/authApi.ts
import { get, post, put, del } from "./apiClient"
import {
  LoginResponse,
  UserCreate,
  UserLogin,
  PasswordResetRequest,
  VerifyCodePayload,
  PasswordResetConfirm,
  UserOut,
  UserUpdate,
} from "@/types/auth"

export const registerUser = (payload: UserCreate) =>
  post<UserOut>("/auth/register", payload)

export const login = (payload: UserLogin) =>
  post<LoginResponse>("/auth/login", payload)

export const requestPasswordReset = (payload: PasswordResetRequest) =>
  post<{ message: string }>("/auth/request-password-reset", payload)

export const verifyResetCode = (payload: VerifyCodePayload) =>
  post<{ message: string }>("/auth/verify-reset-code", payload)

export const resetPassword = (payload: PasswordResetConfirm) =>
  post<{ message: string }>("/auth/reset-password", payload)

export const getMe = () => get<UserOut>("/auth/me")

export const updateMe = (payload: UserUpdate) =>
  put<UserOut>("/auth/me", payload)

export const deleteMe = () => del<void>("/auth/me")

export const listUsers = () => get<UserOut[]>("/auth/users")

export const getUser = (userId: number) =>
  get<UserOut>(`/auth/users/${userId}`)

export const updateUser = (userId: number, payload: UserUpdate) =>
  put<UserOut>(`/auth/users/${userId}`, payload)

export const deleteUser = (userId: number) =>
  del<void>(`/auth/users/${userId}`)