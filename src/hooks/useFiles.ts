import { toast } from "react-toastify";
import { useFilesStore } from "@/store/filesStore";
import { exportZipAll, exportZipSelected, listFiles } from "@/lib/api/filesApi";

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

export function useFiles() {
  const { setLoading, setItems, setDownloading, setProgressPct, resetProgress } = useFilesStore();

  const fetchList = async (params?: { kind?: "png" | "dicom"; q?: string; limit?: number; order?: "asc" | "desc" }) => {
    try {
      setLoading(true);
      const res = await listFiles(params);
      setItems(res);
      return res;
    } catch (e: any) {
      toast.error(e?.response?.data?.detail || "Échec du listing");
      throw e;
    } finally {
      setLoading(false);
    }
  };

  const downloadAllZip = async (kind: "png" | "dicom" = "png") => {
    try {
      setDownloading(true);
      setProgressPct(0);
      const blob = await exportZipAll(kind, (pct) => setProgressPct(pct));
      saveBlob(blob, `export_${kind}.zip`);
      setProgressPct(100);
      toast.success("Export ZIP prêt");
    } catch (e: any) {
      toast.error(e?.response?.data?.detail || "Échec de l’export ZIP");
      throw e;
    } finally {
      setTimeout(() => resetProgress(), 400);
    }
  };

  const downloadSelectedZip = async (kind: "png" | "dicom", filenames: string[]) => {
    try {
      setDownloading(true);
      setProgressPct(0);
      const blob = await exportZipSelected(kind, filenames, (pct) => setProgressPct(pct));
      saveBlob(blob, `export_${kind}_selection.zip`);
      setProgressPct(100);
      toast.success("Export ZIP sélection prêt");
    } catch (e: any) {
      toast.error(e?.response?.data?.detail || "Échec de l’export sélection");
      throw e;
    } finally {
      setTimeout(() => resetProgress(), 400);
    }
  };

  return { fetchList, downloadAllZip, downloadSelectedZip };
}
