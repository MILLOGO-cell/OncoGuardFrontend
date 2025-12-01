const API_BASE = "https://vcgckw80k8gc0c88osk0kk4w.37.27.42.12.sslip.io/api/v1";

import type {
  InferenceResponse,
  ProgressCallbacks,
  ModelInfoResponse,
  PredictPayload,
} from "@/types/imageInference";

export async function getModelInfo(): Promise<ModelInfoResponse> {
  const url = `${API_BASE}/image-inference/model-info`;
  const response = await fetch(url, { method: "GET" });
  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(
      `Failed to fetch model info: ${response.status} ${response.statusText} ${text}`
    );
  }
  return await response.json();
}

export async function predict(
  file: File,
  payload?: PredictPayload,
  callbacks?: ProgressCallbacks
): Promise<InferenceResponse> {
  const formData = new FormData();
  formData.append("file", file);
  if (payload?.patient_id) {
    formData.append("patient_id", payload.patient_id.toString());
  }

  const url = `${API_BASE}/image-analysis/predict`;

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    xhr.upload.addEventListener("progress", (e) => {
      if (e.lengthComputable && callbacks?.onUploadPct) {
        const pct = Math.round((e.loaded / e.total) * 100);
        callbacks.onUploadPct(pct);
      }
    });

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

    xhr.addEventListener("load", () => {
      try {
        if (xhr.status >= 200 && xhr.status < 300) {
          callbacks?.onProcessPct?.(100);
          resolve(JSON.parse(xhr.responseText));
        } else {
          reject(
            new Error(
              `Prediction failed: ${xhr.status} ${xhr.statusText}`
            )
          );
        }
      } catch (err) {
        reject(err);
      }
    });

    xhr.addEventListener("error", () =>
      reject(new Error("Network error during prediction"))
    );
    xhr.addEventListener("abort", () =>
      reject(new Error("Prediction aborted"))
    );

    xhr.timeout = 300000;
    xhr.addEventListener("timeout", () =>
      reject(new Error("Prediction timeout (5min)"))
    );

    xhr.open("POST", url);
    xhr.send(formData);
  });
}