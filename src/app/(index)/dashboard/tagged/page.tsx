// src/app/(index)/tagged/page.tsx
"use client"

import { useEffect, useMemo, useState } from "react"
import { useResults } from "@/hooks/useResults"
import { useResultsStore } from "@/store/resultsStore"
import { taggedImageUrl } from "@/lib/api/resultsApi"
import { downloadFileUrl } from "@/lib/api/filesApi"
import Button from "@/components/ui/Button"

function ProgressBar({ value, label }: { value: number; label: string }) {
  const v = Math.max(0, Math.min(100, value))
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>{label}</span>
        <span>{v}%</span>
      </div>
      <div className="h-2 w-full rounded bg-muted overflow-hidden">
        <div className="h-2 bg-primary" style={{ width: `${v}%` }} />
      </div>
    </div>
  )
}

type ViewFilter = "all" | "tagged" | "untagged"

export default function Page() {
  const { fetchAll, exportCsv, exportTaggedZip } = useResults()
  const { items, loading, downloading, progressPct, total } = useResultsStore()
  const [order, setOrder] = useState<"asc" | "desc">("desc")
  const [limit, setLimit] = useState<number>(200)
  const [view, setView] = useState<ViewFilter>("all")

  useEffect(() => {
    fetchAll({ order, limit })
  }, [order, limit])

  const tagged = useMemo(() => items.filter(i => !!i.tagged_filename), [items])
  const untagged = useMemo(() => items.filter(i => !i.tagged_filename), [items])

  const visible = useMemo(() => {
    if (view === "tagged") return tagged
    if (view === "untagged") return untagged
    return items
  }, [view, items, tagged, untagged])

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Images annotées</h1>
          <p className="text-sm text-muted-foreground">
            {tagged.length} annotées • {untagged.length} non annotées • total {total}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <select
            className="border rounded-md px-3 py-2 text-sm"
            value={view}
            onChange={(e) => setView(e.target.value as ViewFilter)}
            disabled={loading || downloading}
          >
            <option value="all">Toutes</option>
            <option value="tagged">Annotées</option>
            <option value="untagged">Non annotées</option>
          </select>
          <select
            className="border rounded-md px-3 py-2 text-sm"
            value={order}
            onChange={(e) => setOrder(e.target.value as "asc" | "desc")}
            disabled={loading || downloading}
          >
            <option value="desc">Récent d’abord</option>
            <option value="asc">Ancien d’abord</option>
          </select>
          <select
            className="border rounded-md px-3 py-2 text-sm"
            value={String(limit)}
            onChange={(e) => setLimit(Number(e.target.value))}
            disabled={loading || downloading}
          >
            <option value="50">50</option>
            <option value="100">100</option>
            <option value="200">200</option>
            <option value="500">500</option>
          </select>
          <Button variant="secondary" onClick={exportCsv} disabled={downloading || loading}>Exporter CSV</Button>
          <Button variant="secondary" onClick={exportTaggedZip} disabled={downloading || loading}>Exporter ZIP</Button>
        </div>
      </div>

      {(loading || downloading) && (
        <div className="rounded-xl border p-4 space-y-2">
          <div className="text-sm text-muted-foreground">{downloading ? "Téléchargement" : "Chargement"}</div>
          <ProgressBar value={downloading ? progressPct : 35} label="Progression" />
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {visible.map((it) => {
          const imgSrc = it.tagged_filename
            ? taggedImageUrl(it.tagged_filename)
            : downloadFileUrl("png", it.filename)
          return (
            <div key={it.id} className="rounded-xl border p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="text-sm font-medium truncate">{it.filename}</div>
                <div className="text-xs text-muted-foreground">
                  {(it.confidence ?? 0) > 0 ? `${((it.confidence ?? 0) * 100).toFixed(1)}%` : "-"}
                </div>
              </div>
              <img
                src={imgSrc}
                alt={it.filename}
                className="w-full h-48 object-contain bg-muted rounded"
              />
              <div className="flex items-center justify-between text-sm">
                <div>
                  <span className="font-semibold">{it.label || "-"}</span>
                  {it.birads ? <span className="text-muted-foreground"> • BI-RADS {it.birads}</span> : null}
                </div>
                <span
                  className={`px-2 py-0.5 rounded text-xs ${
                    it.tagged_filename ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300"
                    : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300"
                  }`}
                >
                  {it.tagged_filename ? "Annotée" : "À annoter"}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <a className="text-sm underline" href={imgSrc} download>
                  Télécharger
                </a>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
