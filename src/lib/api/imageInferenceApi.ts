// lib/api/imageInferenceApi.ts
const API_BASE = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1").replace(/\/+$/, "");

export interface InferenceResponse {
  label: string;
  birads: string;
  confidence: number;
  filename: string;
  tagged_filename?: string | null;
}

type ProgressCallbacks = {
  onUploadPct?: (pct: number) => void;
  onProcessPct?: (pct: number) => void;
};

export async function predict(
  file: File,
  callbacks?: ProgressCallbacks
): Promise<InferenceResponse> {
  const formData = new FormData();
  formData.append("file", file);

  const url = `${API_BASE}/image-inference/predict`;

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    xhr.upload.addEventListener("progress", (e) => {
      if (e.lengthComputable && callbacks?.onUploadPct) {
        const pct = Math.round((e.loaded / e.total) * 100);
        callbacks.onUploadPct(pct);
      }
    });

    xhr.addEventListener("load", () => {
      try {
        if (xhr.status >= 200 && xhr.status < 300) {
          callbacks?.onProcessPct?.(100);
          resolve(JSON.parse(xhr.responseText));
        } else {
          reject(new Error(`Prediction failed: ${xhr.status} ${xhr.statusText}`));
        }
      } catch (err) {
        reject(err);
      }
    });

    xhr.addEventListener("error", () => reject(new Error("Prediction failed")));
    xhr.addEventListener("abort", () => reject(new Error("Prediction aborted")));

    xhr.open("POST", url);
    xhr.send(formData);

    xhr.upload.addEventListener("loadend", () => {
      if (callbacks?.onProcessPct) {
        let pct = 0;
        const interval = setInterval(() => {
          pct += 10;
          if (pct >= 90) {
            clearInterval(interval);
          } else {
            callbacks.onProcessPct?.(pct);
          }
        }, 100);
      }
    });
  });
}

export async function predictBatch(
  files: File[],
  _returnAnnotated: boolean = true,
  callbacks?: ProgressCallbacks
): Promise<InferenceResponse[]> {
  const formData = new FormData();
  files.forEach((file) => formData.append("files", file));

  const url = `${API_BASE}/image-inference/predict-batch`;

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    xhr.upload.addEventListener("progress", (e) => {
      if (e.lengthComputable && callbacks?.onUploadPct) {
        const pct = Math.round((e.loaded / e.total) * 100);
        callbacks.onUploadPct(pct);
      }
    });

    xhr.addEventListener("load", () => {
      try {
        if (xhr.status >= 200 && xhr.status < 300) {
          callbacks?.onProcessPct?.(100);
          resolve(JSON.parse(xhr.responseText));
        } else {
          reject(new Error(`Batch prediction failed: ${xhr.status} ${xhr.statusText}`));
        }
      } catch (err) {
        reject(err);
      }
    });

    xhr.addEventListener("error", () => reject(new Error("Batch prediction failed")));
    xhr.addEventListener("abort", () => reject(new Error("Batch prediction aborted")));

    xhr.open("POST", url);
    xhr.send(formData);
  });
}

export async function predictFromServer(
  kind: "dicom" | "pgm",
  filenames: string[],
  callbacks?: ProgressCallbacks
): Promise<InferenceResponse[]> {
  const url = `${API_BASE}/image-inference/predict-from-uploaded`;

  try {
    callbacks?.onProcessPct?.(10);

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ kind, filenames }),
    });

    callbacks?.onProcessPct?.(50);

    if (!response.ok) {
      const txt = await response.text().catch(() => "");
      throw new Error(`Server prediction failed: ${response.status} ${response.statusText} ${txt}`);
    }

    const results = (await response.json()) as InferenceResponse[];
    callbacks?.onProcessPct?.(100);
    return results;
  } catch (error) {
    callbacks?.onProcessPct?.(0);
    throw error;
  }
}
