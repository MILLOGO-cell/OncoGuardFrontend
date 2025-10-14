import { toast } from "react-toastify";
import { useStatsStore } from "@/store/statsStore";
import { getStatsSummary } from "@/lib/api/statsApi";

export function useStats() {
  const { setLoading, setData } = useStatsStore();

  const fetchSummary = async () => {
    try {
      setLoading(true);
      const res = await getStatsSummary();
      setData(res);
      return res;
    } catch (e: any) {
      toast.error(e?.response?.data?.detail || "Échec du chargement des statistiques");
      throw e;
    } finally {
      setLoading(false);
    }
  };

  return { fetchSummary };
}
