// hooks/useUsers.ts
import { useCallback } from "react";
import { toast } from "react-toastify";
import { useUserAdminStore } from "@/store/userAdminStore";
import {
  fetchAllUsers,
  fetchUserById,
  createUserAsAdmin,
  updateUserAsAdmin,
  deleteUserAsAdmin,
} from "@/lib/api/usersAdminApi";
import type { UserCreate, UserUpdate } from "@/types/auth";

export function useUsers() {
  const { setLoading, setItems, setSelected } = useUserAdminStore();

  /**
   * Récupère la liste de tous les utilisateurs
   */
  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const users = await fetchAllUsers();
      setItems(users);
    } catch (error: any) {
      console.error("Erreur lors de la récupération des utilisateurs:", error);
      toast.error(error?.response?.data?.detail || "Erreur lors du chargement des utilisateurs");
      throw error;
    } finally {
      setLoading(false);
    }
  }, [setLoading, setItems]);

  /**
   * Récupère un utilisateur par ID
   */
  const fetchUser = useCallback(
    async (userId: number) => {
      try {
        setLoading(true);
        const user = await fetchUserById(userId);
        setSelected(user);
        return user;
      } catch (error: any) {
        console.error("Erreur lors de la récupération de l'utilisateur:", error);
        toast.error(error?.response?.data?.detail || "Utilisateur introuvable");
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [setLoading, setSelected]
  );

  /**
   * Crée un nouvel utilisateur (admin uniquement)
   * ⚠️ N'affecte PAS l'utilisateur connecté
   */
  const createUser = useCallback(
    async (payload: UserCreate) => {
      try {
        setLoading(true);
        const newUser = await createUserAsAdmin(payload);
        toast.success(`Utilisateur ${newUser.email} créé avec succès`);
        return newUser;
      } catch (error: any) {
        console.error("Erreur lors de la création de l'utilisateur:", error);
        toast.error(error?.response?.data?.detail || "Erreur lors de la création");
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [setLoading]
  );

  /**
   * Met à jour un utilisateur
   */
  const saveUser = useCallback(
    async (userId: number, payload: UserUpdate) => {
      try {
        setLoading(true);
        const updatedUser = await updateUserAsAdmin(userId, payload);
        toast.success("Utilisateur mis à jour");
        return updatedUser;
      } catch (error: any) {
        console.error("Erreur lors de la mise à jour:", error);
        toast.error(error?.response?.data?.detail || "Erreur lors de la mise à jour");
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [setLoading]
  );

  /**
   * Supprime un utilisateur
   */
  const removeUser = useCallback(
    async (userId: number) => {
      try {
        setLoading(true);
        await deleteUserAsAdmin(userId);
        toast.success("Utilisateur supprimé");
      } catch (error: any) {
        console.error("Erreur lors de la suppression:", error);
        toast.error(error?.response?.data?.detail || "Erreur lors de la suppression");
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [setLoading]
  );

  return {
    fetchUsers,
    fetchUser,
    createUser,
    saveUser,
    removeUser,
  };
}