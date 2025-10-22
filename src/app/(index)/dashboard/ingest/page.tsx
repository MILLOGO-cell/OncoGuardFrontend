// src/app/(index)/ingest/page.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import Button from "@/components/ui/Button";
import { Checkbox } from "@/components/ui/Checkbox";
import { useIngest } from "@/hooks/useIngest";
import { useIngestStore } from "@/store/ingestStore";
import Image from "next/image";

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

type PreviewItem = {
  file: File;
  url: string | null;
  type: "image" | "dicom" | "autre";
};

const ACCEPT = ".png,.jpg,.jpeg,.bmp,.tif,.tiff,.webp,.dcm";

function toPreviewItem(file: File): PreviewItem {
  const ext = file.name.toLowerCase().split(".").pop() || "";
  const isDicom = ext === "dcm";
  const isImage =
    ["png", "jpg", "jpeg", "bmp", "tif", "tiff", "webp"].includes(ext) ||
    file.type.startsWith("image/");
  return {
    file,
    url: isImage ? URL.createObjectURL(file) : null,
    type: isDicom ? "dicom" : isImage ? "image" : "autre",
  };
}

export default function Page() {
  const { run } = useIngest();
  const { loading, progressPct, lastResponse } = useIngestStore();

  const [files, setFiles] = useState<PreviewItem[]>([]);
  const [runInference, setRunInference] = useState(true);
  const [persist, setPersist] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  useEffect(() => {
    return () => {
      files.forEach((p) => p.url && URL.revokeObjectURL(p.url));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const totalCount = files.length;
  const imageCount = files.filter((f) => f.type === "image").length;
  const dicomCount = files.filter((f) => f.type === "dicom").length;

  const onPickClick = () => inputRef.current?.click();

  const addFiles = (picked: FileList | File[]) => {
    setErrorMsg(null);
    const list = Array.from(picked || []);
    if (!list.length) {
      setErrorMsg("Aucun fichier sélectionné.");
      return;
    }
    const acceptedExts = ACCEPT.replace(/\s/g, "")
      .split(",")
      .map((s) => s.replace(".", "").toLowerCase());

    const valid: File[] = [];
    const rejected: File[] = [];

    list.forEach((f) => {
      const ext = (f.name.split(".").pop() || "").toLowerCase();
      const ok =
        acceptedExts.includes(ext) ||
        (f.type && (f.type.startsWith("image/") || f.type.includes("dicom")));
      if (ok) valid.push(f);
      else rejected.push(f);
    });

    if (rejected.length) {
      setErrorMsg(`Certains fichiers ont été ignorés. Formats acceptés : ${ACCEPT}`);
    }

    setFiles((prev) => [...prev, ...valid.map((f) => toPreviewItem(f))]);
  };

  const onFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files;
    if (f && f.length) addFiles(f);
    e.target.value = "";
  };

  const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    if (e.dataTransfer?.files?.length) addFiles(e.dataTransfer.files);
  };

  const onDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const onDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const removeFile = (index: number) => {
    setFiles((prev) => {
      const copy = [...prev];
      const it = copy[index];
      if (it?.url) URL.revokeObjectURL(it.url);
      copy.splice(index, 1);
      return copy;
    });
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    if (!files.length) {
      setErrorMsg("Sélectionnez au moins un fichier avant de démarrer.");
      return;
    }
    await run(
      files.map((f) => f.file),
      { run_inference: runInference, persist }
    );
  };

  const hasSelected = files.length > 0;

  const generatedItems =
    lastResponse?.processed.filter((it) => it.anonymized_png) ?? [];

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Anonymisation & Prédiction</h1>

      <form onSubmit={onSubmit} className="rounded-xl border p-6 space-y-5">
        <div
          onDrop={onDrop}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          role="button"
          tabIndex={0}
          onClick={onPickClick}
          onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onPickClick()}
          className={[
            "rounded-lg border-2 border-dashed p-6 transition-colors cursor-pointer",
            isDragOver ? "border-primary bg-primary/5" : "border-muted-foreground/30",
          ].join(" ")}
          aria-label="Zone de dépôt des fichiers"
        >
          <div className="text-center space-y-2">
            <div className="text-sm font-medium">
              Glissez-déposez vos fichiers DICOM ou images ici
            </div>
            <div className="text-xs text-muted-foreground">
              ou cliquez pour parcourir vos fichiers (formats acceptés : {ACCEPT})
            </div>
          </div>
          <input
            ref={inputRef}
            type="file"
            multiple
            onChange={onFiles}
            accept={ACCEPT}
            disabled={loading}
            className="hidden"
          />
        </div>

        <div className="text-sm">
          {hasSelected ? (
            <div className="text-muted-foreground">
              {totalCount} fichier(s) sélectionné(s) — {imageCount} image(s), {dicomCount} DICOM
            </div>
          ) : (
            <div className="text-muted-foreground">Aucun fichier sélectionné.</div>
          )}
        </div>

        {hasSelected && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {files.map((p, idx) => (
              <div key={idx} className="rounded-lg border p-3 space-y-2">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="truncate text-sm font-medium">{p.file.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {(p.file.size / 1024 / 1024).toFixed(2)} Mo • {p.type.toUpperCase()}
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => removeFile(idx)}
                    disabled={loading}
                  >
                    Retirer
                  </Button>
                </div>
                {p.url ? (
                  <div className="aspect-square overflow-hidden rounded-md bg-muted">
                    <img src={p.url} alt={p.file.name} className="h-full w-full object-contain" />
                  </div>
                ) : (
                  <div className="text-xs text-muted-foreground">
                    Aperçu non disponible
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        <div className="flex flex-wrap items-center gap-6 pt-2">
          <Checkbox
            checked={runInference}
            onCheckedChange={(v) => setRunInference(Boolean(v))}
            label="Lancer l’inférence"
            disabled={loading}
          />
          <Checkbox
            checked={persist}
            onCheckedChange={(v) => setPersist(Boolean(v))}
            label="Enregistrer en base"
            disabled={loading}
          />
        </div>

        {loading && (
          <div className="rounded-xl border p-4 space-y-2">
            <div className="text-sm text-muted-foreground">
              Téléversement et traitement en cours…
            </div>
            <ProgressBar value={progressPct} label="Progression" />
          </div>
        )}

        {errorMsg && <div className="text-sm text-red-500">{errorMsg}</div>}

        <div className="pt-2">
          <Button type="submit" disabled={loading || !hasSelected}>
            Démarrer l’anonymisation
          </Button>
        </div>
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

          <div className="text-sm font-medium">Images anonymisées</div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {generatedItems.map((it, idx) => (
              <div key={idx} className="rounded-lg border p-4 space-y-3">
                {it.anonymized_png && (
                  <div className="aspect-square overflow-hidden rounded-md bg-muted relative">
                    <Image
                      src={it.prediction?.tagged_url || it.anonymized_png}
                      alt={it.anonymized_image_id || it.original_filename || "Image anonymisée"}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-contain"
                    />
                  </div>
                )}
                {it.prediction && (
                  <div className="text-sm">
                    <span className="font-medium">{it.prediction.label}</span> • {it.prediction.birads} •{" "}
                    {(it.prediction.confidence * 100).toFixed(1)}%
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
