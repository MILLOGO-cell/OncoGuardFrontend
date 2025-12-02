// app/(dashboard)/files/page.tsx

"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { useFiles } from "@/hooks/useFiles";
import { useFilesStore } from "@/store/filesStore";
import { downloadFileUrl, type FileKind } from "@/lib/api/filesApi";
import Button from "@/components/ui/Button";
import Loading from "@/components/ui/Loading";
import ImagePreview from "@/components/ui/ImagePreview";

const API_BASE = "https://vcgckw80k8gc0c88osk0kk4w.37.27.42.12.sslip.io/api/v1";
const PAGE_SIZE = 10;

function ProgressBar({ value, label }: { value: number; label: string }) {
  const pct = Math.max(0, Math.min(100, value));

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-gray-700">{label}</span>
        <span className="text-gray-500">{pct}%</span>
      </div>
      <div className="h-2.5 w-full rounded-full bg-gray-200 overflow-hidden">
        <div
          className="h-full bg-blue-600 transition-all duration-300 ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

export default function FilesPage() {
  const { fetchList, removeFile, downloadAllZip, downloadSelectedZip } = useFiles();

  const { items, downloading, progressPct, loading } = useFilesStore();

  const [kind, setKind] = useState<FileKind>("dicom");
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [page, setPage] = useState(1);

  const anySelected = useMemo(
    () => Object.values(selected).some(Boolean),
    [selected]
  );

  const selectedNames = useMemo(
    () =>
      Object.entries(selected)
        .filter(([, v]) => v)
        .map(([k]) => k),
    [selected]
  );

  const totalPages = Math.max(1, Math.ceil(items.length / PAGE_SIZE));

  const pageItems = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return items.slice(start, start + PAGE_SIZE);
  }, [items, page]);

  const canPrev = page > 1;
  const canNext = page < totalPages;

  const getPreviewUrl = useCallback((fileKind: FileKind, filename: string) => {
    // ✅ Utiliser /preview au lieu de /download pour conversion automatique
    return `${API_BASE}/ingest/preview/${fileKind}/${encodeURIComponent(filename)}`;
  }, []);

  const toggleSelection = useCallback((name: string) => {
    setSelected((prev) => ({ ...prev, [name]: !prev[name] }));
  }, []);

  const handleKindChange = useCallback((newKind: FileKind) => {
    setKind(newKind);
    setSelected({});
    setPage(1);
  }, []);

  const handleRefresh = useCallback(() => {
    fetchList({ kind, limit: 500, order: "desc" });
    setPage(1);
  }, [kind, fetchList]);

  const handleDelete = useCallback(
    async (filename: string) => {
      if (!confirm(`Supprimer ${filename} ?`)) return;

      try {
        await removeFile(kind, filename);
        setSelected((prev) => {
          const next = { ...prev };
          delete next[filename];
          return next;
        });
      } catch (error) {
        console.error("Delete error:", error);
        alert("Erreur lors de la suppression du fichier");
      }
    },
    [kind, removeFile]
  );

  const handleExportAll = useCallback(() => {
    downloadAllZip(kind);
  }, [kind, downloadAllZip]);

  const handleExportSelected = useCallback(() => {
    downloadSelectedZip(kind, selectedNames);
  }, [kind, selectedNames, downloadSelectedZip]);

  const handleDownload = useCallback((fileKind: FileKind, filename: string) => {
    const url = downloadFileUrl(fileKind, filename);
    if (typeof window !== "undefined") {
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
    }
  }, []);

  useEffect(() => {
    fetchList({ kind, limit: 500, order: "desc" });
  }, [kind, fetchList]);

  const isDisabled = loading || downloading;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {isDisabled && <Loading overlay variant="spinner" />}

        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestion des fichiers</h1>
          <p className="mt-2 text-gray-600">
            Visualisez et téléchargez vos fichiers DICOM et PGM
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 space-y-6">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-3">
              <label
                htmlFor="kind-select"
                className="text-sm font-semibold text-gray-700"
              >
                Type de fichier
              </label>
              <select
                id="kind-select"
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={kind}
                onChange={(e) => handleKindChange(e.target.value as FileKind)}
                disabled={isDisabled}
              >
                <option value="dicom">DICOM</option>
                <option value="pgm">PGM</option>
              </select>
            </div>

            <Button onClick={handleRefresh} disabled={isDisabled} variant="outline">
              Rafraîchir
            </Button>

            <div className="ml-auto flex items-center gap-2">
              <Button
                variant="ghost"
                onClick={() => setPage(1)}
                disabled={!canPrev || isDisabled}
                aria-label="Première page"
              >
                «
              </Button>
              <Button
                variant="ghost"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={!canPrev || isDisabled}
                aria-label="Page précédente"
              >
                Préc.
              </Button>
              <span className="px-3 text-sm font-medium text-gray-700">
                Page {page} / {totalPages}
              </span>
              <Button
                variant="ghost"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={!canNext || isDisabled}
                aria-label="Page suivante"
              >
                Suiv.
              </Button>
              <Button
                variant="ghost"
                onClick={() => setPage(totalPages)}
                disabled={!canNext || isDisabled}
                aria-label="Dernière page"
              >
                »
              </Button>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button
              variant="secondary"
              onClick={handleExportAll}
              disabled={isDisabled || items.length === 0}
            >
              Exporter tout (ZIP)
            </Button>
            <Button
              variant="secondary"
              disabled={!anySelected || isDisabled}
              onClick={handleExportSelected}
            >
              Exporter sélection ({selectedNames.length})
            </Button>
          </div>

          {downloading && (
            <div className="bg-blue-50 rounded-xl border border-blue-200 p-4">
              <ProgressBar
                value={progressPct}
                label="Téléchargement en cours"
              />
            </div>
          )}
        </div>

        {items.length === 0 && !loading ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12">
            <div className="text-center">
              <svg
                className="w-16 h-16 text-gray-400 mx-auto mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">
                Aucun fichier {kind === "dicom" ? "DICOM" : "PGM"}
              </h3>
              <p className="text-gray-500">
                Les fichiers apparaîtront ici une fois importés depuis la page Ingest
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {pageItems.map((f) => (
              <div
                key={`${f.kind}-${f.filename}`}
                className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-gray-900 truncate flex-1 mr-3">
                      {f.filename}
                    </h3>
                    <input
                      type="checkbox"
                      checked={!!selected[f.filename]}
                      onChange={() => toggleSelection(f.filename)}
                      disabled={isDisabled}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      aria-label={`Sélectionner ${f.filename}`}
                    />
                  </div>

                  <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                    <ImagePreview
                      kind={f.kind as FileKind}
                      filename={f.filename}
                      previewUrl={getPreviewUrl(f.kind as FileKind, f.filename)}
                      className="w-full h-full"
                    />
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                    <span className="text-xs text-gray-500 font-medium">
                      {(f.size_bytes / 1024).toFixed(1)} Ko
                    </span>
                    <div className="flex items-center gap-3">
                      <Button
                        variant="ghost"
                        size="sm"
                        disabled={isDisabled}
                        onClick={() =>
                          handleDownload(f.kind as FileKind, f.filename)
                        }
                      >
                        Télécharger
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(f.filename)}
                        disabled={isDisabled}
                        className="text-red-600 hover:text-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Supprimer
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}