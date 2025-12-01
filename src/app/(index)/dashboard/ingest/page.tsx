"use client";

import { useEffect, useRef, useState } from "react";
import Button from "@/components/ui/Button";
import Image from "next/image";

function ProgressBar({ value, label }: { value: number; label: string }) {
  const v = Math.max(0, Math.min(100, value));
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-gray-700">{label}</span>
        <span className="text-gray-500">{v}%</span>
      </div>
      <div className="h-2.5 w-full rounded-full bg-gray-200 overflow-hidden">
        <div
          className="h-full bg-blue-600 transition-all duration-300 ease-out"
          style={{ width: `${v}%` }}
        />
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
  const [files, setFiles] = useState<PreviewItem[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  useEffect(() => {
    return () => {
      files.forEach((p) => p.url && URL.revokeObjectURL(p.url));
    };
  }, [files]);

  const totalCount = files.length;
  const imageCount = files.filter((f) => f.type === "image").length;
  const dicomCount = files.filter((f) => f.type === "dicom").length;

  const onPickClick = () => inputRef.current?.click();

  const addFiles = (picked: FileList | File[]) => {
    setErrorMsg(null);
    setSuccessMsg(null);
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

  const clearAll = () => {
    files.forEach((p) => p.url && URL.revokeObjectURL(p.url));
    setFiles([]);
    setErrorMsg(null);
    setSuccessMsg(null);
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!files.length) {
      setErrorMsg("Sélectionnez au moins un fichier avant de continuer.");
      return;
    }

    setSuccessMsg(`${files.length} fichier${files.length > 1 ? "s" : ""} prêt${files.length > 1 ? "s" : ""} pour le traitement.`);
  };

  const hasSelected = files.length > 0;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Import de fichiers</h1>
          <p className="mt-2 text-gray-600">
            Importez vos images mammographiques et fichiers DICOM pour analyse
          </p>
        </div>

        <form onSubmit={onSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 space-y-6">
          <div
            onDrop={onDrop}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            className={`rounded-xl border-2 border-dashed p-12 transition-all ${isDragOver
                ? "border-blue-500 bg-blue-50 scale-[1.02]"
                : "border-gray-300 hover:border-blue-400 hover:bg-blue-50/50"
              }`}
          >
            <div className="flex flex-col items-center justify-center text-center space-y-4">
              <div className={`p-4 rounded-full ${isDragOver ? "bg-blue-100" : "bg-gray-100"}`}>
                <svg
                  className={`w-12 h-12 ${isDragOver ? "text-blue-600" : "text-gray-400"}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                  />
                </svg>
              </div>
              <div>
                <p className="text-base font-semibold text-gray-900">
                  Glissez-déposez vos fichiers ici
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  ou{" "}
                  <button
                    type="button"
                    onClick={onPickClick}
                    className="text-blue-600 hover:text-blue-700 font-medium underline focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded"
                  >
                    cliquez pour parcourir
                  </button>
                </p>
              </div>
              <div className="text-xs text-gray-500">
                Formats acceptés : PNG, JPG, JPEG, BMP, TIFF, WEBP, DICOM
              </div>
            </div>
            <input
              ref={inputRef}
              type="file"
              multiple
              onChange={onFiles}
              accept={ACCEPT}
              className="hidden"
              aria-label="Sélectionner des fichiers"
            />
          </div>

          {hasSelected && (
            <div className="bg-gray-50 rounded-xl p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="text-sm font-semibold text-gray-700">
                  {totalCount} fichier{totalCount > 1 ? "s" : ""} sélectionné{totalCount > 1 ? "s" : ""}
                  <span className="text-gray-500 font-normal ml-2">
                    ({imageCount} image{imageCount > 1 ? "s" : ""}, {dicomCount} DICOM)
                  </span>
                </div>
                <button
                  type="button"
                  onClick={clearAll}
                  className="text-sm text-red-600 hover:text-red-700 font-medium"
                >
                  Tout effacer
                </button>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {files.map((p, idx) => (
                  <div
                    key={idx}
                    className="bg-white rounded-lg border border-gray-200 p-4 space-y-3 hover:shadow-md transition-shadow"
                  >
                    {p.url ? (
                      <div className="aspect-square overflow-hidden rounded-lg bg-gray-100">
                        <img
                          src={p.url}
                          alt={p.file.name}
                          className="h-full w-full object-contain"
                        />
                      </div>
                    ) : (
                      <div className="aspect-square overflow-hidden rounded-lg bg-gray-100 flex items-center justify-center">
                        <div className="text-center p-4">
                          <svg
                            className="w-12 h-12 text-gray-400 mx-auto mb-2"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                            />
                          </svg>
                          <p className="text-xs text-gray-500">DICOM</p>
                        </div>
                      </div>
                    )}

                    <div className="space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <div className="truncate text-sm font-medium text-gray-900">
                            {p.file.name}
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-gray-500">
                              {(p.file.size / 1024 / 1024).toFixed(2)} Mo
                            </span>
                            <span className={`px-2 py-0.5 text-xs font-semibold rounded ${p.type === "image"
                                ? "bg-green-100 text-green-700"
                                : p.type === "dicom"
                                  ? "bg-blue-100 text-blue-700"
                                  : "bg-gray-100 text-gray-700"
                              }`}>
                              {p.type.toUpperCase()}
                            </span>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeFile(idx)}
                          className="text-gray-400 hover:text-red-600 transition-colors"
                          aria-label="Supprimer"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {errorMsg && (
            <div className="rounded-lg bg-red-50 border border-red-200 p-4">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-red-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <p className="text-sm text-red-800">{errorMsg}</p>
              </div>
            </div>
          )}

          {successMsg && (
            <div className="rounded-lg bg-green-50 border border-green-200 p-4">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-green-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <p className="text-sm text-green-800">{successMsg}</p>
              </div>
            </div>
          )}

          <Button
            type="submit"
            disabled={!hasSelected}
            className="w-full py-3 text-base font-semibold"
          >
            Valider la sélection ({totalCount})
          </Button>
        </form>

        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
          <div className="flex items-start gap-4">
            <div className="p-2 bg-blue-100 rounded-lg">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-blue-900 mb-1">
                Information
              </h3>
              <p className="text-sm text-blue-800">
                Les fichiers sélectionnés seront disponibles pour analyse sur la page <strong>Inférence</strong>.
                Cette étape permet uniquement de valider votre sélection avant le traitement.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}