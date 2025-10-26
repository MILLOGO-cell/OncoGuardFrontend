// hooks/useImageInference.ts
import { useCallback } from "react";
import {
  predict,
  predictBatch,
  InferenceResponse,
  predictFromServer,
} from "@/lib/api/imageInferenceApi";

type ProgressCallbacks = {
  onUploadPct?: (pct: number) => void;
  onProcessPct?: (pct: number) => void;
};

export function useImageInference() {
  /**
   * Prédiction d'un seul fichier (depuis l'ordinateur)
   */
  const predictOne = useCallback(
    async (file: File, callbacks?: ProgressCallbacks): Promise<InferenceResponse> => {
      return predict(file, callbacks);
    },
    []
  );

  /**
   * Prédiction batch de plusieurs fichiers (depuis l'ordinateur)
   */
  const predictManyBatch = useCallback(
    async (
      files: File[],
      returnAnnotated: boolean = true,
      callbacks?: ProgressCallbacks
    ): Promise<InferenceResponse[]> => {
      return predictBatch(files, returnAnnotated, callbacks);
    },
    []
  );

  /**
   * Prédiction séquentielle de plusieurs fichiers (depuis l'ordinateur)
   */
  const predictManySequential = useCallback(
    async (
      files: File[],
      returnAnnotated: boolean = true,
      callbacks?: ProgressCallbacks
    ): Promise<InferenceResponse[]> => {
      const results: InferenceResponse[] = [];
      const total = files.length;

      for (let i = 0; i < total; i++) {
        const file = files[i];
        
        // Upload progress pour ce fichier
        const onUpload = (pct: number) => {
          const globalPct = ((i + pct / 100) / total) * 100;
          callbacks?.onUploadPct?.(globalPct);
        };

        // Process progress pour ce fichier
        const onProcess = (pct: number) => {
          const globalPct = ((i + pct / 100) / total) * 100;
          callbacks?.onProcessPct?.(globalPct);
        };

        const result = await predict(file, {
          onUploadPct: onUpload,
          onProcessPct: onProcess,
        });

        results.push(result);
      }

      // Compléter les barres de progression
      callbacks?.onUploadPct?.(100);
      callbacks?.onProcessPct?.(100);

      return results;
    },
    []
  );

  /**
   * Prédiction depuis des fichiers déjà uploadés sur le serveur
   */
  const predictFromUploadedFiles = useCallback(
    async (
      kind: "dicom" | "pgm",
      filenames: string[],
      callbacks?: ProgressCallbacks
    ): Promise<InferenceResponse[]> => {
      return predictFromServer(kind, filenames, callbacks);
    },
    []
  );

  return {
    predictOne,
    predictManyBatch,
    predictManySequential,
    predictFromUploadedFiles,
  };
}