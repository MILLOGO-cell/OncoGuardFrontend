export interface PredResult {
  label: "Normal" | "Benign" | "Malignant" | string
  birads: string
  confidence: number
}

export interface IngestItem {
  original_filename: string
  saved_as: string
  kind: "photo" | "dicom"
  anonymized_image_id?: string | null
  anonymized_png?: string | null
  anonymized_dicom?: string | null
  age_value?: number | null
  age_source?: string | null
  prediction?: PredResult | null
}

export interface IngestResponse {
  processed: IngestItem[]
  counts: {
    uploaded_photos: number
    uploaded_dicoms: number
    new_anonymized_png: number
    predictions_done: number
  }
}
