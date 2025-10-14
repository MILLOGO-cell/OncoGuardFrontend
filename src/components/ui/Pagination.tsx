"use client";

import * as React from "react";
import clsx from "clsx";

interface SimplePaginationProps {
  onPrevPage?: () => void;
  onNextPage?: () => void;
  className?: string;
}

export default function Pagination({
  onPrevPage,
  onNextPage,
  className,
}: SimplePaginationProps) {
  return (
    <nav
      aria-label="Pagination"
      className={clsx("flex items-center justify-end gap-2", className)}
    >
      <button
        onClick={onPrevPage}
        disabled={!onPrevPage}
        className="rounded border px-3 py-1 text-sm disabled:opacity-50"
        aria-label="Page précédente"
      >
        Précédent
      </button>

      <button
        onClick={onNextPage}
        disabled={!onNextPage}
        className="rounded border px-3 py-1 text-sm disabled:opacity-50"
        aria-label="Page suivante"
      >
        Suivant
      </button>
    </nav>
  );
}
