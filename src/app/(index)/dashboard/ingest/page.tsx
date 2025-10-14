// src/app/(index)/ingest/page.tsx
"use client";

import { useState } from "react";
import { useIngest } from "@/hooks/useIngest";
import { useIngestStore } from "@/store/ingestStore";
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

export default function Page() {
  const { run } = useIngest();
  const { loading, progressPct, lastResponse } = useIngestStore();
  const [files, setFiles] = useState<File[]>([]);
  const [runInference, setRunInference] = useState(true);
  const [persist, setPersist] = useState(true);

  const onFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files ? Array.from(e.target.files) : [];
    setFiles(f);
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!files.length) return;
    await run(files, { run_inference: runInference, persist });
    setFiles([]);
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Anonymiser</h1>

      <form onSubmit={onSubmit} className="rounded-xl border p-6 space-y-4">
        <input
          type="file"
          multiple
          onChange={onFiles}
          className="block w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-md file:border file:bg-muted file:text-foreground hover:file:bg-muted/70"
          accept=".png,.jpg,.jpeg,.bmp,.tif,.tiff,.webp,.dcm"
          disabled={loading}
        />
        <div className="flex items-center gap-6">
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={runInference} onChange={(e) => setRunInference(e.target.checked)} disabled={loading} />
            Lancer l’inférence
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={persist} onChange={(e) => setPersist(e.target.checked)} disabled={loading} />
            Enregistrer en base
          </label>
        </div>

        {loading && (
          <div className="rounded-xl border p-4 space-y-2">
            <div className="text-sm text-muted-foreground">Téléversement et traitement</div>
            <ProgressBar value={progressPct} label="Progression" />
          </div>
        )}

        <Button type="submit" disabled={loading || files.length === 0}>
          Démarrer
        </Button>
      </form>

      {lastResponse && (
        <div className="rounded-xl border p-6 space-y-4">
          <div className="text-sm text-muted-foreground">Résultats</div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-lg border p-4">
              <div className="text-xs text-muted-foreground">Photos importées</div>
              <div className="text-2xl font-semibold">{lastResponse.counts.uploaded_photos}</div>
            </div>
            <div className="rounded-lg border p-4">
              <div className="text-xs text-muted-foreground">DICOM importés</div>
              <div className="text-2xl font-semibold">{lastResponse.counts.uploaded_dicoms}</div>
            </div>
            <div className="rounded-lg border p-4">
              <div className="text-xs text-muted-foreground">PNG anonymisés</div>
              <div className="text-2xl font-semibold">{lastResponse.counts.new_anonymized_png}</div>
            </div>
            <div className="rounded-lg border p-4">
              <div className="text-xs text-muted-foreground">Prédictions</div>
              <div className="text-2xl font-semibold">{lastResponse.counts.predictions_done}</div>
            </div>
          </div>

          <div className="text-sm font-medium">Détails</div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {lastResponse.processed.map((it, idx) => (
              <div key={idx} className="rounded-lg border p-4 space-y-2">
                <div className="text-xs text-muted-foreground">{it.original_filename}</div>
                {it.anonymized_png && <div className="text-sm break-all">{it.anonymized_png}</div>}
                {it.prediction && (
                  <div className="text-sm">
                    {it.prediction.label} • {it.prediction.birads} • {(it.prediction.confidence * 100).toFixed(1)}%
                  </div>
                )}
                {it.age_value !== undefined && (
                  <div className="text-xs text-muted-foreground">
                    Âge: {it.age_value ?? "—"} {it.age_source ? `(${it.age_source})` : ""}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
