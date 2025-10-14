import { create } from "zustand";
import { FileItem } from "@/types/files";

type State = {
  loading: boolean;
  downloading: boolean;
  progressPct: number;
  items: FileItem[];
};

type Actions = {
  setLoading: (b: boolean) => void;
  setDownloading: (b: boolean) => void;
  setProgressPct: (v: number) => void;
  setItems: (r: FileItem[]) => void;
  reset: () => void;
  resetProgress: () => void;
};

export const useFilesStore = create<State & Actions>((set) => ({
  loading: false,
  downloading: false,
  progressPct: 0,
  items: [],
  setLoading: (b) => set({ loading: b }),
  setDownloading: (b) => set({ downloading: b }),
  setProgressPct: (v) => set({ progressPct: Math.max(0, Math.min(100, v)) }),
  setItems: (r) => set({ items: r }),
  reset: () => set({ loading: false, downloading: false, progressPct: 0, items: [] }),
  resetProgress: () => set({ downloading: false, progressPct: 0 }),
}));
