// components/ImagePreview.tsx
"use client";

import { useState } from "react";
import Image from "next/image";

interface ImagePreviewProps {
  kind: "dicom" | "pgm";
  filename: string;
  previewUrl: string;
  className?: string;
  /** "cover" remplit toute la surface (peut recadrer) ; "contain" garde tout l'image visible */
  fit?: "cover" | "contain";
  /** Optionnel: active next/image non optimisée si l'URL n'est pas dans images.domains */
  unoptimized?: boolean;
  /** Optionnel: blur placeholder */
  blurDataURL?: string;
}

export default function ImagePreview({
  kind,
  filename,
  previewUrl,
  className = "",
  fit = "cover",
  unoptimized,
  blurDataURL,
}: ImagePreviewProps) {
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  if (error) {
    return (
      <div className={`grid place-items-center bg-muted rounded ${className}`}>
        <div className="text-center space-y-2 p-4">
          <div className="text-xs text-muted-foreground">
            {kind === "dicom" ? "DICOM" : "PGM"}
          </div>
          <div className="text-xs text-red-500">Aperçu indisponible</div>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative rounded overflow-hidden bg-muted ${className}`}>
      {/* Le parent doit avoir une hauteur. Ex: h-64, aspect-[4/3], h-full, etc. */}
      {loading && (
        <div className="absolute inset-0 grid place-items-center">
          <div className="text-xs text-muted-foreground">Chargement...</div>
        </div>
      )}

      <Image
        src={previewUrl}
        alt={filename}
        // Remplit le conteneur
        fill
        // Tailwind pour l'ajustement
        className={fit === "cover" ? "object-cover" : "object-contain"}
        // Important pour le responsive fill
        sizes="100vw"
        // Placeholder optionnel
        placeholder={blurDataURL ? "blur" : "empty"}
        blurDataURL={blurDataURL}
        // Si le domaine n'est pas autorisé dans next.config.js
        unoptimized={unoptimized}
        // Événements
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
