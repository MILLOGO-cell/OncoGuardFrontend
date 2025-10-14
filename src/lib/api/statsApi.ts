import { get } from "./apiClient";
import { StatsResponse } from "@/types/stats";

export const getStatsSummary = () =>
  get<StatsResponse>("/stats/summary");
