// src/app/(index)/inference/page.tsx
"use client";

import { useMemo, useState } from "react";
import Button from "@/components/ui/Button";
import { useImageInference } from "@/hooks/useImageInference";
import { InferenceResponse } from "@/types/imageInference";

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

export default function Page() {
  const { predictOne, predictManyBatch, predictManySequential } = useImageInference();
  const [files, setFiles] = useState<File[]>([]);
  const [results, setResults] = useState<InferenceResponse[] | null>(null);

  const [uploadPct, setUploadPct] = useState(0);
  const [processPct, setProcessPct] = useState(0);
  const [mode, setMode] = useState<"single" | "batch" | "sequential">("single");

  const canRun = useMemo(() => {
    if (mode === "single") return files.length === 1;
    return files.length > 0;
  }, [mode, files]);

  const onFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files ? Array.from(e.target.files) : [];
    setFiles(f);
    setResults(null);
    setUploadPct(0);
    setProcessPct(0);
  };

  const run = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canRun) return;
    setResults(null);
    setUploadPct(0);
    setProcessPct(0);

    if (mode === "single" && files[0]) {
      const r = await predictOne(files[0], {
        onUploadPct: setUploadPct,
        onProcessPct: setProcessPct,
      });
      setResults([r]);
      return;
    }

    if (mode === "batch") {
      const rr = await predictManyBatch(files, true, { onUploadPct: setUploadPct });
      setResults(rr);
      setProcessPct(100);
      return;
    }

    if (mode === "sequential") {
      const rr = await predictManySequential(files, true, { onUploadPct: setUploadPct, onProcessPct: setProcessPct });
      setResults(rr);
      return;
    }
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Inférence</h1>

      <form onSubmit={run} className="rounded-xl border p-6 space-y-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="text-sm text-muted-foreground">Mode</label>
            <select
              className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
              value={mode}
              onChange={(e) => setMode(e.target.value as any)}
            >
              <option value="single">Fichier unique</option>
              <option value="batch">Batch (upload groupé)</option>
              <option value="sequential">Séquentiel (progress réel par fichier)</option>
            </select>
          </div>
          <div>
            <label className="text-sm text-muted-foreground">Fichiers</label>
            <input
              type="file"
              multiple={mode !== "single"}
              onChange={onFiles}
              className="mt-1 block w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-md file:border file:bg-muted file:text-foreground hover:file:bg-muted/70"
              accept=".png,.jpg,.jpeg,.pgm,.dcm"
            />
          </div>
        </div>

        <div className="space-y-3">
          <ProgressBar value={uploadPct} label="Téléversement" />
          <ProgressBar value={processPct} label="Traitement" />
        </div>

        <Button type="submit" disabled={!canRun}>
          Lancer l’inférence
        </Button>
      </form>

      {results && (
        <div className="rounded-xl border p-6 space-y-4">
          <div className="text-sm text-muted-foreground">Résultats</div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {results.map((r, idx) => (
              <div key={`${r.filename}-${idx}`} className="rounded-lg border p-4">
                <div className="text-sm text-muted-foreground">{r.filename}</div>
                <div className="mt-1 text-lg font-semibold">{r.label}</div>
                <div className="text-sm">BI-RADS: {r.birads}</div>
                <div className="text-sm">Confiance: {(r.confidence * 100).toFixed(1)}%</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
