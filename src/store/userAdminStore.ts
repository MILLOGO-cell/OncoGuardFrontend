// src/store/userAdminStore.ts
import { create } from "zustand"
import { UserOut } from "@/types/auth"

type State = {
  loading: boolean
  items: UserOut[]
  selected: UserOut | null
}

type Actions = {
  setLoading: (b: boolean) => void
  setItems: (u: UserOut[]) => void
  setSelected: (u: UserOut | null) => void
  reset: () => void
}

export const useUserAdminStore = create<State & Actions>((set) => ({
  loading: false,
  items: [],
  selected: null,
  setLoading: (b) => set({ loading: b }),
  setItems: (u) => set({ items: u }),
  setSelected: (u) => set({ selected: u }),
  reset: () => set({ loading: false, items: [], selected: null }),
}))
