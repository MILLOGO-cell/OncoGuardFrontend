import apiClient, { get } from "./apiClient";
import { FileItem } from "@/types/files";

export const listFiles = (params?: {
  kind?: "png" | "dicom";
  q?: string;
  limit?: number;
  order?: "asc" | "desc";
}) => {
  const query = new URLSearchParams();
  if (params?.kind) query.set("kind", params.kind);
  if (params?.q) query.set("q", params.q);
  if (params?.limit) query.set("limit", String(params.limit));
  if (params?.order) query.set("order", params.order);
  const qs = query.toString() ? `?${query.toString()}` : "";
  return get<FileItem[]>(`/ingest/files${qs}`);
};

export const downloadFileUrl = (kind: "png" | "dicom", filename: string) =>
  `${apiClient.defaults.baseURL}/ingest/download/${kind}/${encodeURIComponent(filename)}`;

export const exportZipAll = async (
  kind: "png" | "dicom" = "png",
  onProgress?: (pct: number) => void
) => {
  const { data } = await apiClient.post<Blob>(
    `/ingest/export/zip?kind=${kind}&all_files=true`,
    null,
    {
      responseType: "blob",
      onDownloadProgress: (e) => {
        if (!e.total) return;
        const pct = Math.round((e.loaded * 100) / e.total);
        onProgress?.(pct);
      },
    }
  );
  return data;
};

export const exportZipSelected = async (
  kind: "png" | "dicom",
  filenames: string[],
  onProgress?: (pct: number) => void
) => {
  const qs = new URLSearchParams();
  qs.set("kind", kind);
  filenames.forEach((n) => qs.append("filenames", n));
  const { data } = await apiClient.post<Blob>(
    `/ingest/export/zip?${qs.toString()}`,
    null,
    {
      responseType: "blob",
      onDownloadProgress: (e) => {
        if (!e.total) return;
        const pct = Math.round((e.loaded * 100) / e.total);
        onProgress?.(pct);
      },
    }
  );
  return data;
};
