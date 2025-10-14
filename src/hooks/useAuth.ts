// src/hooks/useAuth.ts
import { toast } from "react-toastify"
import { useAuthStore } from "@/store/authStore"
import { getMe, login, registerUser } from "@/lib/api/authApi"
import { UserCreate, UserLogin } from "@/types/auth"

export function useAuth() {
  const { setLoading, setToken, setUser, reset } = useAuthStore()

   const fetchMe = async () => {
    try {
      const user = await getMe()
      setUser(user)
      return user
    } catch (e: any) {
      console.error("Erreur lors de la récupération du profil", e)
      throw e
    }
  }

  const signIn = async (payload: UserLogin) => {
    try {
      setLoading(true)
      const res = await login(payload)
      if (res?.access_token) localStorage.setItem("access_token", res.access_token)
      setToken(res?.access_token || null)
      toast.success("Connexion réussie")
      return res
    } catch (e: any) {
      toast.error(e?.response?.data?.detail || "Échec de connexion")
      throw e
    } finally {
      setLoading(false)
    }
  }

  const signOut = () => {
    localStorage.removeItem("access_token")
    reset()
    toast.success("Déconnexion effectuée")
  }

  const register = async (payload: UserCreate) => {
    try {
      setLoading(true)
      const res = await registerUser(payload)
      setUser(res)
      toast.success("Compte créé")
      return res
    } catch (e: any) {
      toast.error(e?.response?.data?.detail || "Échec de l’inscription")
      throw e
    } finally {
      setLoading(false)
    }
  }

  return { signIn, signOut, register, fetchMe  }
}
