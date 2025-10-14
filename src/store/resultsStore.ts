// src/store/resultsStore.ts
import { create } from "zustand"
import type { ResultItem } from "@/types/results"

type State = {
  loading: boolean
  downloading: boolean
  progressPct: number
  items: ResultItem[]
  total: number
}

type Actions = {
  setLoading: (b: boolean) => void
  setDownloading: (b: boolean) => void
  setProgressPct: (n: number) => void
  setData: (items: ResultItem[], total: number) => void
  reset: () => void
}

export const useResultsStore = create<State & Actions>((set) => ({
  loading: false,
  downloading: false,
  progressPct: 0,
  items: [],
  total: 0,
  setLoading: (b) => set({ loading: b }),
  setDownloading: (b) => set({ downloading: b }),
  setProgressPct: (n) => set({ progressPct: Math.max(0, Math.min(100, n)) }),
  setData: (items, total) => set({ items, total }),
  reset: () => set({ loading: false, downloading: false, progressPct: 0, items: [], total: 0 }),
}))
