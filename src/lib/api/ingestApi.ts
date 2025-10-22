// src/lib/api/ingestApi.ts
import apiClient from "./apiClient";
import { IngestResponse } from "@/types/ingest";

export function anonymize(
  files: File[],
  opts?: { run_inference?: boolean; persist?: boolean },
  onUploadProgress?: (pct: number) => void
) {
  const fd = new FormData();
  files.forEach((f) => fd.append("files", f));
  const q = new URLSearchParams();
  if (opts?.run_inference) q.set("run_inference", "true");
  if (opts?.persist !== undefined) q.set("persist", String(opts.persist));
  const qs = q.toString();
  const url = `/ingest/anonymize${qs ? `?${qs}` : ""}`;
  return apiClient
    .post<IngestResponse>(url, fd, {
      headers: { "Content-Type": "multipart/form-data" },
      onUploadProgress: (e) => {
        if (!e.total) return;
        const pct = Math.round((e.loaded * 100) / e.total);
        onUploadProgress?.(pct);
      },
    })
    .then((r) => r.data);
}
