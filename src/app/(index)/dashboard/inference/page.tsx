"use client";

import { useMemo, useState, useEffect, useRef } from "react";
import Image from "next/image";
import Button from "@/components/ui/Button";
import { useImageInference } from "@/hooks/useImageInference";
import type { InferenceResponse } from "@/types/imageInference";

function ProgressBar({ value, label }: { value: number; label: string }) {
  const pct = Math.max(0, Math.min(100, value));
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-gray-700">{label}</span>
        <span className="text-gray-500">{pct}%</span>
      </div>
      <div className="h-2.5 w-full rounded-full bg-gray-200 overflow-hidden">
        <div 
          className="h-full bg-blue-600 transition-all duration-300 ease-out" 
          style={{ width: `${pct}%` }} 
        />
      </div>
    </div>
  );
}

const IMAGE_EXT = ["png", "jpg", "jpeg", "gif", "webp", "bmp"];
function isPreviewable(name: string, type?: string) {
  const ext = name.split(".").pop()?.toLowerCase() || "";
  return type?.startsWith("image/") || IMAGE_EXT.includes(ext);
}

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

function getBiradsColor(birads: string) {
  if (birads.includes("0")) return "bg-gray-100 text-gray-700 border-gray-300";
  if (birads.includes("1") || birads.includes("2")) return "bg-green-100 text-green-700 border-green-300";
  if (birads.includes("3")) return "bg-yellow-100 text-yellow-700 border-yellow-300";
  if (birads.includes("4")) return "bg-orange-100 text-orange-700 border-orange-300";
  if (birads.includes("5") || birads.includes("6")) return "bg-red-100 text-red-700 border-red-300";
  return "bg-gray-100 text-gray-700 border-gray-300";
}

export default function Page() {
  const { predictOne, predictManySequential } = useImageInference();

  const [localFiles, setLocalFiles] = useState<File[]>([]);
  const [results, setResults] = useState<InferenceResponse[] | null>(null);
  const [uploadPct, setUploadPct] = useState(0);
  const [processPct, setProcessPct] = useState(0);
  const [mode, setMode] = useState<"single" | "sequential">("single");
  const [isRunning, setIsRunning] = useState(false);

  const inputRef = useRef<HTMLInputElement | null>(null);
  const objectURLsRef = useRef<Map<number, string>>(new Map());

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

  const canRun = useMemo(() => {
    return mode === "single" ? localFiles.length === 1 : localFiles.length > 0;
  }, [mode, localFiles]);

  const onLocalFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files ? Array.from(e.target.files) : [];
    setLocalFiles(f);
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
      if (mode === "single" && localFiles[0]) {
        const r = await predictOne(localFiles[0], undefined, {
          onUploadPct: setUploadPct,
          onProcessPct: setProcessPct,
        });
        setResults([r]);
      } else if (mode === "sequential") {
        const rr = await predictManySequential(localFiles, undefined, {
          onUploadPct: setUploadPct,
          onProcessPct: setProcessPct,
        });
        setResults(rr);
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
      const localUrl = previews.get(idx);
      
      return {
        ...r,
        label,
        birads,
        localUrl,
      };
    });
  }, [results, previews]);

  const openPicker = () => inputRef.current?.click();

  const fileHelperText = useMemo(() => {
    if (localFiles.length === 0) return "Aucun fichier sélectionné";
    if (localFiles.length === 1) return localFiles[0].name;
    return `${localFiles.length} fichiers sélectionnés`;
  }, [localFiles]);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analyse d'images mammographiques</h1>
          <p className="mt-2 text-gray-600">
            Utilisez l'IA pour détecter les anomalies et obtenir une classification BI-RADS
          </p>
        </div>

        <form onSubmit={run} className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Mode d'analyse
            </label>
            <div className="grid grid-cols-2 gap-4">
              <label className={`relative flex items-center justify-center p-4 border-2 rounded-xl cursor-pointer transition-all ${
                mode === "single" 
                  ? "border-blue-600 bg-blue-50" 
                  : "border-gray-200 hover:border-gray-300"
              }`}>
                <input
                  type="radio"
                  value="single"
                  checked={mode === "single"}
                  onChange={(e) => setMode(e.target.value as "single")}
                  disabled={isRunning}
                  className="sr-only"
                />
                <div className="text-center">
                  <div className="text-base font-semibold text-gray-900">Fichier unique</div>
                  <div className="text-xs text-gray-500 mt-1">Analyse rapide d'une image</div>
                </div>
              </label>

              <label className={`relative flex items-center justify-center p-4 border-2 rounded-xl cursor-pointer transition-all ${
                mode === "sequential" 
                  ? "border-blue-600 bg-blue-50" 
                  : "border-gray-200 hover:border-gray-300"
              }`}>
                <input
                  type="radio"
                  value="sequential"
                  checked={mode === "sequential"}
                  onChange={(e) => setMode(e.target.value as "sequential")}
                  disabled={isRunning}
                  className="sr-only"
                />
                <div className="text-center">
                  <div className="text-base font-semibold text-gray-900">Analyse multiple</div>
                  <div className="text-xs text-gray-500 mt-1">Progression par image</div>
                </div>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Sélectionner les fichiers
            </label>
            <div className="space-y-3">
              <input
                ref={inputRef}
                type="file"
                multiple={mode !== "single"}
                onChange={onLocalFiles}
                accept=".png,.jpg,.jpeg,.gif,.webp,.bmp,.pgm,.dcm"
                className="hidden"
                disabled={isRunning}
              />
              <button
                type="button"
                onClick={openPicker}
                disabled={isRunning}
                className="w-full px-6 py-4 border-2 border-dashed border-gray-300 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="flex flex-col items-center justify-center text-center">
                  <svg className="w-12 h-12 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <span className="text-sm font-medium text-gray-700">
                    {localFiles.length > 0 ? fileHelperText : "Cliquez pour parcourir vos fichiers"}
                  </span>
                  <span className="text-xs text-gray-500 mt-1">
                    PNG, JPG, JPEG, GIF, WEBP, BMP, PGM, DICOM
                  </span>
                </div>
              </button>

              {localFiles.length > 0 && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">
                      {localFiles.length} fichier{localFiles.length > 1 ? "s" : ""} sélectionné{localFiles.length > 1 ? "s" : ""}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setLocalFiles([]);
                        setResults(null);
                      }}
                      disabled={isRunning}
                      className="text-sm text-red-600 hover:text-red-700 font-medium disabled:opacity-50"
                    >
                      Effacer
                    </button>
                  </div>
                  <div className="space-y-1">
                    {localFiles.slice(0, 5).map((f, idx) => (
                      <div key={idx} className="text-xs text-gray-600 truncate">
                        {f.name}
                      </div>
                    ))}
                    {localFiles.length > 5 && (
                      <div className="text-xs text-gray-500 italic">
                        ... et {localFiles.length - 5} autre{localFiles.length - 5 > 1 ? "s" : ""}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {isRunning && (
            <div className="space-y-4 bg-gray-50 rounded-xl p-6">
              <ProgressBar value={uploadPct} label="Téléversement" />
              <ProgressBar value={processPct} label="Analyse en cours" />
            </div>
          )}

          <Button 
            type="submit" 
            disabled={!canRun || isRunning} 
            isLoading={isRunning}
            className="w-full py-3 text-base font-semibold"
          >
            {isRunning ? "Analyse en cours..." : "Lancer l'analyse"}
          </Button>
        </form>

        {results && results.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">
                Résultats de l'analyse
              </h2>
              <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm font-semibold rounded-full">
                {results.length} résultat{results.length > 1 ? "s" : ""}
              </span>
            </div>

            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {paired.map((r, idx) => (
                <div 
                  key={`${r.filename}-${idx}`} 
                  className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-shadow"
                >
                  {r.localUrl ? (
                    <div className="relative aspect-[4/3] w-full bg-gray-100">
                      <Image
                        src={r.localUrl}
                        alt={r.filename}
                        fill
                        className="object-contain"
                        sizes="(max-width: 768px) 100vw, 33vw"
                        unoptimized
                      />
                    </div>
                  ) : (
                    <div className="aspect-[4/3] w-full bg-gray-100 flex items-center justify-center">
                      <span className="text-xs text-gray-400">Aperçu indisponible</span>
                    </div>
                  )}

                  <div className="p-4 space-y-3">
                    <div className="text-sm text-gray-500 truncate font-medium">
                      {r.filename}
                    </div>

                    <div className="space-y-2">
                      <div className="text-lg font-bold text-gray-900">
                        {translateLabel(r.label)}
                      </div>
                      
                      <div className={`inline-block px-3 py-1 rounded-lg text-sm font-semibold border ${getBiradsColor(r.birads)}`}>
                        {r.birads}
                      </div>
                    </div>

                    {r.confidence !== null && (
                      <div className="pt-3 border-t border-gray-100">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Niveau de confiance</span>
                          <span className="font-semibold text-gray-900">
                            {(r.confidence * 100).toFixed(1)}%
                          </span>
                        </div>
                        <div className="mt-2 h-2 w-full rounded-full bg-gray-200 overflow-hidden">
                          <div 
                            className="h-full bg-blue-600 transition-all" 
                            style={{ width: `${(r.confidence * 100)}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}