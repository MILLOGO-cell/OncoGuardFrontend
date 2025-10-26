// store/filesStore.ts
import { create } from "zustand";
import { FileItem } from "@/types/files";

type State = {
  loading: boolean;
  uploading: boolean;
  downloading: boolean;
  progressPct: number;
  uploadProgressPct: number;
  items: FileItem[];
};

type Actions = {
  setLoading: (b: boolean) => void;
  setUploading: (b: boolean) => void;
  setDownloading: (b: boolean) => void;
  setProgressPct: (v: number) => void;
  setUploadProgressPct: (v: number) => void;
  setItems: (r: FileItem[]) => void;
  reset: () => void;
  resetProgress: () => void;
  resetUploadProgress: () => void;
};

export const useFilesStore = create<State & Actions>((set) => ({
  loading: false,
  uploading: false,
  downloading: false,
  progressPct: 0,
  uploadProgressPct: 0,
  items: [],
  
  setLoading: (b) => set({ loading: b }),
  setUploading: (b) => set({ uploading: b }),
  setDownloading: (b) => set({ downloading: b }),
  setProgressPct: (v) => set({ progressPct: Math.max(0, Math.min(100, v)) }),
  setUploadProgressPct: (v) => set({ uploadProgressPct: Math.max(0, Math.min(100, v)) }),
  setItems: (r) => set({ items: r }),
  
  reset: () => set({ 
    loading: false, 
    uploading: false,
    downloading: false, 
    progressPct: 0, 
    uploadProgressPct: 0,
    items: [] 
  }),
  
  resetProgress: () => set({ downloading: false, progressPct: 0 }),
  resetUploadProgress: () => set({ uploading: false, uploadProgressPct: 0 }),
}));