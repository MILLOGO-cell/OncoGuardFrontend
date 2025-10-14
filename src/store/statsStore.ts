import { create } from "zustand";
import { StatsResponse } from "@/types/stats";

type State = {
  loading: boolean;
  data: StatsResponse | null;
};

type Actions = {
  setLoading: (b: boolean) => void;
  setData: (r: StatsResponse | null) => void;
  reset: () => void;
};

export const useStatsStore = create<State & Actions>((set) => ({
  loading: false,
  data: null,
  setLoading: (b) => set({ loading: b }),
  setData: (r) => set({ data: r }),
  reset: () => set({ loading: false, data: null }),
}));
