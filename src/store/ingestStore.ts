// src/store/ingestStore.ts
import { create } from "zustand";
import { IngestResponse } from "@/types/ingest";

type State = {
  loading: boolean;
  progressPct: number;
  lastResponse: IngestResponse | null;
};

type Actions = {
  setLoading: (b: boolean) => void;
  setProgressPct: (v: number) => void;
  setLastResponse: (r: IngestResponse | null) => void;
  reset: () => void;
};

export const useIngestStore = create<State & Actions>((set) => ({
  loading: false,
  progressPct: 0,
  lastResponse: null,
  setLoading: (b) => set({ loading: b }),
  setProgressPct: (v) => set({ progressPct: Math.max(0, Math.min(100, v)) }),
  setLastResponse: (r) => set({ lastResponse: r }),
  reset: () => set({ loading: false, progressPct: 0, lastResponse: null }),
}));
