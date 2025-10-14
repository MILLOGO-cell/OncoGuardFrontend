// src/hooks/useImageInference.ts
import { toast } from "react-toastify";
import { useImageStore } from "@/store/imageStore";
import { predictImage, predictBatch } from "@/lib/api/imageApi";
import type { InferenceResponse } from "@/types/imageInference";

type ProgressHandlers = {
  onUploadPct?: (pct: number) => void;
  onProcessPct?: (pct: number) => void;
};

export function useImageInference() {
  const {
    setLoading,
    setResult,
    setResults,
    setUploadPct,
    setProcessPct,
    setMode,
    reset,
  } = useImageStore();

  const predictOne = async (file: File, p?: ProgressHandlers) => {
    try {
      setMode("single");
      setLoading(true);
      setUploadPct(0);
      setProcessPct(0);
      const res = await predictImage(file);
      setResult(res);
      setResults([res]);
      setUploadPct(100);
      setProcessPct(100);
      p?.onUploadPct?.(100);
      p?.onProcessPct?.(100);
      toast.success("Analyse terminée");
      return res;
    } catch (e: any) {
      toast.error(e?.response?.data?.detail || "Échec de l’analyse");
      throw e;
    } finally {
      setLoading(false);
    }
  };

  const predictManyBatch = async (
    files: File[],
    persist = true,
    p?: ProgressHandlers
  ) => {
    try {
      setMode("batch");
      setLoading(true);
      setUploadPct(0);
      setProcessPct(0);
      const res = await predictBatch(files, (pct) => {
        setUploadPct(pct);
        p?.onUploadPct?.(pct);
      }, persist);
      setResults(res);
      setResult(res[0] ?? null);
      setProcessPct(100);
      p?.onProcessPct?.(100);
      toast.success("Analyses terminées");
      return res;
    } catch (e: any) {
      toast.error(e?.response?.data?.detail || "Échec des analyses");
      throw e;
    } finally {
      setLoading(false);
    }
  };

  const predictManySequential = async (
    files: File[],
    persistEach = true,
    p?: ProgressHandlers
  ) => {
    try {
      setMode("sequential");
      setLoading(true);
      setUploadPct(0);
      setProcessPct(0);
      const out: InferenceResponse[] = [];
      for (let i = 0; i < files.length; i++) {
        const res = await predictBatch(
          [files[i]],
          (pct) => {
            setUploadPct(pct);
            p?.onUploadPct?.(pct);
          },
          persistEach
        );
        out.push(res[0]);
        const step = Math.round(((i + 1) * 100) / files.length);
        setProcessPct(step);
        p?.onProcessPct?.(step);
      }
      setResults(out);
      setResult(out[0] ?? null);
      toast.success("Analyses terminées");
      return out;
    } catch (e: any) {
      toast.error(e?.response?.data?.detail || "Échec des analyses");
      throw e;
    } finally {
      setLoading(false);
    }
  };

  return { predictOne, predictManyBatch, predictManySequential, reset };
}
