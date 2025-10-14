import apiClient, { post } from "./apiClient";
import { InferenceResponse } from "@/types/imageInference";

export const predictImage = (file: File) => {
  const form = new FormData();
  form.append("file", file);
  return post<InferenceResponse>("/image-inference/predict", form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

export async function predictBatch(
  files: File[],
  onUploadProgress?: (pct: number) => void,
  persist: boolean = true
): Promise<InferenceResponse[]> {
  const fd = new FormData();
  files.forEach((f) => fd.append("files", f));
  const { data } = await apiClient.post(`/image-inference/predict-batch?persist=${persist}`, fd, {
    headers: { "Content-Type": "multipart/form-data" },
    onUploadProgress: (e) => {
      if (!e.total) return;
      const pct = Math.round((e.loaded * 100) / e.total);
      onUploadProgress?.(pct);
    },
  });
  return data;
}