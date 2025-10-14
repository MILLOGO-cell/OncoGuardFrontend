// src/lib/api/resultsApi.ts
import type { ResultsResponse } from "@/types/results"
import apiClient from "./apiClient";

export const listResults = async (params?: { limit?: number; order?: "asc" | "desc" }) => {
  const qs = new URLSearchParams()
  if (params?.limit) qs.set("limit", String(params.limit))
  if (params?.order) qs.set("order", params.order)
  const { data } = await apiClient.get<ResultsResponse>(`/image-inference/results${qs.toString() ? `?${qs}` : ""}`)
  return data
}

export const taggedImageUrl = (filename: string) =>
  `${apiClient.defaults.baseURL}/image-inference/tagged/${encodeURIComponent(filename)}`

export const downloadReportCsv = async () => {
  const { data } = await apiClient.get(`/image-inference/report.csv`, { responseType: "blob" })
  return data as Blob
}

export const downloadTaggedZip = async () => {
  const { data } = await apiClient.get(`/image-inference/export-tagged.zip`, { responseType: "blob" })
  return data as Blob
}
