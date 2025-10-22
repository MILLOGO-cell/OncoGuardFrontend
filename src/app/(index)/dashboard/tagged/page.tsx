// src/app/(index)/tagged/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
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
        <div className="h-2 bg-primary" style={{ width: `${v}%` }} />
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

// 🖼️ Modal de visualisation d'image
function ImageModal({
  item,
  onClose,
  onPrevious,
  onNext,
  hasPrevious,
  hasNext,
}: {
  item: ResultItem;
  onClose: () => void;
  onPrevious: () => void;
  onNext: () => void;
  hasPrevious: boolean;
  hasNext: boolean;
}) {
  const imgSrc = item.tagged_filename
    ? taggedImageUrl(item.tagged_filename as string)
    : downloadFileUrl("png", item.filename);

  // Fermer avec Escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft" && hasPrevious) onPrevious();
      if (e.key === "ArrowRight" && hasNext) onNext();
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [onClose, onPrevious, onNext, hasPrevious, hasNext]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative max-w-7xl max-h-[90vh] w-full mx-4 bg-background rounded-xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* En-tête */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-semibold truncate">{item.filename}</h2>
            <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
              <span className="font-medium">{item.label || "Non classifié"}</span>
              {item.birads && <span>BI-RADS {item.birads}</span>}
              {(item.confidence ?? 0) > 0 && (
                <span>Confiance: {((item.confidence ?? 0) * 100).toFixed(1)}%</span>
              )}
              <span
                className={`px-2 py-0.5 rounded text-xs ${item.tagged_filename
                    ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300"
                    : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300"
                  }`}
              >
                {item.tagged_filename ? "Annotée" : "À annoter"}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="ml-4 p-2 rounded-lg hover:bg-muted transition-colors"
            aria-label="Fermer"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Image */}
        <div className="relative flex items-center justify-center p-4 bg-muted/30" style={{ minHeight: "60vh" }}>
          {/* Bouton Précédent */}
          {hasPrevious && (
            <button
              onClick={onPrevious}
              className="absolute left-4 p-3 rounded-full bg-background/90 hover:bg-background shadow-lg transition-all z-10"
              aria-label="Image précédente"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}

          <img
            src={imgSrc}
            alt={item.filename}
            className="max-w-full max-h-[70vh] object-contain rounded-lg"
          />

          {/* Bouton Suivant */}
          {hasNext && (
            <button
              onClick={onNext}
              className="absolute right-4 p-3 rounded-full bg-background/90 hover:bg-background shadow-lg transition-all z-10"
              aria-label="Image suivante"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          )}
        </div>

        {/* Pied de page */}
        <div className="flex items-center justify-between p-4 border-t bg-muted/20">
          <div className="text-sm text-muted-foreground">
            Utilisez les flèches ← → pour naviguer • Échap pour fermer
          </div>

          {/* L'ajout du <a> corrige l'erreur de syntaxe */}
          <a
            href={imgSrc}
            download={item.filename}
            className="px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity text-sm font-medium"
          >
            Télécharger
          </a>
        </div>
      </div>
    </div>
  );
}

export default function Page() {
  const { fetchAll, exportCsv, exportTaggedZip } = useResults();
  const { items, loading, downloading, progressPct } = useResultsStore();

  // ⚙️ États UI (front-only)
  const [order, setOrder] = useState<"asc" | "desc">("desc");
  const [limit, setLimit] = useState<number>(50);
  const [page, setPage] = useState<number>(1);
  const [view, setView] = useState<ViewFilter>("all");

  // 🖼️ État pour l'image sélectionnée
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  // 🔄 Chargement unique
  useEffect(() => {
    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 🔍 Filtrage
  const filtered = useMemo(() => {
    if (view === "tagged") return items.filter((i: ResultItem) => !!i.tagged_filename);
    if (view === "untagged") return items.filter((i: ResultItem) => !i.tagged_filename);
    return items;
  }, [items, view]);

  // ↕️ Tri côté client
  const getSortKey = (it: ResultItem) =>
    new Date(
      it.inferred_at || it.updated_at || it.created_at || "1970-01-01T00:00:00Z"
    ).getTime() || Number(it.id) || 0;

  const sorted = useMemo(() => {
    const arr = [...filtered];
    arr.sort((a, b) => {
      const va = getSortKey(a);
      const vb = getSortKey(b);
      return order === "asc" ? va - vb : vb - va;
    });
    return arr;
  }, [filtered, order]);

  // 📄 Pagination front
  const total = sorted.length;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const from = total ? (page - 1) * limit + 1 : 0;
  const to = total ? Math.min(page * limit, total) : 0;

  const current = useMemo(() => {
    const start = (page - 1) * limit;
    return sorted.slice(start, start + limit);
  }, [sorted, page, limit]);

  // 🔁 Reset page sur changement de filtre/tri/limit/données
  useEffect(() => {
    setPage(1);
  }, [view, order, limit, total]);

  const goPrev = () => setPage((p) => Math.max(1, p - 1));
  const goNext = () => setPage((p) => Math.min(totalPages, p + 1));

  // 🖼️ Gestion de la navigation dans le modal
  const handleImageClick = (index: number) => {
    setSelectedIndex(index);
  };

  const handleCloseModal = () => {
    setSelectedIndex(null);
  };

  const handlePreviousImage = () => {
    if (selectedIndex !== null && selectedIndex > 0) {
      setSelectedIndex(selectedIndex - 1);
    }
  };

  const handleNextImage = () => {
    if (selectedIndex !== null && selectedIndex < sorted.length - 1) {
      setSelectedIndex(selectedIndex + 1);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Images annotées</h1>
          <p className="text-sm text-muted-foreground">
            {filtered.filter((i: ResultItem) => !!i.tagged_filename).length} annotées •{" "}
            {filtered.filter((i: ResultItem) => !i.tagged_filename).length} non annotées • total {total}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <select
            className="border rounded-md px-3 py-2 text-sm"
            value={view}
            onChange={(e) => setView(e.target.value as ViewFilter)}
            disabled={loading || downloading}
            aria-label="Filtrer l'état"
          >
            <option value="all">Toutes</option>
            <option value="tagged">Annotées</option>
            <option value="untagged">Non annotées</option>
          </select>

          <select
            className="border rounded-md px-3 py-2 text-sm"
            value={order}
            onChange={(e) => setOrder(e.target.value as "asc" | "desc")}
            disabled={loading || downloading}
            aria-label="Ordre de tri"
          >
            <option value="desc">Récent d'abord</option>
            <option value="asc">Ancien d'abord</option>
          </select>

          <select
            className="border rounded-md px-3 py-2 text-sm"
            value={String(limit)}
            onChange={(e) => setLimit(Number(e.target.value))}
            disabled={loading || downloading}
            aria-label="Taille de page"
          >
            <option value="12">12 / page</option>
            <option value="24">24 / page</option>
            <option value="50">50 / page</option>
            <option value="100">100 / page</option>
            <option value="200">200 / page</option>
          </select>

          <Button variant="secondary" onClick={exportCsv} disabled={downloading || loading}>
            Exporter CSV
          </Button>
          <Button variant="secondary" onClick={exportTaggedZip} disabled={downloading || loading}>
            Exporter ZIP
          </Button>
        </div>
      </div>

      {(loading || downloading) && (
        <div className="rounded-xl border p-4 space-y-2">
          <div className="text-sm text-muted-foreground">{downloading ? "Téléchargement" : "Chargement"}</div>
          <ProgressBar value={downloading ? progressPct : 35} label="Progression" />
        </div>
      )}

      {/* Pagination (haut) */}
      <PaginationBar
        page={page}
        totalPages={totalPages}
        from={from}
        to={to}
        total={total}
        disabled={loading || downloading}
        onPrev={goPrev}
        onNext={goNext}
        onJump={(p) => setPage(p)}
      />

      {/* Grille d'images (page courante) */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {current.map((it: ResultItem, idx: number) => {
          const imgSrc = it.tagged_filename
            ? taggedImageUrl(it.tagged_filename as string)
            : downloadFileUrl("png", it.filename);

          // Index global dans la liste triée
          const globalIndex = (page - 1) * limit + idx;

          return (
            <div key={it.id} className="rounded-xl border p-4 space-y-3 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between">
                <div className="text-sm font-medium truncate">{it.filename}</div>
                <div className="text-xs text-muted-foreground">
                  {(it.confidence ?? 0) > 0 ? `${((it.confidence ?? 0) * 100).toFixed(1)}%` : "-"}
                </div>
              </div>

              {/* Image cliquable */}
              <button
                onClick={() => handleImageClick(globalIndex)}
                className="w-full cursor-pointer group"
                aria-label={`Voir ${it.filename} en grand`}
              >
                <div className="relative overflow-hidden rounded bg-muted">
                  <img
                    src={imgSrc}
                    alt={it.filename}
                    className="w-full h-48 object-contain transition-transform group-hover:scale-105"
                    loading="lazy"
                  />
                  {/* Overlay au survol */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-background/90 rounded-full p-3">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                      </svg>
                    </div>
                  </div>
                </div>
              </button>

              <div className="flex items-center justify-between text-sm">
                <div>
                  <span className="font-semibold">{it.label || "-"}</span>
                  {it.birads ? <span className="text-muted-foreground"> • BI-RADS {it.birads}</span> : null}
                </div>
                <span
                  className={`px-2 py-0.5 rounded text-xs ${it.tagged_filename
                      ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300"
                      : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300"
                    }`}
                >
                  {it.tagged_filename ? "Annotée" : "À annoter"}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <a className="text-sm underline hover:no-underline" href={imgSrc} download>
                  Télécharger
                </a>
              </div>
            </div>
          );
        })}
      </div>

      {/* Pagination (bas) */}
      <PaginationBar
        page={page}
        totalPages={totalPages}
        from={from}
        to={to}
        total={total}
        disabled={loading || downloading}
        onPrev={goPrev}
        onNext={goNext}
        onJump={(p) => setPage(p)}
      />

      {/* Modal de visualisation */}
      {selectedIndex !== null && sorted[selectedIndex] && (
        <ImageModal
          item={sorted[selectedIndex]}
          onClose={handleCloseModal}
          onPrevious={handlePreviousImage}
          onNext={handleNextImage}
          hasPrevious={selectedIndex > 0}
          hasNext={selectedIndex < sorted.length - 1}
        />
      )}
    </div>
  );
}

function PaginationBar({
  page,
  totalPages,
  from,
  to,
  total,
  disabled,
  onPrev,
  onNext,
  onJump,
}: {
  page: number;
  totalPages: number;
  from: number;
  to: number;
  total: number;
  disabled?: boolean;
  onPrev: () => void;
  onNext: () => void;
  onJump: (p: number) => void;
}) {
  const windowSize = 5;
  const half = Math.floor(windowSize / 2);
  let start = Math.max(1, page - half);
  let end = Math.min(totalPages, start + windowSize - 1);
  if (end - start + 1 < windowSize) {
    start = Math.max(1, end - windowSize + 1);
  }

  const pages = [];
  for (let p = start; p <= end; p++) pages.push(p);

  return (
    <div className="flex items-center justify-between rounded-xl border p-3">
      <div className="text-sm text-muted-foreground">
        {total > 0 ? (
          <>
            Affichage <span className="font-medium text-foreground">{from}</span>–
            <span className="font-medium text-foreground">{to}</span> sur{" "}
            <span className="font-medium text-foreground">{total}</span>
          </>
        ) : (
          "Aucun résultat"
        )}
      </div>

      <div className="flex items-center gap-2">
        <Button variant="secondary" onClick={onPrev} disabled={disabled || page <= 1}>
          Précédent
        </Button>

        <div className="flex items-center gap-1">
          {start > 1 && (
            <>
              <PageBtn n={1} active={page === 1} onClick={() => onJump(1)} disabled={disabled} />
              <span className="text-sm text-muted-foreground">…</span>
            </>
          )}
          {pages.map((n) => (
            <PageBtn key={n} n={n} active={n === page} onClick={() => onJump(n)} disabled={disabled} />
          ))}
          {end < totalPages && (
            <>
              <span className="text-sm text-muted-foreground">…</span>
              <PageBtn
                n={totalPages}
                active={page === totalPages}
                onClick={() => onJump(totalPages)}
                disabled={disabled}
              />
            </>
          )}
        </div>

        <Button variant="secondary" onClick={onNext} disabled={disabled || page >= totalPages}>
          Suivant
        </Button>
      </div>
    </div>
  );
}

function PageBtn({
  n,
  active,
  onClick,
  disabled,
}: {
  n: number;
  active?: boolean;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-current={active ? "page" : undefined}
      className={[
        "min-w-8 h-8 px-2 rounded-md text-sm",
        active
          ? "bg-[var(--color-primary)] text-[var(--color-primary-foreground)]"
          : "text-[var(--color-foreground)] hover:bg-[var(--color-hover)]",
        disabled ? "opacity-50 cursor-not-allowed" : "",
      ].join(" ")}
    >
      {n}
    </button>
  );
}