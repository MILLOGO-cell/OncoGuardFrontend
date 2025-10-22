// src/app/(index)/loading.tsx
"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import clsx from "clsx";

type Variant = "spinner" | "skeleton-dashboard" | "skeleton-list" | "skeleton-card";

function Skeleton({ className }: { className?: string }) {
  return <div className={clsx("animate-pulse rounded-md bg-muted", className)} />;
}

function Spinner({ size = 28 }: { size?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: "spring", stiffness: 260, damping: 20 }}
      className="flex items-center justify-center"
    >
      <Loader2 size={size} className="animate-spin" />
    </motion.div>
  );
}

function SkeletonDashboard() {
  return (
    <div className="@container space-y-6">
      <div className="flex items-center justify-between">
        <Skeleton className="h-7 w-48" />
        <div className="flex gap-2">
          <Skeleton className="h-9 w-28" />
          <Skeleton className="h-9 w-40" />
        </div>
      </div>

      <div className="grid grid-cols-1 @md:grid-cols-2 @lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="p-4 rounded-xl border">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-6 w-24 mt-2" />
                <Skeleton className="h-3 w-14 mt-2" />
              </div>
              <div className="animate-pulse h-10 w-10 rounded-full bg-muted" />
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 @lg:grid-cols-3 gap-6">
        <div className="p-4 rounded-xl border @lg:col-span-2">
          <div className="flex items-center justify-between mb-4 gap-2">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-10 w-48" />
          </div>
          <Skeleton className="h-64 w-full" />
        </div>

        <div className="p-4 rounded-xl border">
          <Skeleton className="h-5 w-40 mb-4" />
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="animate-pulse h-8 w-8 rounded-full bg-muted" />
                  <div>
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-20 mt-1" />
                  </div>
                </div>
                <div className="text-right">
                  <Skeleton className="h-4 w-24 ml-auto" />
                  <Skeleton className="h-3 w-16 mt-1 ml-auto" />
                </div>
              </div>
            ))}
          </div>
          <Skeleton className="h-5 w-full mt-4" />
        </div>
      </div>

      <div className="p-4 rounded-xl border">
        <div className="flex items-center justify-between mb-4">
          <Skeleton className="h-5 w-56" />
          <Skeleton className="h-8 w-44" />
        </div>
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="grid grid-cols-12 gap-4">
              <Skeleton className="h-5 col-span-2" />
              <Skeleton className="h-5 col-span-7" />
              <Skeleton className="h-5 col-span-2" />
              <Skeleton className="h-8 col-span-1" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function SkeletonList({ rows = 6 }: { rows?: number }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Skeleton className="h-7 w-48" />
        <Skeleton className="h-9 w-32" />
      </div>
      <div className="rounded-xl border divide-y">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex items-center justify-between p-4 gap-4">
            <div className="flex items-center gap-3">
              <div className="animate-pulse h-9 w-9 rounded-full bg-muted" />
              <div>
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-3 w-28 mt-1" />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Skeleton className="h-9 w-24" />
              <Skeleton className="h-9 w-16" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SkeletonCard({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 @md:grid-cols-2 @lg:grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="p-4 rounded-xl border space-y-3">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-8 w-24" />
          <Skeleton className="h-3 w-20" />
          <div className="flex justify-end">
            <div className="animate-pulse h-10 w-10 rounded-full bg-muted" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function Loading() {
  // Choix auto selon l’URL en cours
  const pathname = usePathname();

  const variant: Variant =
    pathname?.startsWith("/dashboard/stats") || pathname === "/dashboard"
      ? "skeleton-dashboard"
      : pathname?.startsWith("/dashboard/files") ||
        pathname?.startsWith("/dashboard/tagged") ||
        pathname?.startsWith("/dashboard/inference")
      ? "skeleton-list"
      : "spinner";

  const content =
    variant === "spinner" ? (
      <Spinner />
    ) : variant === "skeleton-dashboard" ? (
      <SkeletonDashboard />
    ) : variant === "skeleton-list" ? (
      <SkeletonList />
    ) : (
      <SkeletonCard />
    );

  // Plein écran + léger overlay pour un rendu propre
  return (
    <div className={clsx("fixed inset-0 z-[60] flex items-center justify-center backdrop-blur-sm bg-background/40")}>
      <div className="max-w-6xl w-full p-6">{content}</div>
    </div>
  );
}
