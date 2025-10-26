// lib/api/usersAdminApi.ts
import apiClient from "./apiClient";
import type { UserOut, UserCreate, UserUpdate } from "@/types/auth";

/**
 * Liste tous les utilisateurs (admin)
 */
export async function fetchAllUsers(): Promise<UserOut[]> {
  const response = await apiClient.get<UserOut[]>("/auth/users");
  return response.data;
}

/**
 * Récupère un utilisateur par ID (admin)
 */
export async function fetchUserById(userId: number): Promise<UserOut> {
  const response = await apiClient.get<UserOut>(`/auth/users/${userId}`);
  return response.data;
}

/**
 * Crée un nouvel utilisateur (admin)
 * ⚠️ NE pas utiliser pour l'auto-registration, utiliser registerUser() de authApi
 */
export async function createUserAsAdmin(payload: UserCreate): Promise<UserOut> {
  const response = await apiClient.post<UserOut>("/auth/register", payload);
  return response.data;
}

/**
 * Met à jour un utilisateur (admin)
 */
export async function updateUserAsAdmin(
  userId: number,
  payload: UserUpdate
): Promise<UserOut> {
  const response = await apiClient.put<UserOut>(`/auth/users/${userId}`, payload);
  return response.data;
}

/**
 * Supprime un utilisateur (admin)
 */
export async function deleteUserAsAdmin(userId: number): Promise<void> {
  await apiClient.delete(`/auth/users/${userId}`);
}