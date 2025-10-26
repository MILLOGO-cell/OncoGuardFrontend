"use client";

import { useMemo, useState, useEffect, useRef } from "react";
import Image from "next/image";
import Button from "@/components/ui/Button";
import ImagePreview from "@/components/ui/ImagePreview";
import { useImageInference } from "@/hooks/useImageInference";
import { useFiles } from "@/hooks/useFiles";
import { useFilesStore } from "@/store/filesStore";
import { getPreviewUrl } from "@/lib/api/filesApi";
import type { InferenceResponse } from "@/types/imageInference";
import type { FileItem } from "@/types/files";

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

type FileSource = "computer" | "uploaded";

export default function Page() {
  const { predictOne, predictManyBatch, predictManySequential, predictFromUploadedFiles } = useImageInference();
  const { fetchList } = useFiles();
  const { items: uploadedFiles, loading: loadingFiles } = useFilesStore();

  // État pour les fichiers locaux
  const [localFiles, setLocalFiles] = useState<File[]>([]);
  const [results, setResults] = useState<InferenceTagged[] | null>(null);
  const [uploadPct, setUploadPct] = useState(0);
  const [processPct, setProcessPct] = useState(0);
  const [mode, setMode] = useState<"single" | "batch" | "sequential">("single");
  const [isRunning, setIsRunning] = useState(false);

  // État pour la source des fichiers
  const [fileSource, setFileSource] = useState<FileSource>("computer");
  const [selectedKind, setSelectedKind] = useState<"dicom" | "pgm">("dicom");
  const [selectedUploaded, setSelectedUploaded] = useState<Record<string, boolean>>({});

  const inputRef = useRef<HTMLInputElement | null>(null);
  const objectURLsRef = useRef<Map<number, string>>(new Map());

  // Charger les fichiers uploadés au montage
  useEffect(() => {
    if (fileSource === "uploaded") {
      fetchList({ kind: selectedKind, limit: 500, order: "desc" });
    }
  }, [fileSource, selectedKind, fetchList]);

  // Previews pour les fichiers locaux
  const previews = useMemo(() => {
    objectURLsRef.current.forEach((url) => URL.revokeObjectURL(url));
    objectURLsRef.current.clear();
    const map = new Map<number, string>();
    localFiles.forEach((f, idx) => {
      if (isPreviewable(f.name, f.type)) {
        const url = URL.createObjectURL(f);
        objectURLsRef.current.set(idx, url);
        map.set(idx, url);
      }
    });
    return map;
  }, [localFiles]);

  useEffect(() => {
    return () => {
      objectURLsRef.current.forEach((url) => URL.revokeObjectURL(url));
      objectURLsRef.current.clear();
    };
  }, []);

  // Fichiers uploadés sélectionnés
  const selectedUploadedFiles = useMemo(() => {
    return uploadedFiles.filter((f) => selectedUploaded[f.filename]);
  }, [uploadedFiles, selectedUploaded]);

  // Vérifier si on peut lancer l'analyse
  const canRun = useMemo(() => {
    if (fileSource === "computer") {
      return mode === "single" ? localFiles.length === 1 : localFiles.length > 0;
    } else {
      return mode === "single" ? selectedUploadedFiles.length === 1 : selectedUploadedFiles.length > 0;
    }
  }, [mode, localFiles, selectedUploadedFiles, fileSource]);

  const onLocalFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files ? Array.from(e.target.files) : [];
    setLocalFiles(f);
    setResults(null);
    setUploadPct(0);
    setProcessPct(0);
  };

  const toggleUploadedFile = (filename: string) => {
    if (mode === "single") {
      // Mode single : sélectionner uniquement ce fichier
      setSelectedUploaded({ [filename]: true });
    } else {
      // Mode multiple : toggle
      setSelectedUploaded((prev) => ({ ...prev, [filename]: !prev[filename] }));
    }
  };

  const run = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canRun || isRunning) return;
    setIsRunning(true);
    setResults(null);
    setUploadPct(0);
    setProcessPct(0);

    try {
      if (fileSource === "computer") {
        // Analyse depuis l'ordinateur
        if (mode === "single" && localFiles[0]) {
          const r = (await predictOne(localFiles[0], {
            onUploadPct: setUploadPct,
            onProcessPct: setProcessPct,
          })) as InferenceTagged;
          setResults([r]);
        } else if (mode === "batch") {
          const rr = (await predictManyBatch(localFiles, true, { onUploadPct: setUploadPct })) as InferenceTagged[];
          setResults(rr);
          setProcessPct(100);
        } else if (mode === "sequential") {
          const rr = (await predictManySequential(localFiles, true, {
            onUploadPct: setUploadPct,
            onProcessPct: setProcessPct,
          })) as InferenceTagged[];
          setResults(rr);
        }
      } else {
        // Analyse depuis fichiers uploadés
        const filenames = selectedUploadedFiles.map((f) => f.filename);

        if (mode === "single" && filenames[0]) {
          const r = await predictFromUploadedFiles(selectedKind, [filenames[0]], {
            onProcessPct: setProcessPct,
          });
          setResults(r as InferenceTagged[]);
        } else if (mode === "batch" || mode === "sequential") {
          const rr = await predictFromUploadedFiles(selectedKind, filenames, {
            onProcessPct: setProcessPct,
          });
          setResults(rr as InferenceTagged[]);
        }
        setUploadPct(100);
        setProcessPct(100);
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
      const localUrl = fileSource === "computer" ? previews.get(idx) : undefined;
      return { ...r, serverUrl, localUrl };
    });
  }, [results, previews, fileSource]);

  const translateLabel = (label: string) => {
    const lower = label.toLowerCase();
    if (lower === "benign") return "Bénin";
    if (lower === "malignant") return "Malin";
    if (lower === "normal") return "Normal";
    return label;
  };

  const openPicker = () => inputRef.current?.click();

  const fileHelperText = useMemo(() => {
    if (fileSource === "computer") {
      if (localFiles.length === 0) return "Aucun fichier sélectionné";
      if (localFiles.length === 1) return localFiles[0].name;
      return `${localFiles.length} fichiers sélectionnés`;
    } else {
      if (selectedUploadedFiles.length === 0) return "Aucun fichier sélectionné";
      if (selectedUploadedFiles.length === 1) return selectedUploadedFiles[0].filename;
      return `${selectedUploadedFiles.length} fichiers sélectionnés`;
    }
  }, [fileSource, localFiles, selectedUploadedFiles]);

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Inférence</h1>

      <form onSubmit={run} className="rounded-xl border p-6 space-y-4">
        {/* Source des fichiers */}
        <div>
          <label className="text-sm text-muted-foreground">Source des fichiers</label>
          <div className="mt-2 flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                value="computer"
                checked={fileSource === "computer"}
                onChange={(e) => {
                  setFileSource(e.target.value as FileSource);
                  setResults(null);
                  setSelectedUploaded({});
                }}
                disabled={isRunning}
              />
              <span className="text-sm">Depuis l'ordinateur</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                value="uploaded"
                checked={fileSource === "uploaded"}
                onChange={(e) => {
                  setFileSource(e.target.value as FileSource);
                  setResults(null);
                  setLocalFiles([]);
                }}
                disabled={isRunning}
              />
              <span className="text-sm">Depuis les fichiers uploadés</span>
            </label>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="text-sm text-muted-foreground">Mode d'analyse</label>
            <select
              className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
              value={mode}
              onChange={(e) => {
                setMode(e.target.value as any);
                if (e.target.value === "single") {
                  // Réinitialiser la sélection en mode single
                  setSelectedUploaded({});
                }
              }}
              disabled={isRunning}
            >
              <option value="single">Fichier unique</option>
              <option value="batch">Batch (envoi groupé)</option>
              <option value="sequential">Séquentiel (progression par image)</option>
            </select>
          </div>

          {fileSource === "uploaded" && (
            <div>
              <label className="text-sm text-muted-foreground">Type de fichiers</label>
              <select
                className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
                value={selectedKind}
                onChange={(e) => {
                  setSelectedKind(e.target.value as "dicom" | "pgm");
                  setSelectedUploaded({});
                }}
                disabled={isRunning}
              >
                <option value="dicom">DICOM</option>
                <option value="pgm">PGM</option>
              </select>
            </div>
          )}

          {fileSource === "computer" && (
            <div className="flex flex-col">
              <label className="text-sm text-muted-foreground">Choisir les fichiers</label>
              <div className="mt-1 flex items-center gap-3">
                <input
                  ref={inputRef}
                  type="file"
                  multiple={mode !== "single"}
                  onChange={onLocalFiles}
                  accept=".png,.jpg,.jpeg,.gif,.webp,.bmp,.pgm,.dcm"
                  className="hidden"
                  disabled={isRunning}
                />
                <Button type="button" variant="outline" onClick={openPicker} disabled={isRunning}>
                  Parcourir…
                </Button>
                <span className="text-sm text-muted-foreground truncate">{fileHelperText}</span>
              </div>
              <span className="mt-1 text-xs text-muted-foreground">
                Formats acceptés : PNG, JPG, JPEG, GIF, WEBP, BMP, PGM, DCM
              </span>
            </div>
          )}
        </div>

        {/* Liste des fichiers uploadés */}
        {fileSource === "uploaded" && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm text-muted-foreground">
                Fichiers disponibles ({uploadedFiles.length})
              </label>
              {selectedUploadedFiles.length > 0 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedUploaded({})}
                  disabled={isRunning}
                >
                  Tout désélectionner
                </Button>
              )}
            </div>

            <div className="border rounded-lg p-4 max-h-64 overflow-y-auto">
              {loadingFiles ? (
                <div className="text-center py-4 text-sm text-muted-foreground">Chargement...</div>
              ) : uploadedFiles.length === 0 ? (
                <div className="text-center py-4 text-sm text-muted-foreground">
                  Aucun fichier {selectedKind === "dicom" ? "DICOM" : "PGM"} disponible.
                  <br />
                  Uploadez des fichiers depuis la page Fichiers.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {uploadedFiles.map((file) => {
                    const previewUrl = getPreviewUrl(selectedKind, file.filename); // ← PNG généré côté API
                    const checked = !!selectedUploaded[file.filename];

                    return (
                      <label
                        key={file.filename}
                        className={`flex items-start gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${checked ? "bg-blue-50 border-blue-500" : "hover:bg-gray-50"
                          }`}
                      >
                        <input
                          type={mode === "single" ? "radio" : "checkbox"}
                          checked={checked}
                          onChange={() => toggleUploadedFile(file.filename)}
                          disabled={isRunning}
                          className="mt-1"
                        />

                        {/* vignette */}
                        <div className="shrink-0">
                          <ImagePreview
                            kind={selectedKind}
                            filename={file.filename}
                            previewUrl={previewUrl}
                            className="w-24 h-20"
                            fit="contain"
                            unoptimized
                          />
                        </div>

                        {/* méta */}
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium truncate">{file.filename}</div>
                          <div className="text-xs text-muted-foreground">
                            {(file.size_bytes / 1024).toFixed(1)} Ko
                          </div>
                        </div>
                      </label>
                    );
                  })}

                </div>
              )}
            </div>
          </div>
        )}

        <div className="space-y-3">
          <ProgressBar value={uploadPct} label="Téléversement" />
          <ProgressBar value={processPct} label="Traitement" />
        </div>

        <Button type="submit" disabled={!canRun || isRunning} isLoading={isRunning}>
          Lancer l'analyse
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