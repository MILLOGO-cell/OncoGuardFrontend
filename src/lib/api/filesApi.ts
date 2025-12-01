// lib/api/filesApi.ts
import { FileItem } from "@/types/files";

const API_BASE = "https://vcgckw80k8gc0c88osk0kk4w.37.27.42.12.sslip.io/api/v1";

export type FileKind = "dicom" | "pgm";

export function downloadFileUrl(kind: FileKind, filename: string): string {
  return `${API_BASE}/ingest/download/${kind}/${filename}`;
}

export function getPreviewUrl(kind: FileKind, filename: string): string {
  return `${API_BASE}/ingest/preview/${kind}/${filename}`;
}

export async function fetchFileList(params: {
  kind?: FileKind;
  q?: string;
  limit?: number;
  order?: "asc" | "desc";
}): Promise<FileItem[]> {
  const searchParams = new URLSearchParams();
  
  if (params.kind) searchParams.append("kind", params.kind);
  if (params.q) searchParams.append("q", params.q);
  if (params.limit) searchParams.append("limit", params.limit.toString());
  if (params.order) searchParams.append("order", params.order);

  const url = `${API_BASE}/ingest/files?${searchParams.toString()}`;
  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch files: ${response.statusText}`);
  }
  
  return response.json();
}

export async function uploadFile(
  kind: FileKind,
  file: File,
  onProgress?: (pct: number) => void
): Promise<FileItem> {
  const formData = new FormData();
  formData.append("file", file);

  const url = `${API_BASE}/ingest/upload?kind=${kind}`;
  
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    
    xhr.upload.addEventListener("progress", (e) => {
      if (e.lengthComputable && onProgress) {
        const pct = Math.round((e.loaded / e.total) * 100);
        onProgress(pct);
      }
    });

    xhr.addEventListener("load", () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(JSON.parse(xhr.responseText));
      } else {
        reject(new Error(`Upload failed: ${xhr.statusText}`));
      }
    });

    xhr.addEventListener("error", () => reject(new Error("Upload failed")));
    xhr.addEventListener("abort", () => reject(new Error("Upload aborted")));

    xhr.open("POST", url);
    xhr.send(formData);
  });
}

export async function uploadFilesBatch(
  kind: FileKind,
  files: File[],
  onProgress?: (pct: number) => void
): Promise<FileItem[]> {
  const formData = new FormData();
  files.forEach((file) => formData.append("files", file));

  const url = `${API_BASE}/ingest/upload-batch?kind=${kind}`;
  
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    
    xhr.upload.addEventListener("progress", (e) => {
      if (e.lengthComputable && onProgress) {
        const pct = Math.round((e.loaded / e.total) * 100);
        onProgress(pct);
      }
    });

    xhr.addEventListener("load", () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(JSON.parse(xhr.responseText));
      } else {
        reject(new Error(`Upload failed: ${xhr.statusText}`));
      }
    });

    xhr.addEventListener("error", () => reject(new Error("Upload failed")));
    xhr.addEventListener("abort", () => reject(new Error("Upload aborted")));

    xhr.open("POST", url);
    xhr.send(formData);
  });
}

export async function deleteFile(kind: FileKind, filename: string): Promise<void> {
  const url = `${API_BASE}/ingest/delete/${kind}/${filename}`;
  const response = await fetch(url, { method: "DELETE" });
  
  if (!response.ok) {
    throw new Error(`Failed to delete file: ${response.statusText}`);
  }
}

export async function downloadSelectedZip(
  kind: FileKind,
  filenames: string[]
): Promise<Blob> {
  const params = new URLSearchParams();
  params.append("kind", kind);
  filenames.forEach(name => params.append("filenames", name));

  const url = `${API_BASE}/ingest/export/zip?${params.toString()}`;
  const response = await fetch(url, { method: "POST" });
  
  if (!response.ok) {
    throw new Error(`Failed to download ZIP: ${response.statusText}`);
  }
  
  return response.blob();
}

export async function downloadAllZip(kind: FileKind): Promise<Blob> {
  const params = new URLSearchParams();
  params.append("kind", kind);
  params.append("all_files", "true");

  const url = `${API_BASE}/ingest/export/zip?${params.toString()}`;
  const response = await fetch(url, { method: "POST" });
  
  if (!response.ok) {
    throw new Error(`Failed to download ZIP: ${response.statusText}`);
  }
  
  return response.blob();
}

export function triggerBlobDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}