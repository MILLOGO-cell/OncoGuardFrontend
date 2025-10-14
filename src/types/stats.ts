export interface CountItem {
  label: string
  count: number
}

export interface SeriesPoint {
  date: string
  count: number
}

export interface ChartData {
  labels: string[]
  datasets: Array<{ label: string; data: number[] }>
}

export interface StatsResponse {
  total: number
  distinct_patients: number | null
  avg_confidence: number | null
  by_birads: CountItem[]
  by_label: CountItem[]
  last_30d_series: SeriesPoint[]
  confidence_histogram: ChartData
}
