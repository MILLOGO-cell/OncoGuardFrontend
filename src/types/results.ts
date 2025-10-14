// src/types/results.ts
export type ResultItem = {
  id: number
  filename: string
  label?: string | null
  birads?: string | null
  confidence?: number | null
  tagged_filename?: string | null
  submitted_at?: string | null
}

export type ResultsResponse = {
  items: ResultItem[]
  total: number
}
