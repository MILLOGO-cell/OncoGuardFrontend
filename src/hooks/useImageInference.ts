// hooks/useImageInference.ts
import { useCallback } from "react";
import {
  predict,
  getModelInfo,
} from "@/lib/api/imageInferenceApi";
import type {
  InferenceResponse,
  ModelInfoResponse,
  ProgressCallbacks,
  PredictPayload,
} from "@/types/imageInference";

export function useImageInference() {
  const fetchModelInfo = useCallback(async (): Promise<ModelInfoResponse> => {
    return getModelInfo();
  }, []);

  const predictOne = useCallback(
    async (
      file: File,
      payload?: PredictPayload,
      callbacks?: ProgressCallbacks
    ): Promise<InferenceResponse> => {
      return predict(file, payload, callbacks);
    },
    []
  );

  const predictManySequential = useCallback(
    async (
      files: File[],
      payload?: PredictPayload,
      callbacks?: ProgressCallbacks
    ): Promise<InferenceResponse[]> => {
      const results: InferenceResponse[] = [];
      const total = files.length;

      for (let i = 0; i < total; i++) {
        const file = files[i];

        const fileStartPct = (i / total) * 100;
        const fileEndPct = ((i + 1) / total) * 100;
        const fileRangePct = fileEndPct - fileStartPct;

        const onUpload = (pct: number) => {
          const globalPct = fileStartPct + (pct / 100) * (fileRangePct * 0.5);
          callbacks?.onUploadPct?.(globalPct);
        };

        const onProcess = (pct: number) => {
          const globalPct =
            fileStartPct + fileRangePct * 0.5 + (pct / 100) * (fileRangePct * 0.5);
          callbacks?.onProcessPct?.(globalPct);
        };

        try {
          const result = await predict(file, payload, {
            onUploadPct: onUpload,
            onProcessPct: onProcess,
          });
          results.push(result);
        } catch (error) {
          console.error(`Erreur prédiction fichier ${i + 1}/${total}:`, error);
        }
      }

      callbacks?.onUploadPct?.(100);
      callbacks?.onProcessPct?.(100);

      return results;
    },
    []
  );

  return {
    fetchModelInfo,
    predictOne,
    predictManySequential,
  };
}