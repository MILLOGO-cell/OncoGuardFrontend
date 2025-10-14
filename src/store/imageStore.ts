// src/store/imageStore.ts
import { create } from "zustand";
import { InferenceResponse } from "@/types/imageInference";

type Mode = "single" | "batch" | "sequential";

type State = {
  loading: boolean;
  uploadPct: number;
  processPct: number;
  mode: Mode;
  result: InferenceResponse | null;
  results: InferenceResponse[];
};

type Actions = {
  setLoading: (b: boolean) => void;
  setUploadPct: (v: number) => void;
  setProcessPct: (v: number) => void;
  setMode: (m: Mode) => void;
  setResult: (r: InferenceResponse | null) => void;
  setResults: (r: InferenceResponse[]) => void;
  reset: () => void;
};

export const useImageStore = create<State & Actions>((set) => ({
  loading: false,
  uploadPct: 0,
  processPct: 0,
  mode: "single",
  result: null,
  results: [],
  setLoading: (b) => set({ loading: b }),
  setUploadPct: (v) => set({ uploadPct: Math.max(0, Math.min(100, v)) }),
  setProcessPct: (v) => set({ processPct: Math.max(0, Math.min(100, v)) }),
  setMode: (m) => set({ mode: m }),
  setResult: (r) => set({ result: r }),
  setResults: (r) => set({ results: r }),
  reset: () =>
    set({
      loading: false,
      uploadPct: 0,
      processPct: 0,
      mode: "single",
      result: null,
      results: [],
    }),
}));
