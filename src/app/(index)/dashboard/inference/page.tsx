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
        <div className="h-2 bg-primary transition-all" style={{ width: `${pct}%` }} />
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

type FileSource = "computer" | "uploaded";

function extractBiradsInfo(resultClass: string | null) {
  if (!resultClass) return { label: "Inconnu", birads: "BI-RADS 0" };
  
  const parts = resultClass.split(" - ");
  const biradsCode = parts[0] || "0";
  const description = parts[1] || "Inconnu";
  
  return {
    label: description,
    birads: `BI-RADS ${biradsCode}`,
  };
}

function translateLabel(label: string) {
  const lower = label.toLowerCase();
  if (lower === "bénin" || lower === "benign") return "Bénin";
  if (lower === "malin" || lower === "malignant") return "Malin";
  if (lower === "normal") return "Normal";
  if (lower === "probablement bénin") return "Probablement bénin";
  if (lower === "suspicion faible") return "Suspicion faible";
  if (lower === "suspicion intermédiaire") return "Suspicion intermédiaire";
  if (lower === "suspicion forte") return "Suspicion forte";
  if (lower === "évocateur de cancer") return "Évocateur de cancer";
  if (lower === "cancer prouvé") return "Cancer prouvé";
  return label;
}

export default function Page() {
  const { predictOne, predictManyBatch, predictManySequential, predictFromUploadedFiles } = useImageInference();
  const { fetchList } = useFiles();
  const { items: uploadedFiles, loading: loadingFiles } = useFilesStore();

  const [localFiles, setLocalFiles] = useState<File[]>([]);
  const [results, setResults] = useState<InferenceResponse[] | null>(null);
  const [uploadPct, setUploadPct] = useState(0);
  const [processPct, setProcessPct] = useState(0);
  const [mode, setMode] = useState<"single" | "batch" | "sequential">("single");
  const [isRunning, setIsRunning] = useState(false);
  const [patientId, setPatientId] = useState<string>("");

  const [fileSource, setFileSource] = useState<FileSource>("computer");
  const [selectedKind, setSelectedKind] = useState<"dicom" | "pgm">("dicom");
  const [selectedUploaded, setSelectedUploaded] = useState<Record<string, boolean>>({});

  const inputRef = useRef<HTMLInputElement | null>(null);
  const objectURLsRef = useRef<Map<number, string>>(new Map());

  useEffect(() => {
    if (fileSource === "uploaded") {
      fetchList({ kind: selectedKind, limit: 500, order: "desc" });
    }
  }, [fileSource, selectedKind, fetchList]);

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

  const selectedUploadedFiles = useMemo(() => {
    return uploadedFiles.filter((f) => selectedUploaded[f.filename]);
  }, [uploadedFiles, selectedUploaded]);

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
      setSelectedUploaded({ [filename]: true });
    } else {
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

    const payload = patientId ? { patient_id: parseInt(patientId, 10) } : undefined;

    try {
      if (fileSource === "computer") {
        if (mode === "single" && localFiles[0]) {
          const r = await predictOne(localFiles[0], payload, {
            onUploadPct: setUploadPct,
            onProcessPct: setProcessPct,
          });
          setResults([r]);
        } else if (mode === "batch") {
          const rr = await predictManyBatch(localFiles, payload, {
            onUploadPct: setUploadPct,
          });
          setResults(rr);
          setProcessPct(100);
        } else if (mode === "sequential") {
          const rr = await predictManySequential(localFiles, payload, {
            onUploadPct: setUploadPct,
            onProcessPct: setProcessPct,
          });
          setResults(rr);
        }
      } else {
        const filenames = selectedUploadedFiles.map((f) => f.filename);

        if (mode === "single" && filenames[0]) {
          const r = await predictFromUploadedFiles(selectedKind, [filenames[0]], {
            onProcessPct: setProcessPct,
          });
          setResults(r);
        } else if (mode === "batch" || mode === "sequential") {
          const rr = await predictFromUploadedFiles(selectedKind, filenames, {
            onProcessPct: setProcessPct,
          });
          setResults(rr);
        }
        setUploadPct(100);
        setProcessPct(100);
      }
    } catch (error) {
      console.error("Erreur lors de l'analyse:", error);
    } finally {
      setIsRunning(false);
    }
  };

  const paired = useMemo(() => {
    if (!results) return [];
    return results.map((r, idx) => {
      const { label, birads } = extractBiradsInfo(r.result_class);
      const localUrl = fileSource === "computer" ? previews.get(idx) : undefined;
      const uploadedFileUrl =
        fileSource === "uploaded"
          ? getPreviewUrl(selectedKind, r.filename)
          : undefined;
      
      return {
        ...r,
        label,
        birads,
        localUrl,
        uploadedFileUrl,
      };
    });
  }, [results, previews, fileSource, selectedKind]);

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

          <div>
            <label className="text-sm text-muted-foreground">ID Patient (optionnel)</label>
            <input
              type="number"
              className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
              placeholder="Ex: 12345"
              value={patientId}
              onChange={(e) => setPatientId(e.target.value)}
              disabled={isRunning}
            />
          </div>
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
                    const previewUrl = getPreviewUrl(selectedKind, file.filename);
                    const checked = !!selectedUploaded[file.filename];

                    return (
                      <label
                        key={file.filename}
                        className={`flex items-start gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                          checked ? "bg-blue-50 border-blue-500" : "hover:bg-gray-50"
                        }`}
                      >
                        <input
                          type={mode === "single" ? "radio" : "checkbox"}
                          checked={checked}
                          onChange={() => toggleUploadedFile(file.filename)}
                          disabled={isRunning}
                          className="mt-1"
                        />

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
          <div className="text-sm text-muted-foreground">Résultats ({results.length})</div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {paired.map((r, idx) => (
              <div key={`${r.filename}-${idx}`} className="rounded-lg border p-4 space-y-3">
                {r.localUrl ? (
                  <div className="relative aspect-[4/3] w-full overflow-hidden rounded-md bg-muted">
                    <Image
                      src={r.localUrl}
                      alt={r.filename}
                      fill
                      className="object-contain"
                      sizes="(max-width: 768px) 100vw, 33vw"
                      unoptimized
                    />
                  </div>
                ) : r.uploadedFileUrl ? (
                  <div className="relative aspect-[4/3] w-full overflow-hidden rounded-md bg-muted">
                    <Image
                      src={r.uploadedFileUrl}
                      alt={r.filename}
                      fill
                      className="object-contain"
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
                  <div className="text-sm">{r.birads}</div>
                  {r.confidence !== null && (
                    <div className="text-sm">Confiance : {(r.confidence * 100).toFixed(1)}%</div>
                  )}
                  <div className="text-xs text-muted-foreground">
                    Statut : {r.status}
                  </div>
                  {r.patient_id && (
                    <div className="text-xs text-muted-foreground">
                      Patient ID : {r.patient_id}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}