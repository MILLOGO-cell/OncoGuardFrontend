// hooks/useFiles.ts
import { useCallback } from "react";
import { useFilesStore } from "@/store/filesStore";
import {
  fetchFileList,
  uploadFile,
  uploadFilesBatch,
  deleteFile,
  downloadAllZip,
  downloadSelectedZip,
  triggerBlobDownload,
  FileKind,
} from "@/lib/api/filesApi";

export function useFiles() {
  const { 
    setLoading, 
    setUploading,
    setDownloading, 
    setProgressPct, 
    setUploadProgressPct,
    setItems, 
    resetProgress,
    resetUploadProgress,
  } = useFilesStore();

  const fetchList = useCallback(
    async (params: {
      kind?: FileKind;
      q?: string;
      limit?: number;
      order?: "asc" | "desc";
    }) => {
      setLoading(true);
      try {
        const files = await fetchFileList(params);
        setItems(files);
      } catch (error) {
        console.error("Error fetching files:", error);
        setItems([]);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [setLoading, setItems]
  );

  const uploadSingle = useCallback(
    async (kind: FileKind, file: File) => {
      setUploading(true);
      setUploadProgressPct(0);
      
      try {
        await uploadFile(kind, file, (pct) => setUploadProgressPct(pct));
        setUploadProgressPct(100);
        
        // Refresh la liste après upload
        await fetchList({ kind, limit: 500, order: "desc" });
        
        setTimeout(() => resetUploadProgress(), 1000);
      } catch (error) {
        console.error("Error uploading file:", error);
        resetUploadProgress();
        throw error;
      }
    },
    [setUploading, setUploadProgressPct, resetUploadProgress, fetchList]
  );

  const uploadMultiple = useCallback(
    async (kind: FileKind, files: File[]) => {
      setUploading(true);
      setUploadProgressPct(0);
      
      try {
        await uploadFilesBatch(kind, files, (pct) => setUploadProgressPct(pct));
        setUploadProgressPct(100);
        
        // Refresh la liste après upload
        await fetchList({ kind, limit: 500, order: "desc" });
        
        setTimeout(() => resetUploadProgress(), 1000);
      } catch (error) {
        console.error("Error uploading files:", error);
        resetUploadProgress();
        throw error;
      }
    },
    [setUploading, setUploadProgressPct, resetUploadProgress, fetchList]
  );

  const removeFile = useCallback(
    async (kind: FileKind, filename: string) => {
      try {
        await deleteFile(kind, filename);
        // Refresh la liste après suppression
        await fetchList({ kind, limit: 500, order: "desc" });
      } catch (error) {
        console.error("Error deleting file:", error);
        throw error;
      }
    },
    [fetchList]
  );

  const downloadAll = useCallback(
    async (kind: FileKind) => {
      setDownloading(true);
      setProgressPct(10);
      
      try {
        setProgressPct(30);
        const blob = await downloadAllZip(kind);
        
        setProgressPct(80);
        const timestamp = new Date().toISOString().slice(0, 10);
        const filename = `export_${kind}_all_${timestamp}.zip`;
        
        triggerBlobDownload(blob, filename);
        setProgressPct(100);
        
        setTimeout(() => resetProgress(), 1000);
      } catch (error) {
        console.error("Error downloading ZIP:", error);
        resetProgress();
        throw error;
      }
    },
    [setDownloading, setProgressPct, resetProgress]
  );

  const downloadSelected = useCallback(
    async (kind: FileKind, filenames: string[]) => {
      if (!filenames.length) {
        throw new Error("No files selected");
      }

      setDownloading(true);
      setProgressPct(10);
      
      try {
        setProgressPct(30);
        const blob = await downloadSelectedZip(kind, filenames);
        
        setProgressPct(80);
        const timestamp = new Date().toISOString().slice(0, 10);
        const filename = `export_${kind}_selection_${timestamp}.zip`;
        
        triggerBlobDownload(blob, filename);
        setProgressPct(100);
        
        setTimeout(() => resetProgress(), 1000);
      } catch (error) {
        console.error("Error downloading selected files:", error);
        resetProgress();
        throw error;
      }
    },
    [setDownloading, setProgressPct, resetProgress]
  );

  return {
    fetchList,
    uploadSingle,
    uploadMultiple,
    removeFile,
    downloadAllZip: downloadAll,
    downloadSelectedZip: downloadSelected,
  };
}