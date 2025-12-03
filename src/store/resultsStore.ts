// store/resultsStore.ts
import { create } from "zustand";
import type { ResultItem } from "@/types/imageInference";

interface ResultsState {
  items: ResultItem[];
  total: number;
  loading: boolean;
  downloading: boolean;
  progressPct: number;
  selectedIds: Set<number>;
  setLoading: (loading: boolean) => void;
  setData: (items: ResultItem[], total: number) => void;
  setDownloading: (downloading: boolean) => void;
  setProgressPct: (pct: number) => void;
  toggleSelection: (id: number) => void;
  selectAll: (ids: number[]) => void;
  clearSelection: () => void;
  removeItems: (ids: number[]) => void;
}

export const useResultsStore = create<ResultsState>((set) => ({
  items: [],
  total: 0,
  loading: false,
  downloading: false,
  progressPct: 0,
  selectedIds: new Set(),
  
  setLoading: (loading) => set({ loading }),
  setData: (items, total) => set({ items, total }),
  setDownloading: (downloading) => set({ downloading }),
  setProgressPct: (progressPct) => set({ progressPct }),
  
  toggleSelection: (id) => set((state) => {
    const newSet = new Set(state.selectedIds);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    return { selectedIds: newSet };
  }),
  
  selectAll: (ids) => set({ selectedIds: new Set(ids) }),
  
  clearSelection: () => set({ selectedIds: new Set() }),
  
  removeItems: (ids) => set((state) => ({
    items: state.items.filter((item) => !ids.includes(Number(item.id))),
    total: state.total - ids.length,
    selectedIds: new Set(),
  })),
}));