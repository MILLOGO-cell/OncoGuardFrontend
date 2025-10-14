// src/store/authStore.ts
import { create } from "zustand"
import { LoginResponse, UserOut } from "@/types/auth"

type State = {
  loading: boolean
  token: string | null
  user: UserOut | null
}

type Actions = {
  setLoading: (b: boolean) => void
  setToken: (t: string | null) => void
  setUser: (u: UserOut | null) => void
  reset: () => void
}

export const useAuthStore = create<State & Actions>((set) => ({
  loading: false,
  token: typeof window !== "undefined" ? localStorage.getItem("access_token") : null,
  user: null,
  setLoading: (b) => set({ loading: b }),
  setToken: (t) => set({ token: t }),
  setUser: (u) => set({ user: u }),
  reset: () => set({ loading: false, token: null, user: null }),
}))
