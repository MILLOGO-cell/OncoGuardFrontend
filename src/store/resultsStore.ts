// store/resultsStore.ts
import { create } from "zustand";
import type { ResultItem } from "@/types/imageInference";

interface ResultsState {
  items: ResultItem[];
  total: number;
  loading: boolean;
  downloading: boolean;
  progressPct: number;
  setLoading: (loading: boolean) => void;
  setData: (items: ResultItem[], total: number) => void;
  setDownloading: (downloading: boolean) => void;
  setProgressPct: (pct: number) => void;
}

export const useResultsStore = create<ResultsState>((set) => ({
  items: [],
  total: 0,
  loading: false,
  downloading: false,
  progressPct: 0,
  setLoading: (loading) => set({ loading }),
  setData: (items, total) => set({ items, total }),
  setDownloading: (downloading) => set({ downloading }),
  setProgressPct: (progressPct) => set({ progressPct }),
}));