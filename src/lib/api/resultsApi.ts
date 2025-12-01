// lib/api/resultsApi.ts
import type { ResultsResponse } from "@/types/imageInference";
import apiClient from "./apiClient";

export const listResults = async (params?: {
  limit?: number;
  order?: "asc" | "desc";
}): Promise<ResultsResponse> => {
  const qs = new URLSearchParams();
  if (params?.limit) qs.set("limit", String(params.limit));
  if (params?.order) qs.set("order", params.order);

  const queryString = qs.toString();
  const url = `/image-inference/results${queryString ? `?${queryString}` : ""}`;

  const { data } = await apiClient.get<ResultsResponse>(url);
  return data;
};

export const taggedImageUrl = (filename: string): string => {
  const baseUrl = apiClient.defaults.baseURL || "";
  return `${baseUrl}/image-inference/tagged/${encodeURIComponent(filename)}`;
};

export const downloadReportCsv = async (): Promise<Blob> => {
  const { data } = await apiClient.get("/image-inference/report.csv", {
    responseType: "blob",
  });
  return data as Blob;
};

export const downloadTaggedZip = async (): Promise<Blob> => {
  const { data } = await apiClient.get("/image-inference/export-tagged.zip", {
    responseType: "blob",
  });
  return data as Blob;
};