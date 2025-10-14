export interface InferenceResponse {
  label: "Normal" | "Benign" | "Malignant" | string
  birads: string
  confidence: number
  filename: string
}
