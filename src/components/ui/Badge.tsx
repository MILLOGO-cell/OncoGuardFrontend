"use client";

import { ReactNode } from "react";

export interface BadgeProps {
  children: ReactNode;
  tone?: "green" | "amber" | "rose" | "blue" | "slate" | "violet" | "purple" | "red";
  variant?: "default" | "outline";
  className?: string;
}

export default function Badge({
  children,
  tone = "slate",
  variant = "default",
  className = "",
}: BadgeProps) {
  const tones: Record<string, { default: string; outline: string }> = {
    green: {
      default: "bg-green-50 text-green-700 dark:bg-green-950/30 dark:text-green-400",
      outline: "border border-green-200 text-green-700 dark:border-green-800 dark:text-green-400",
    },
    amber: {
      default: "bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400",
      outline: "border border-amber-200 text-amber-700 dark:border-amber-800 dark:text-amber-400",
    },
    rose: {
      default: "bg-rose-50 text-rose-700 dark:bg-rose-950/30 dark:text-rose-400",
      outline: "border border-rose-200 text-rose-700 dark:border-rose-800 dark:text-rose-400",
    },
    red: {
      default: "bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-400",
      outline: "border border-red-200 text-red-700 dark:border-red-800 dark:text-red-400",
    },
    blue: {
      default: "bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400",
      outline: "border border-blue-200 text-blue-700 dark:border-blue-800 dark:text-blue-400",
    },
    violet: {
      default: "bg-violet-50 text-violet-700 dark:bg-violet-950/30 dark:text-violet-400",
      outline: "border border-violet-200 text-violet-700 dark:border-violet-800 dark:text-violet-400",
    },
    purple: {
      default: "bg-purple-50 text-purple-700 dark:bg-purple-950/30 dark:text-purple-400",
      outline: "border border-purple-200 text-purple-700 dark:border-purple-800 dark:text-purple-400",
    },
    slate: {
      default: "bg-slate-100 text-slate-700 dark:bg-slate-800/50 dark:text-slate-300",
      outline: "border border-slate-200 text-slate-700 dark:border-slate-700 dark:text-slate-300",
    },
  };

  const toneClasses = tones[tone]?.[variant] || tones.slate[variant];

  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${toneClasses} ${className}`}
    >
      {children}
    </span>
  );
}