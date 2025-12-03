import type { ResultsResponse } from "@/types/imageInference";
import apiClient from "./apiClient";
import type { FileItem } from "@/types/files";

export const listResults = async (params?: {
  limit?: number;
  order?: "asc" | "desc";
}): Promise<ResultsResponse> => {
  const qs = new URLSearchParams();
  if (params?.limit) qs.set("limit", String(params.limit));
  if (params?.order) qs.set("order", params.order);
  qs.set("kind", "tagged");

  const queryString = qs.toString();
  const url = `/ingest/files${queryString ? `?${queryString}` : ""}`;

  const { data } = await apiClient.get<FileItem[]>(url);
  
  const items = data.map((file, index) => {
    const base = file.filename.replace(/__tag\.png$/, "");
    
    return {
      id: index + 1,
      filename: file.filename,
      label: null,
      birads: null,
      confidence: null,
      tagged_filename: file.filename,
      submitted_at: new Date(file.created_at * 1000).toISOString(),
    };
  });

  return {
    items,
    total: items.length,
  };
};

export const taggedImageUrl = (filename: string): string => {
  const baseUrl = apiClient.defaults.baseURL || "";
  return `${baseUrl}/ingest/preview/tagged/${encodeURIComponent(filename)}`;
};

export const downloadReportCsv = async (): Promise<Blob> => {
  const { data } = await apiClient.get("/image-inference/report.csv", {
    responseType: "blob",
  });
  return data as Blob;
};

export const downloadTaggedZip = async (): Promise<Blob> => {
  const params = new URLSearchParams();
  params.set("kind", "tagged");
  params.set("all_files", "true");

  const { data } = await apiClient.post(`/ingest/export/zip?${params.toString()}`, null, {
    responseType: "blob",
  });
  return data as Blob;
};