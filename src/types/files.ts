export type FileItem = {
  kind: "dicom" | "pgm";
  filename: string;
  size_bytes: number;
  created_at: number;  
  download_url: string;
};