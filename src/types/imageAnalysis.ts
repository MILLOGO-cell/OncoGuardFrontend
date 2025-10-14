import { BiradsCategory, AnalysisStatus } from "./enums"

export interface ImageAnalysis {
  id: number
  filename: string
  result_class: BiradsCategory | null
  confidence: number | null
  description?: string | null
  status: AnalysisStatus
  submitted_at: string
}
