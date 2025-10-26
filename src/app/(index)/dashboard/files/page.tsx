"use client";

import { useEffect, useMemo, useState, useRef } from "react";
import { useFiles } from "@/hooks/useFiles";
import { useFilesStore } from "@/store/filesStore";
import { downloadFileUrl, getPreviewUrl } from "@/lib/api/filesApi";
import Button from "@/components/ui/Button";
import Loading from "@/components/ui/Loading";
import ImagePreview from "@/components/ui/ImagePreview";

function ProgressBar({ value, label }: { value: number; label: string }) {
  const pct = Math.max(0, Math.min(100, value));
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>{label}</span>
        <span>{pct}%</span>
      </div>
      <div className="h-2 w-full rounded bg-muted overflow-hidden">
        <div className="h-2 bg-primary transition-all" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

const PAGE_SIZE = 10;

export default function Page() {
  const { 
    fetchList, 
    uploadMultiple, 
    removeFile, 
    downloadAllZip, 
    downloadSelectedZip 
  } = useFiles();
  
  const { 
    items, 
    downloading, 
    uploading, 
    progressPct, 
    uploadProgressPct, 
    loading 
  } = useFilesStore();

  const [kind, setKind] = useState<"dicom" | "pgm">("dicom");
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [page, setPage] = useState(1);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const anySelected = useMemo(() => Object.values(selected).some(Boolean), [selected]);

  useEffect(() => {
    fetchList({ kind, limit: 500, order: "desc" });
    setSelected({});
    setPage(1);
  }, [kind, fetchList]);

  const toggle = (name: string) => setSelected((prev) => ({ ...prev, [name]: !prev[name] }));

  const selectedNames = useMemo(
    () => Object.entries(selected).filter(([, v]) => v).map(([k]) => k),
    [selected]
  );

  const totalPages = Math.max(1, Math.ceil(items.length / PAGE_SIZE));
  const pageItems = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return items.slice(start, start + PAGE_SIZE);
  }, [items, page]);

  const canPrev = page > 1;
  const canNext = page < totalPages;

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    try {
      await uploadMultiple(kind, Array.from(files));
    } catch (error) {
      console.error("Upload error:", error);
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleDelete = async (filename: string) => {
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
    }
  };

  return (
    <div className="p-6 space-y-6 relative">
      {(loading || downloading || uploading) && <Loading overlay variant="spinner" />}

      <h1 className="text-2xl font-semibold">Fichiers</h1>

      {/* Upload section */}
      <div className="rounded-xl border p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium">Uploader des fichiers</h2>
          <select
            className="border rounded-md px-3 py-2 text-sm"
            value={kind}
            onChange={(e) => setKind(e.target.value as "dicom" | "pgm")}
            disabled={uploading}
          >
            <option value="dicom">DICOM</option>
            <option value="pgm">PGM</option>
          </select>
        </div>

        <div className="flex items-center gap-3">
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept={kind === "dicom" ? ".dcm,.dicom" : ".png,.jpg,.jpeg,.pgm"}
            onChange={handleFileSelect}
            disabled={uploading}
            className="flex-1 text-sm file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90 disabled:opacity-50"
          />
          <Button
            variant="secondary"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
          >
            Parcourir
          </Button>
        </div>

        {uploading && (
          <ProgressBar value={uploadProgressPct} label="Upload en cours" />
        )}
      </div>

      {/* Controls */}
      <div className="flex flex-wrap items-center gap-3">
        <Button
          onClick={() => {
            fetchList({ kind, limit: 500, order: "desc" });
            setPage(1);
          }}
          disabled={downloading || uploading}
        >
          Rafraîchir
        </Button>

        <div className="ml-auto flex items-center gap-2">
          <Button variant="ghost" onClick={() => setPage(1)} disabled={!canPrev || downloading || uploading}>
            «
          </Button>
          <Button
            variant="ghost"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={!canPrev || downloading || uploading}
          >
            Préc.
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {page} / {totalPages}
          </span>
          <Button
            variant="ghost"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={!canNext || downloading || uploading}
          >
            Suiv.
          </Button>
          <Button
            variant="ghost"
            onClick={() => setPage(totalPages)}
            disabled={!canNext || downloading || uploading}
          >
            »
          </Button>
        </div>

        <Button
          variant="secondary"
          onClick={() => downloadAllZip(kind)}
          disabled={downloading || loading || uploading}
        >
          Exporter tout (ZIP)
        </Button>
        <Button
          variant="secondary"
          disabled={!anySelected || downloading || uploading}
          onClick={() => downloadSelectedZip(kind, selectedNames)}
        >
          Exporter sélection (ZIP)
        </Button>
      </div>

      {/* Download progress */}
      {downloading && (
        <div className="rounded-xl border p-4 space-y-2">
          <div className="text-sm text-muted-foreground">Téléchargement en cours</div>
          <ProgressBar value={progressPct} label="Progression" />
        </div>
      )}

      {/* Files grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {pageItems.map((f) => (
          <div key={`${f.kind}-${f.filename}`} className="rounded-xl border p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium truncate">{f.filename}</div>
              <input
                type="checkbox"
                checked={!!selected[f.filename]}
                onChange={() => toggle(f.filename)}
                disabled={downloading || uploading}
              />
            </div>

            {/* Image preview */}
            <ImagePreview 
              kind={f.kind as "dicom" | "pgm"}
              filename={f.filename}
              previewUrl={getPreviewUrl(f.kind as "dicom" | "pgm", f.filename)}
              className="h-48"
            />

            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">{(f.size_bytes / 1024).toFixed(1)} Ko</span>
              <div className="flex items-center gap-2">
                <a
                  className="underline text-muted-foreground hover:text-foreground"
                  href={downloadFileUrl(f.kind as "dicom" | "pgm", f.filename)}
                  download
                >
                  Télécharger
                </a>
                <button
                  onClick={() => handleDelete(f.filename)}
                  disabled={uploading || downloading}
                  className="text-red-600 hover:text-red-700 disabled:opacity-50"
                >
                  Supprimer
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {items.length === 0 && !loading && (
        <div className="text-center py-12 text-muted-foreground">
          Aucun fichier {kind === "dicom" ? "DICOM" : "PGM"}. I-en un ci-dessus.
        </div>
      )}
    </div>
  );
}