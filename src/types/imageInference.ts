// types/imageInference.ts
export interface InferenceResponse {
  id: number;
  filename: string;
  patient_id?: number | null;
  result_class: string | null;
  confidence: number | null;
  status: string;
  submitted_at: string;
  description?: string | null;
}

export interface PredictPayload {
  patient_id?: number | null;
}

export type ProgressCallbacks = {
  onUploadPct?: (pct: number) => void;
  onProcessPct?: (pct: number) => void;
};

export interface ModelInfoResponse {
  classes: string[];
  n_classes: number;
  feature_dim: string;
  model_type: string;
  input_size: string;
  dataset: string;
  note: string;
}

export interface ResultItem {
  id: number;
  filename: string;
  label: string | null;
  birads: string | null;
  confidence: number | null;
  tagged_filename: string | null;
  submitted_at: string | null;
}

export interface ResultsResponse {
  items: ResultItem[];
  total: number;
}