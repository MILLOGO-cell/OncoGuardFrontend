// hooks/useResults.ts
import { useCallback } from "react";
import { toast } from "react-toastify";
import { useResultsStore } from "@/store/resultsStore";
import {
  listResults,
  downloadReportCsv,
  downloadTaggedZip,
  deleteResultsBatch,
} from "@/lib/api/resultsApi";
import type { ResultsResponse } from "@/types/imageInference";

function saveBlob(data: Blob, filename: string): void {
  const url = window.URL.createObjectURL(data);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
}

export function useResults() {
  const { setLoading, setData, setDownloading, setProgressPct, removeItems } =
    useResultsStore();

  const fetchAll = useCallback(
    async (params?: {
      limit?: number;
      order?: "asc" | "desc";
    }): Promise<ResultsResponse> => {
      try {
        setLoading(true);
        const res = await listResults(params);
        setData(res.items, res.total);
        toast.success(`${res.total} résultats chargés`);
        return res;
      } catch (e: any) {
        const message =
          e?.response?.data?.detail || "Échec du chargement des résultats";
        toast.error(message);
        throw e;
      } finally {
        setLoading(false);
      }
    },
    [setLoading, setData]
  );

  const deleteSelected = useCallback(
    async (
      items: Array<{ id: number; tagged_filename: string | null }>
    ): Promise<void> => {
      try {
        setLoading(true);
        const result = await deleteResultsBatch(items);
        
        removeItems(items.map((item) => item.id));
        
        if (result.failed.length > 0) {
          toast.warning(
            `${result.total_deleted} supprimés, ${result.failed.length} échecs`
          );
        } else {
          toast.success(`${result.total_deleted} fichiers supprimés`);
        }
      } catch (e: any) {
        const message =
          e?.response?.data?.detail || "Échec de la suppression";
        toast.error(message);
        throw e;
      } finally {
        setLoading(false);
      }
    },
    [setLoading, removeItems]
  );

  const exportCsv = useCallback(async (): Promise<void> => {
    try {
      setDownloading(true);
      setProgressPct(25);
      const blob = await downloadReportCsv();
      setProgressPct(90);
      saveBlob(blob, "mammography_report.csv");
      setProgressPct(100);
      toast.success("Rapport CSV téléchargé avec succès");
    } catch (e: any) {
      const message = e?.response?.data?.detail || "Échec de l'export CSV";
      toast.error(message);
      throw e;
    } finally {
      setDownloading(false);
      setProgressPct(0);
    }
  }, [setDownloading, setProgressPct]);

  const exportTaggedZip = useCallback(async (): Promise<void> => {
    try {
      setDownloading(true);
      setProgressPct(25);
      const blob = await downloadTaggedZip();
      setProgressPct(90);
      const timestamp = new Date().toISOString().slice(0, 10);
      saveBlob(blob, `tagged_images_${timestamp}.zip`);
      setProgressPct(100);
      toast.success("Archive ZIP téléchargée avec succès");
    } catch (e: any) {
      const message = e?.response?.data?.detail || "Échec de l'export ZIP";
      toast.error(message);
      throw e;
    } finally {
      setDownloading(false);
      setProgressPct(0);
    }
  }, [setDownloading, setProgressPct]);

  return {
    fetchAll,
    deleteSelected,
    exportCsv,
    exportTaggedZip,
  };
}