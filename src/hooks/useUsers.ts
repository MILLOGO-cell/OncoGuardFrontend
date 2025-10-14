// src/hooks/useUsers.ts
import { toast } from "react-toastify"
import { deleteUser, getUser, listUsers, updateUser } from "@/lib/api/authApi"
import { UserOut, UserUpdate } from "@/types/auth"
import { useUserAdminStore } from "@/store/userAdminStore"

export function useUsers() {
  const { setLoading, setItems, setSelected } = useUserAdminStore()

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const res = await listUsers()
      setItems(res)
      return res
    } catch (e: any) {
      toast.error(e?.response?.data?.detail || "Échec du chargement")
      throw e
    } finally {
      setLoading(false)
    }
  }

  const fetchUser = async (userId: number) => {
    try {
      setLoading(true)
      const res = await getUser(userId)
      setSelected(res)
      return res
    } catch (e: any) {
      toast.error(e?.response?.data?.detail || "Utilisateur introuvable")
      throw e
    } finally {
      setLoading(false)
    }
  }

  const saveUser = async (userId: number, payload: UserUpdate) => {
    try {
      setLoading(true)
      const res = await updateUser(userId, payload)
      setSelected(res as UserOut)
      toast.success("Utilisateur mis à jour")
      return res
    } catch (e: any) {
      toast.error(e?.response?.data?.detail || "Échec de la mise à jour")
      throw e
    } finally {
      setLoading(false)
    }
  }

  const removeUser = async (userId: number) => {
    try {
      setLoading(true)
      await deleteUser(userId)
      toast.success("Utilisateur supprimé")
      return true
    } catch (e: any) {
      toast.error(e?.response?.data?.detail || "Échec de la suppression")
      throw e
    } finally {
      setLoading(false)
    }
  }

  return { fetchUsers, fetchUser, saveUser, removeUser }
}
