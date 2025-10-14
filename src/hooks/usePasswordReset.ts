// src/hooks/usePasswordReset.ts
import { toast } from "react-toastify"
import {
  requestPasswordReset,
  verifyResetCode,
  resetPassword,
} from "@/lib/api/authApi"
import {
  PasswordResetRequest,
  VerifyCodePayload,
  PasswordResetConfirm,
} from "@/types/auth"
import { useAuthStore } from "@/store/authStore"

export function usePasswordReset() {
  const { setLoading } = useAuthStore()

  const requestCode = async (payload: PasswordResetRequest) => {
    try {
      setLoading(true)
      const res = await requestPasswordReset(payload)
      toast.success(res.message || "Code envoyé")
      return res
    } catch (e: any) {
      toast.error(e?.response?.data?.detail || "Échec d’envoi du code")
      throw e
    } finally {
      setLoading(false)
    }
  }

  const verifyCode = async (payload: VerifyCodePayload) => {
    try {
      setLoading(true)
      const res = await verifyResetCode(payload)
      toast.success(res.message || "Code vérifié")
      return res
    } catch (e: any) {
      toast.error(e?.response?.data?.detail || "Code invalide")
      throw e
    } finally {
      setLoading(false)
    }
  }

  const submitNewPassword = async (payload: PasswordResetConfirm) => {
    try {
      setLoading(true)
      const res = await resetPassword(payload)
      toast.success(res.message || "Mot de passe mis à jour")
      return res
    } catch (e: any) {
      toast.error(e?.response?.data?.detail || "Échec de mise à jour")
      throw e
    } finally {
      setLoading(false)
    }
  }

  return { requestCode, verifyCode, submitNewPassword }
}
