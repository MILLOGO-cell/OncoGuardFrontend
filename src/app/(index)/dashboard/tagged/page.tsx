"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useResults } from "@/hooks/useResults";
import { useResultsStore } from "@/store/resultsStore";
import { taggedImageUrl } from "@/lib/api/resultsApi";
import { downloadFileUrl } from "@/lib/api/filesApi";
import Button from "@/components/ui/Button";

function ProgressBar({ value, label }: { value: number; label: string }) {
  const v = Math.max(0, Math.min(100, value));
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>{label}</span>
        <span>{v}%</span>
      </div>
      <div className="h-2 w-full rounded bg-muted overflow-hidden">
        <div className="h-2 bg-primary transition-all" style={{ width: `${v}%` }} />
      </div>
    </div>
  );
}

type ViewFilter = "all" | "tagged" | "untagged";
type ResultItem = {
  id: string | number;
  filename: string;
  tagged_filename?: string | null;
  confidence?: number | null;
  label?: string | null;
  birads?: string | number | null;
  created_at?: string;
  updated_at?: string;
  inferred_at?: string;
};

function ImageModal({
  item, onClose, onPrevious, onNext, hasPrevious, hasNext,
}: {
  item: ResultItem; onClose: () => void; onPrevious: () => void; onNext: () => void; hasPrevious: boolean; hasNext: boolean;
}) {
  const imgSrc = item.tagged_filename ? taggedImageUrl(item.tagged_filename as string) : "";
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft" && hasPrevious) onPrevious();
      if (e.key === "ArrowRight" && hasNext) onNext();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, onPrevious, onNext, hasPrevious, hasNext]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={onClose}
      aria-modal="true"
      role="dialog"
      aria-labelledby="image-dialog-title"
      aria-describedby="image-dialog-desc"
      tabIndex={-1}
    >
      <div
        className="relative max-w-7xl w-full max-h-[92vh] mx-4 bg-background rounded-2xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b">
          <div className="min-w-0">
            <h2 className="text-lg font-semibold truncate">{item.filename}</h2>
            <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground mt-1">
              <span className="font-medium">{item.label || "Non classifiée"}</span>
              {item.birads ? <span>BI-RADS {item.birads}</span> : null}
              {(item.confidence ?? 0) > 0 ? <span>Confiance {((item.confidence ?? 0) * 100).toFixed(1)}%</span> : null}
            </div>
          </div>
          <button onClick={onClose} className="ml-4 p-2 rounded-lg hover:bg-muted transition-colors" aria-label="Fermer">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18 18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="relative flex items-center justify-center bg-muted/30" style={{ minHeight: "60vh" }}>
          {hasPrevious && (
            <button onClick={onPrevious} className="absolute left-4 p-3 rounded-full bg-background/90 hover:bg-background shadow-lg transition-all z-10" aria-label="Précédente">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            </button>
          )}
          <div className="relative w-full max-w-6xl aspect-[4/3]">
            {imgSrc ? (
              <Image src={imgSrc} alt={item.filename} fill sizes="100vw" className="object-contain" priority unoptimized />
            ) : (
              <div className="absolute inset-0 grid place-items-center"><p className="text-sm text-muted-foreground">Aucune image annotée disponible</p></div>
            )}
          </div>
          {hasNext && (
            <button onClick={onNext} className="absolute right-4 p-3 rounded-full bg-background/90 hover:bg-background shadow-lg transition-all z-10" aria-label="Suivante">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            </button>
          )}
        </div>

        <div className="flex items-center justify-between p-4 border-t bg-muted/20">
          <div className="text-sm text-muted-foreground">Flèches ← → pour naviguer • Échap pour fermer</div>
          {imgSrc && (
            <Button asChild variant="link">
              <Link href={imgSrc} download>Télécharger l'annotation</Link>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Page() {
  const { fetchAll, exportCsv, exportTaggedZip, deleteSelected } = useResults();
  const { items, loading, downloading, progressPct, selectedIds, toggleSelection, selectAll, clearSelection } = useResultsStore();

  const [order, setOrder] = useState<"asc" | "desc">("desc");
  const [limit, setLimit] = useState<number>(24);
  const [page, setPage] = useState<number>(1);
  const [view, setView] = useState<ViewFilter>("all");
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const fetchAllRef = useRef(fetchAll);
  useEffect(() => { fetchAllRef.current = fetchAll; }, [fetchAll]);
  useEffect(() => { fetchAllRef.current({ limit: 1000, order: "desc" }); }, []);

  const filtered = useMemo(() => {
    if (view === "tagged") return items.filter((i: ResultItem) => !!i.tagged_filename);
    if (view === "untagged") return items.filter((i: ResultItem) => !i.tagged_filename);
    return items;
  }, [items, view]);

  const sortKey = (it: ResultItem) =>
    new Date(it.inferred_at || it.updated_at || it.created_at || "1970-01-01T00:00:00Z").getTime() || Number(it.id) || 0;

  const sorted = useMemo(() => {
    const arr = [...filtered];
    arr.sort((a, b) => (order === "asc" ? sortKey(a) - sortKey(b) : sortKey(b) - sortKey(a)));
    return arr;
  }, [filtered, order]);

  const total = sorted.length;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const from = total ? (page - 1) * limit + 1 : 0;
  const to = total ? Math.min(page * limit, total) : 0;

  const current = useMemo(() => {
    const start = (page - 1) * limit;
    return sorted.slice(start, start + limit);
  }, [sorted, page, limit]);

  useEffect(() => { setPage(1); }, [view, order, limit, total]);

  const openAt = (globalIndex: number) => setSelectedIndex(globalIndex);
  const closeModal = () => setSelectedIndex(null);
  const prevModal = () => setSelectedIndex((i) => (i !== null && i > 0 ? i - 1 : i));
  const nextModal = () => setSelectedIndex((i) => (i !== null && i < sorted.length - 1 ? i + 1 : i));

  const handleSelectAll = () => {
    if (selectedIds.size === current.length) {
      clearSelection();
    } else {
      selectAll(current.map((it) => Number(it.id)));
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedIds.size === 0) return;
    if (!confirm(`Supprimer ${selectedIds.size} fichier(s) ?`)) return;

    const toDelete = items.filter((item) => selectedIds.has(Number(item.id)));
    await deleteSelected(
      toDelete.map((item) => ({
        id: Number(item.id),
        tagged_filename: item.tagged_filename || null,
      }))
    );
  };

  const allCurrentSelected = current.length > 0 && current.every((it) => selectedIds.has(Number(it.id)));

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Résultats d'annotation</h1>
          <p className="text-sm text-muted-foreground">
            {filtered.filter((i: ResultItem) => !!i.tagged_filename).length} annotées • {filtered.filter((i: ResultItem) => !i.tagged_filename).length} non annotées • total {total}
            {selectedIds.size > 0 && <span className="ml-2 font-medium text-primary">• {selectedIds.size} sélectionnés</span>}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {selectedIds.size > 0 && (
            <>
              <Button variant="danger" onClick={handleDeleteSelected} disabled={loading || downloading}>
                Supprimer ({selectedIds.size})
              </Button>
              <Button variant="secondary" onClick={clearSelection} disabled={loading || downloading}>
                Désélectionner
              </Button>
            </>
          )}
          <select className="border rounded-md px-3 py-2 text-sm" value={view} onChange={(e) => setView(e.target.value as ViewFilter)} disabled={loading || downloading}>
            <option value="all">Toutes</option>
            <option value="tagged">Annotées</option>
            <option value="untagged">Non annotées</option>
          </select>
          <select className="border rounded-md px-3 py-2 text-sm" value={order} onChange={(e) => setOrder(e.target.value as "asc" | "desc")} disabled={loading || downloading}>
            <option value="desc">Récentes d'abord</option>
            <option value="asc">Anciennes d'abord</option>
          </select>
          <select className="border rounded-md px-3 py-2 text-sm" value={String(limit)} onChange={(e) => setLimit(Number(e.target.value))} disabled={loading || downloading}>
            <option value="12">12 / page</option>
            <option value="24">24 / page</option>
            <option value="48">48 / page</option>
            <option value="96">96 / page</option>
          </select>
          <Button variant="secondary" onClick={exportCsv} disabled={downloading || loading}>Exporter CSV</Button>
          <Button variant="secondary" onClick={exportTaggedZip} disabled={downloading || loading}>Exporter ZIP</Button>
        </div>
      </div>

      {(loading || downloading) && (
        <div className="rounded-xl border p-4 space-y-2">
          <div className="text-sm text-muted-foreground">{downloading ? "Téléchargement" : "Chargement"}</div>
          <ProgressBar value={downloading ? progressPct : 35} label="Progression" />
        </div>
      )}

      <PaginationBar
        page={page}
        totalPages={totalPages}
        from={from}
        to={to}
        total={total}
        disabled={loading || downloading}
        onPrev={() => setPage((p) => Math.max(1, p - 1))}
        onNext={() => setPage((p) => Math.min(totalPages, p + 1))}
        onJump={(p) => setPage(p)}
        onSelectAll={handleSelectAll}
        allSelected={allCurrentSelected}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {current.map((it: ResultItem, idx: number) => {
          const imgSrc = it.tagged_filename ? taggedImageUrl(it.tagged_filename as string) : "";
          const globalIndex = (page - 1) * limit + idx;
          const isSelected = selectedIds.has(Number(it.id));

          return (
            <div key={it.id} className={`rounded-xl border p-4 space-y-3 hover:shadow-lg transition-all ${isSelected ? "ring-2 ring-primary" : ""}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => toggleSelection(Number(it.id))}
                    className="w-4 h-4 rounded border-gray-300"
                    disabled={loading || downloading}
                  />
                  <div className="text-sm font-medium truncate" title={it.filename}>{it.filename}</div>
                </div>
                <div className="text-xs text-muted-foreground">{(it.confidence ?? 0) > 0 ? `${((it.confidence ?? 0) * 100).toFixed(1)}%` : "-"}</div>
              </div>

              <button
                onClick={() => imgSrc && openAt(globalIndex)}
                className="relative w-full aspect-[4/3] rounded bg-muted overflow-hidden group disabled:opacity-50"
                disabled={!imgSrc}
              >
                {imgSrc ? (
                  <Image src={imgSrc} alt={it.filename} fill sizes="(max-width: 768px) 100vw, 33vw" className="object-contain transition-transform group-hover:scale-[1.02]" unoptimized />
                ) : (
                  <div className="absolute inset-0 grid place-items-center text-sm text-muted-foreground">Non annotée</div>
                )}
              </button>

              <div className="flex items-center justify-between text-sm">
                <div>
                  <span className="font-semibold">{it.label || "-"}</span>
                  {it.birads ? <span className="text-muted-foreground"> • BI-RADS {it.birads}</span> : null}
                </div>
              </div>

              <div className="flex items-center gap-3">
                {imgSrc ? (
                  <Button asChild variant="link">
                    <Link href={imgSrc} download>Télécharger</Link>
                  </Button>
                ) : (
                  <Button asChild variant="link">
                    <Link href={downloadFileUrl("dicom", it.filename)}>Télécharger DICOM</Link>
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <PaginationBar
        page={page}
        totalPages={totalPages}
        from={from}
        to={to}
        total={total}
        disabled={loading || downloading}
        onPrev={() => setPage((p) => Math.max(1, p - 1))}
        onNext={() => setPage((p) => Math.min(totalPages, p + 1))}
        onJump={(p) => setPage(p)}
        onSelectAll={handleSelectAll}
        allSelected={allCurrentSelected}
      />

      {selectedIndex !== null && sorted[selectedIndex] && (
        <ImageModal
          item={sorted[selectedIndex]}
          onClose={closeModal}
          onPrevious={prevModal}
          onNext={nextModal}
          hasPrevious={selectedIndex > 0}
          hasNext={selectedIndex < sorted.length - 1}
        />
      )}
    </div>
  );
}

function PaginationBar({
  page, totalPages, from, to, total, disabled, onPrev, onNext, onJump, onSelectAll, allSelected,
}: {
  page: number; totalPages: number; from: number; to: number; total: number;
  disabled?: boolean; onPrev: () => void; onNext: () => void; onJump: (p: number) => void;
  onSelectAll?: () => void; allSelected?: boolean;
}) {
  const windowSize = 5;
  const half = Math.floor(windowSize / 2);
  let start = Math.max(1, page - half);
  let end = Math.min(totalPages, start + windowSize - 1);
  if (end - start + 1 < windowSize) start = Math.max(1, end - windowSize + 1);
  const pages = [];
  for (let p = start; p <= end; p++) pages.push(p);

  return (
    <div className="flex items-center justify-between rounded-xl border p-3">
      <div className="flex items-center gap-3">
        {onSelectAll && (
          <button
            onClick={onSelectAll}
            disabled={disabled}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <input
              type="checkbox"
              checked={allSelected}
              onChange={onSelectAll}
              className="w-4 h-4 rounded border-gray-300"
              disabled={disabled}
            />
            <span>Tout sélectionner</span>
          </button>
        )}
        <div className="text-sm text-muted-foreground">
          {total > 0 ? <>Affichage <span className="font-medium text-foreground">{from}</span>–<span className="font-medium text-foreground">{to}</span> sur <span className="font-medium text-foreground">{total}</span></> : "Aucun résultat"}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="secondary" onClick={onPrev} disabled={disabled || page <= 1}>Précédent</Button>
        <div className="flex items-center gap-1">
          {start > 1 && (<><PageBtn n={1} active={page === 1} onClick={() => onJump(1)} disabled={disabled} /><span className="text-sm text-muted-foreground">…</span></>)}
          {pages.map((n) => (<PageBtn key={n} n={n} active={n === page} onClick={() => onJump(n)} disabled={disabled} />))}
          {end < totalPages && (<><span className="text-sm text-muted-foreground">…</span><PageBtn n={totalPages} active={page === totalPages} onClick={() => onJump(totalPages)} disabled={disabled} /></>)}
        </div>
        <Button variant="secondary" onClick={onNext} disabled={disabled || page >= totalPages}>Suivant</Button>
      </div>
    </div>
  );
}

function PageBtn({ n, active, onClick, disabled }: { n: number; active?: boolean; onClick: () => void; disabled?: boolean; }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-current={active ? "page" : undefined}
      className={["min-w-8 h-8 px-2 rounded-md text-sm", active ? "bg-primary text-primary-foreground" : "text-foreground hover:bg-muted", disabled ? "opacity-50 cursor-not-allowed" : ""].join(" ")}
    >
      {n}
    </button>
  );
}