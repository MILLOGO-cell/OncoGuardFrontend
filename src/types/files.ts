export interface FileItem {
  kind: "png" | "dicom"
  filename: string
  size_bytes: number
  created_at: number
  download_url: string
}
