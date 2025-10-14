// src/app/(index)/stats/page.tsx
"use client";

import { useEffect, useMemo } from "react";
import { useStats } from "@/hooks/useStats";
import { useStatsStore } from "@/store/statsStore";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  AreaChart,
  Area,
} from "recharts";

type BiradsItem = { label: string; count: number };
type LabelItem = { label: string; count: number };
type SeriesPoint = { date: string; count: number };
type Histogram = { labels: string[]; datasets: { label: string; data: number[] }[] };

type StatsData = {
  total: number;
  distinct_patients: number | null;
  avg_confidence: number | null;
  by_birads: BiradsItem[];
  by_label: LabelItem[];
  last_30d_series: SeriesPoint[];
  confidence_histogram: Histogram | null;
};

// Couleurs cohérentes entre BI-RADS mappé et Répartition clinique
const CLINICAL_COLORS: Record<string, string> = {
  Normal: "#22c55e", // vert
  Benign: "#06b6d4", // bleu
  Malignant: "#ef4444", // rouge
};

function normalizeClinicalLabel(label: string) {
  const l = label.toLowerCase();
  if (l.includes("normal")) return "Normal";
  if (l.includes("bénin") || l.includes("benign")) return "Benign";
  if (l.includes("malignant") || l.includes("cancer") || l.includes("évocateur")) return "Malignant";
  return label;
}

function numberFormat(n: number | null | undefined) {
  if (n == null) return "—";
  return new Intl.NumberFormat("fr-FR").format(n);
}

function percentFormat(p: number | null | undefined) {
  if (p == null) return "—";
  return `${(p * 100).toFixed(1)}%`;
}

function toShortDate(d: string) {
  const [y, m, day] = d.split("-").map(Number);
  const date = new Date(y, (m ?? 1) - 1, day ?? 1);
  return new Intl.DateTimeFormat("fr-FR", { day: "2-digit", month: "2-digit" }).format(date);
}

export default function Page() {
  const { fetchSummary } = useStats();
  const data = useStatsStore((s) => s.data) as StatsData | undefined;

  useEffect(() => {
    fetchSummary();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const totalCount = data?.total ?? 0;
  const formatWithPercent = (v: number) => {
    if (!totalCount) return numberFormat(v);
    const pct = (v / totalCount) * 100;
    return `${numberFormat(v)} (${pct.toFixed(1)}%)`;
  };

  // BI-RADS → mappé vers classes cliniques + couleurs cohérentes
  const biradsChartData = useMemo(() => {
    const items = (data?.by_birads || []).map((x) => {
      const clinical = normalizeClinicalLabel(x.label);
      return {
        name: clinical,
        value: x.count,
        color: CLINICAL_COLORS[clinical] || "#5f2eba",
        rawLabel: x.label,
      };
    });
    const grouped: Record<string, { name: string; value: number; color: string }> = {};
    for (const it of items) {
      if (!grouped[it.name]) grouped[it.name] = { name: it.name, value: 0, color: it.color };
      grouped[it.name].value += it.value;
    }
    return Object.values(grouped);
  }, [data]);

  // Répartition clinique (barres) + couleurs cohérentes
  const labelChartData = useMemo(() => {
    return (data?.by_label || []).map((x) => {
      const name = normalizeClinicalLabel(x.label);
      return { name, value: x.count, color: CLINICAL_COLORS[name] || "#5f2eba" };
    });
  }, [data]);

  const last30ChartData = useMemo(
    () => (data?.last_30d_series || []).map((p) => ({ date: toShortDate(p.date), count: p.count })),
    [data]
  );

  const histogramData = useMemo(() => {
    const h = data?.confidence_histogram;
    if (!h?.labels?.length || !h?.datasets?.[0]?.data?.length) return [];
    const values = h.datasets[0].data;
    return h.labels.map((label, i) => ({ bucket: label, count: values[i] ?? 0 }));
  }, [data]);

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Statistiques</h1>

      {/* KPIs */}
      <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
        <div className="rounded-xl border p-4">
          <div className="text-sm text-muted-foreground">Total analyses</div>
          <div className="text-2xl font-semibold">{numberFormat(data?.total ?? 0)}</div>
        </div>
        <div className="rounded-xl border p-4">
          <div className="text-sm text-muted-foreground">Confiance moyenne</div>
          <div className="text-2xl font-semibold">{percentFormat(data?.avg_confidence)}</div>
        </div>
        <div className="rounded-xl border p-4">
          <div className="text-sm text-muted-foreground">Patients distincts</div>
          <div className="text-2xl font-semibold">
            {data?.distinct_patients == null ? "—" : numberFormat(data.distinct_patients)}
          </div>
        </div>
      </div>

      {/* Charts row 1 */}
      <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
        {/* BI-RADS (mappé cliniques) */}
        <div className="rounded-xl border p-4">
          <div className="mb-3 font-medium">Répartition BI-RADS</div>
          <div className="h-72">
            {biradsChartData.length ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={biradsChartData} dataKey="value" nameKey="name" innerRadius={60} outerRadius={100} paddingAngle={2}>
                    {biradsChartData.map((it, i) => (
                      <Cell key={i} fill={it.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(v: any) => formatWithPercent(Number(v))}
                    labelFormatter={(label) => `Classe: ${label}`}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <EmptyState />
            )}
          </div>
        </div>

        {/* Répartition clinique */}
        <div className="rounded-xl border p-4">
          <div className="mb-3 font-medium">Répartition clinique</div>
          <div className="h-72">
            {labelChartData.length ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={labelChartData} barSize={36}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(v: any) => formatWithPercent(Number(v))} />
                  <Legend />
                  <Bar dataKey="value" name="Nombre">
                    {labelChartData.map((it, i) => (
                      <Cell key={i} fill={it.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <EmptyState />
            )}
          </div>
        </div>
      </div>

      {/* Charts row 2 */}
      <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
        {/* 30 derniers jours */}
        <div className="rounded-xl border p-4">
          <div className="mb-3 font-medium">30 derniers jours</div>
          <div className="h-72">
            {last30ChartData.length ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={last30ChartData}>
                  <defs>
                    <linearGradient id="countFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#5f2eba" stopOpacity={0.6} />
                      <stop offset="95%" stopColor="#5f2eba" stopOpacity={0.05} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip formatter={(v: any) => numberFormat(Number(v))} />
                  <Area type="monotone" dataKey="count" name="Nombre" stroke="#5f2eba" fill="url(#countFill)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <EmptyState />
            )}
          </div>
        </div>

        {/* Histogramme des confiances */}
        <div className="rounded-xl border p-4">
          <div className="mb-3 font-medium">Histogramme des confiances</div>
          <div className="h-72">
            {histogramData.length ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={histogramData} barSize={28}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="bucket" />
                  <YAxis />
                  <Tooltip formatter={(v: any) => numberFormat(Number(v))} />
                  <Bar dataKey="count" name="Nombre" fill="#4e2c9f" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <EmptyState />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="h-full w-full flex items-center justify-center text-sm text-muted-foreground">
      Aucune donnée
    </div>
  );
}
