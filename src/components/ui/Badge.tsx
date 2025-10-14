"use client";

export default function Badge({
  children,
  tone = "slate",
}: {
  children: React.ReactNode;
  tone?: "green" | "amber" | "rose" | "blue" | "slate" | "violet";
}) {
  const tones: Record<string, string> = {
    green: "bg-green-50 text-green-700 dark:bg-green-950/30 dark:text-green-400",
    amber: "bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400",
    rose: "bg-rose-50 text-rose-700 dark:bg-rose-950/30 dark:text-rose-400",
    blue: "bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400",
    violet: "bg-violet-50 text-violet-700 dark:bg-violet-950/30 dark:text-violet-400",
    slate: "bg-slate-100 text-slate-700 dark:bg-slate-800/50 dark:text-slate-300",
  };
  return <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${tones[tone]}`}>{children}</span>;
}
