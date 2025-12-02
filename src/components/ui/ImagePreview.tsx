"use client";

import { useState } from "react";
import Image from "next/image";

interface ImagePreviewProps {
  kind: "dicom" | "pgm" | "png" | "tagged";
  filename: string;
  previewUrl: string;
  className?: string;
  fit?: "cover" | "contain";
  unoptimized?: boolean;
  blurDataURL?: string;
}

export default function ImagePreview({
  kind,
  filename,
  previewUrl,
  className = "",
  fit = "cover",
  blurDataURL,
}: ImagePreviewProps) {
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  if (error) {
    return (
      <div className={`grid place-items-center bg-muted rounded ${className}`}>
        <div className="text-center space-y-2 p-4">
          <div className="text-xs text-muted-foreground">
            {kind === "dicom" ? "DICOM" : kind === "pgm" ? "PGM" : kind === "tagged" ? "Annotée" : "PNG"}
          </div>
          <div className="text-xs text-red-500">Aperçu indisponible</div>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative rounded overflow-hidden bg-muted ${className}`}>
      {loading && (
        <div className="absolute inset-0 grid place-items-center">
          <div className="text-xs text-muted-foreground">Chargement...</div>
        </div>
      )}

      <Image
        src={previewUrl}
        alt={filename}
        fill
        className={fit === "cover" ? "object-cover" : "object-contain"}
        sizes="100vw"
        placeholder={blurDataURL ? "blur" : "empty"}
        blurDataURL={blurDataURL}
        unoptimized
        onLoadingComplete={() => setLoading(false)}
        onError={() => {
          setError(true);
          setLoading(false);
        }}
        priority={true}
      />
    </div>
  );
}