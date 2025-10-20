"use client";

import { useMemo, useState, useEffect, useRef } from "react";
import Image from "next/image";
import Button from "@/components/ui/Button";
import { useImageInference } from "@/hooks/useImageInference";
import type { InferenceResponse } from "@/types/imageInference";

function ProgressBar({ value, label }: { value: number; label: string }) {
  const pct = Math.max(0, Math.min(100, value));
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>{label}</span>
        <span>{pct}%</span>
      </div>
      <div className="h-2 w-full rounded bg-muted overflow-hidden">
        <div className="h-2 bg-primary" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

const IMAGE_EXT = ["png", "jpg", "jpeg", "gif", "webp", "bmp"];
function isPreviewable(name: string, type?: string) {
  const ext = name.split(".").pop()?.toLowerCase() || "";
  return type?.startsWith("image/") || IMAGE_EXT.includes(ext);
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "";

type InferenceTagged = InferenceResponse & { tagged_filename?: string | null; filename: string };

export default function Page() {
  const { predictOne, predictManyBatch, predictManySequential } = useImageInference();
  const [files, setFiles] = useState<File[]>([]);
  const [results, setResults] = useState<InferenceTagged[] | null>(null);
  const [uploadPct, setUploadPct] = useState(0);
  const [processPct, setProcessPct] = useState(0);
  const [mode, setMode] = useState<"single" | "batch" | "sequential">("single");
  const [isRunning, setIsRunning] = useState(false);

  const inputRef = useRef<HTMLInputElement | null>(null);
  const objectURLsRef = useRef<Map<number, string>>(new Map());

  const previews = useMemo(() => {
    objectURLsRef.current.forEach((url) => URL.revokeObjectURL(url));
    objectURLsRef.current.clear();
    const map = new Map<number, string>();
    files.forEach((f, idx) => {
      if (isPreviewable(f.name, f.type)) {
        const url = URL.createObjectURL(f);
        objectURLsRef.current.set(idx, url);
        map.set(idx, url);
      }
    });
    return map;
  }, [files]);

  useEffect(() => {
    return () => {
      objectURLsRef.current.forEach((url) => URL.revokeObjectURL(url));
      objectURLsRef.current.clear();
    };
  }, []);

  const canRun = useMemo(() => (mode === "single" ? files.length === 1 : files.length > 0), [mode, files]);

  const onFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files ? Array.from(e.target.files) : [];
    setFiles(f);
    setResults(null);
    setUploadPct(0);
    setProcessPct(0);
  };

  const run = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canRun || isRunning) return;
    setIsRunning(true);
    setResults(null);
    setUploadPct(0);
    setProcessPct(0);

    try {
      if (mode === "single" && files[0]) {
        const r = (await predictOne(files[0], { onUploadPct: setUploadPct, onProcessPct: setProcessPct })) as InferenceTagged;
        setResults([r]);
      } else if (mode === "batch") {
        const rr = (await predictManyBatch(files, true, { onUploadPct: setUploadPct })) as InferenceTagged[];
        setResults(rr);
        setProcessPct(100);
      } else if (mode === "sequential") {
        const rr = (await predictManySequential(files, true, {
          onUploadPct: setUploadPct,
          onProcessPct: setProcessPct,
        })) as InferenceTagged[];
        setResults(rr);
      }
    } finally {
      setIsRunning(false);
    }
  };

  const paired = useMemo(() => {
    if (!results) return [];
    return results.map((r, idx) => {
      const serverUrl =
        r.tagged_filename ? `${API_BASE}/image-inference/tagged/${encodeURIComponent(r.tagged_filename)}` : undefined;
      const localUrl = previews.get(idx);
      return { ...r, serverUrl, localUrl };
    });
  }, [results, previews]);

  const translateLabel = (label: string) => {
    const lower = label.toLowerCase();
    if (lower === "benign") return "Bénin";
    if (lower === "malignant") return "Malin";
    if (lower === "normal") return "Normal";
    return label;
  };

  const openPicker = () => inputRef.current?.click();

  const fileHelperText =
    files.length === 0
      ? "Aucun fichier sélectionné"
      : files.length === 1
      ? files[0].name
      : `${files.length} fichiers sélectionnés`;

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Inférence</h1>

      <form onSubmit={run} className="rounded-xl border p-6 space-y-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="text-sm text-muted-foreground">Mode d’analyse</label>
            <select
              className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
              value={mode}
              onChange={(e) => setMode(e.target.value as any)}
              disabled={isRunning}
            >
              <option value="single">Fichier unique</option>
              <option value="batch">Batch (envoi groupé)</option>
              <option value="sequential">Séquentiel (progression par image)</option>
            </select>
          </div>

          <div className="flex flex-col">
            <label className="text-sm text-muted-foreground">Choisir les fichiers</label>
            <div className="mt-1 flex items-center gap-3">
              <input
                ref={inputRef}
                type="file"
                multiple={mode !== "single"}
                onChange={onFiles}
                accept=".png,.jpg,.jpeg,.gif,.webp,.bmp,.pgm,.dcm"
                className="hidden"
                disabled={isRunning}
              />
              <Button type="button" variant="outline" onClick={openPicker} disabled={isRunning}>
                {mode === "single" ? "Parcourir…" : "Parcourir…"}
              </Button>
              <span className="text-sm text-muted-foreground truncate">{fileHelperText}</span>
            </div>
            <span className="mt-1 text-xs text-muted-foreground">
              Formats acceptés : PNG, JPG, JPEG, GIF, WEBP, BMP, PGM, DCM
            </span>
          </div>
        </div>

        <div className="space-y-3">
          <ProgressBar value={uploadPct} label="Téléversement" />
          <ProgressBar value={processPct} label="Traitement" />
        </div>

        <Button type="submit" disabled={!canRun || isRunning} isLoading={isRunning}>
          Lancer l’analyse
        </Button>
      </form>

      {results && (
        <div className="rounded-xl border p-6 space-y-4">
          <div className="text-sm text-muted-foreground">Résultats</div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {paired.map((r, idx) => (
              <div key={`${r.filename}-${idx}`} className="rounded-lg border p-4 space-y-3">
                {r.serverUrl ? (
                  <div className="relative aspect-[4/3] w-full overflow-hidden rounded-md bg-muted">
                    <Image
                      src={r.serverUrl}
                      alt={r.filename}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 33vw"
                      unoptimized
                    />
                  </div>
                ) : r.localUrl ? (
                  <div className="relative aspect-[4/3] w-full overflow-hidden rounded-md bg-muted">
                    <Image
                      src={r.localUrl}
                      alt={r.filename}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 33vw"
                      unoptimized
                    />
                  </div>
                ) : (
                  <div className="aspect-[4/3] w-full rounded-md bg-muted flex items-center justify-center text-xs text-muted-foreground">
                    Aperçu indisponible ({r.filename})
                  </div>
                )}

                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground truncate">{r.filename}</div>
                  <div className="text-lg font-semibold">{translateLabel(r.label)}</div>
                  <div className="text-sm">BI-RADS : {r.birads}</div>
                  <div className="text-sm">Confiance : {(r.confidence * 100).toFixed(1)}%</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
