// src/app/(index)/files/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { useFiles } from "@/hooks/useFiles";
import { useFilesStore } from "@/store/filesStore";
import { downloadFileUrl } from "@/lib/api/filesApi";
import Button from "@/components/ui/Button";
import Loading from "@/components/ui/Loading";

function ProgressBar({ value, label }: { value: number; label: string }) {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>{label}</span>
        <span>{Math.max(0, Math.min(100, value))}%</span>
      </div>
      <div className="h-2 w-full rounded bg-muted overflow-hidden">
        <div className="h-2 bg-primary" style={{ width: `${Math.max(0, Math.min(100, value))}%` }} />
      </div>
    </div>
  );
}

const PAGE_SIZE = 10;

export default function Page() {
  const { fetchList, downloadAllZip, downloadSelectedZip } = useFiles();
  const { items, downloading, progressPct, loading } = useFilesStore();
  const [kind, setKind] = useState<"png" | "dicom">("png");
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [page, setPage] = useState(1);

  const anySelected = useMemo(() => Object.values(selected).some(Boolean), [selected]);

  useEffect(() => {
    // On récupère (jusqu’à) 500 max mais on n’affiche que 10/ page
    fetchList({ kind, limit: 500, order: "desc" });
    setSelected({});
    setPage(1);
  }, [kind]);

  const toggle = (name: string) =>
    setSelected((prev) => ({ ...prev, [name]: !prev[name] }));

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

  return (
    <div className="p-6 space-y-6 relative">
      {(loading || downloading) && <Loading overlay variant="spinner" />}

      <h1 className="text-2xl font-semibold">Images anonymisées</h1>

      <div className="flex flex-wrap items-center gap-3">
        <select
          className="border rounded-md px-3 py-2 text-sm"
          value={kind}
          onChange={(e) => setKind(e.target.value as "png" | "dicom")}
          disabled={downloading}
        >
          <option value="png">PNG</option>
          <option value="dicom">DICOM</option>
        </select>

        <Button
          onClick={() => {
            fetchList({ kind, limit: 500, order: "desc" });
            setPage(1);
          }}
          disabled={downloading}
        >
          Rafraîchir
        </Button>

        <div className="ml-auto flex items-center gap-2">
          <Button
            variant="ghost"
            onClick={() => setPage(1)}
            disabled={!canPrev || downloading}
          >
            «
          </Button>
          <Button
            variant="ghost"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={!canPrev || downloading}
          >
            Préc.
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {page} / {totalPages}
          </span>
          <Button
            variant="ghost"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={!canNext || downloading}
          >
            Suiv.
          </Button>
          <Button
            variant="ghost"
            onClick={() => setPage(totalPages)}
            disabled={!canNext || downloading}
          >
            »
          </Button>
        </div>

        <Button
          variant="secondary"
          onClick={() => downloadAllZip(kind)}
          disabled={downloading || loading}
        >
          Exporter tout (ZIP)
        </Button>
        <Button
          variant="secondary"
          disabled={!anySelected || downloading}
          onClick={() => downloadSelectedZip(kind, selectedNames)}
        >
          Exporter sélection (ZIP)
        </Button>
      </div>

      {downloading && (
        <div className="rounded-xl border p-4 space-y-2">
          <div className="text-sm text-muted-foreground">Téléchargement en cours</div>
          <ProgressBar value={progressPct} label="Progression" />
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {pageItems.map((f) => (
          <div key={`${f.kind}-${f.filename}`} className="rounded-xl border p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium truncate">{f.filename}</div>
              <input
                type="checkbox"
                checked={!!selected[f.filename]}
                onChange={() => toggle(f.filename)}
                disabled={downloading}
              />
            </div>

            {f.kind === "png" ? (
              <img
                src={downloadFileUrl("png", f.filename)}
                alt={f.filename}
                className="w-full h-48 object-contain bg-muted rounded"
                loading="lazy"
              />
            ) : (
              <div className="h-48 grid place-items-center bg-muted rounded text-xs text-muted-foreground">
                DICOM
              </div>
            )}

            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>{(f.size_bytes / 1024).toFixed(1)} Ko</span>
              <a
                className="underline"
                href={downloadFileUrl(f.kind, f.filename)}
                download
              >
                Télécharger
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
