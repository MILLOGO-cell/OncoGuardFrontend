// src/hooks/useIngest.ts
import { toast } from "react-toastify";
import { useIngestStore } from "@/store/ingestStore";
import { anonymize } from "@/lib/api/ingestApi";

export function useIngest() {
  const { setLoading, setProgressPct, setLastResponse } = useIngestStore();

  const run = async (
    files: File[],
    opts?: { run_inference?: boolean; persist?: boolean }
  ) => {
    try {
      setLoading(true);
      setProgressPct(0);
      const res = await anonymize(files, opts, (p) => setProgressPct(p));
      setLastResponse(res);
      setProgressPct(100);
      toast.success("Anonymisation terminée");
      if (opts?.run_inference) toast.success("Prédictions enregistrées");
      return res;
    } catch (e: any) {
      toast.error(e?.response?.data?.detail || "Échec de l’anonymisation");
      throw e;
    } finally {
      setTimeout(() => setLoading(false), 300);
    }
  };

  return { run };
}
