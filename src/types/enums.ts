export enum BiradsCategory {
  BI_RADS_0 = "0 - Examen incomplet",
  BI_RADS_1 = "1 - Normal",
  BI_RADS_2 = "2 - Bénin",
  BI_RADS_3 = "3 - Probablement bénin",
  BI_RADS_4A = "4A - Suspicion faible",
  BI_RADS_4B = "4B - Suspicion intermédiaire",
  BI_RADS_4C = "4C - Suspicion forte",
  BI_RADS_5 = "5 - Évocateur de cancer",
  BI_RADS_6 = "6 - Cancer prouvé",
}

export enum AnalysisStatus {
  PENDING = "PENDING",
  RUNNING = "RUNNING",
  COMPLETED = "COMPLETED",
  FAILED = "FAILED",
}
