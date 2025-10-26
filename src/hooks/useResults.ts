import { useCallback } from "react";
import { toast } from "react-toastify";
import { useResultsStore } from "@/store/resultsStore";
import { listResults, downloadReportCsv, downloadTaggedZip } from "@/lib/api/resultsApi";

function saveBlob(data: Blob, filename: string) {
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
  const { setLoading, setData, setDownloading, setProgressPct } = useResultsStore();

  const fetchAll = useCallback(async (params?: { limit?: number; order?: "asc" | "desc" }) => {
    try {
      setLoading(true);
      const res = await listResults(params);
      setData(res.items, res.total);
      return res;
    } catch (e: any) {
      toast.error(e?.response?.data?.detail || "Échec du chargement");
      throw e;
    } finally {
      setLoading(false);
    }
  }, [setLoading, setData]);

  const exportCsv = useCallback(async () => {
    try {
      setDownloading(true);
      setProgressPct(25);
      const blob = await downloadReportCsv();
      setProgressPct(90);
      saveBlob(blob, "report.csv");
      setProgressPct(100);
      toast.success("Rapport CSV prêt");
    } catch (e: any) {
      toast.error(e?.response?.data?.detail || "Échec de l’export CSV");
      throw e;
    } finally {
      setDownloading(false);
      setProgressPct(0);
    }
  }, [setDownloading, setProgressPct]);

  const exportTaggedZip = useCallback(async () => {
    try {
      setDownloading(true);
      setProgressPct(25);
      const blob = await downloadTaggedZip();
      setProgressPct(90);
      saveBlob(blob, "tagged_images.zip");
      setProgressPct(100);
      toast.success("Export ZIP prêt");
    } catch (e: any) {
      toast.error(e?.response?.data?.detail || "Échec de l’export ZIP");
      throw e;
    } finally {
      setDownloading(false);
      setProgressPct(0);
    }
  }, [setDownloading, setProgressPct]);

  return { fetchAll, exportCsv, exportTaggedZip };
}
