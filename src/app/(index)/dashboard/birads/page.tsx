"use client";

const rows = [
  { code: "0", title: "Examen incomplet", color: "bg-slate-600", action: "Compléments d’exploration nécessaires (incidence/écho/IRM)" },
  { code: "1", title: "Normal", color: "bg-emerald-600", action: "Suivi de routine" },
  { code: "2", title: "Bénin", color: "bg-teal-600", action: "Suivi de routine" },
  { code: "3", title: "Probablement bénin", color: "bg-amber-500", action: "Surveillance courte (≈ 6 mois)" },
  { code: "4A", title: "Suspicion faible", color: "bg-orange-500", action: "Biopsie à discuter" },
  { code: "4B", title: "Suspicion intermédiaire", color: "bg-orange-600", action: "Biopsie recommandée" },
  { code: "4C", title: "Suspicion forte", color: "bg-orange-700", action: "Biopsie recommandée" },
  { code: "5", title: "Évocateur de cancer", color: "bg-rose-600", action: "Biopsie et prise en charge oncologique" },
  { code: "6", title: "Cancer prouvé", color: "bg-red-700", action: "Traitement selon référentiels" },
];

export default function Page() {
  return (
    <div className="p-6 space-y-8">
      <div className="rounded-2xl p-6 bg-gradient-to-r from-indigo-600 via-fuchsia-600 to-pink-600 text-white shadow">
        <h1 className="text-2xl font-semibold">Système de classification BI-RADS</h1>
        <p className="mt-2 text-sm/6 opacity-95">
          BI-RADS standardise la description des anomalies mammaires et propose une conduite à tenir. Cette page résume chaque catégorie
          et son implication clinique.
        </p>
      </div>

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {rows.map((r) => (
          <div key={r.code} className="rounded-xl border p-5 bg-card/50 backdrop-blur shadow-sm">
            <div className="flex items-center justify-between">
              <span className={`inline-flex items-center rounded-lg px-3 py-1 text-sm font-semibold text-white ${r.color}`}>
                BI-RADS {r.code}
              </span>
            </div>
            <div className="mt-3 text-lg font-medium">{r.title}</div>
            <div className="mt-2 text-sm text-muted-foreground">{r.action}</div>
          </div>
        ))}
      </div>

      <div className="rounded-xl border overflow-hidden">
        <div className="bg-muted px-4 py-3 font-medium">Tableau récapitulatif</div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-muted-foreground">
                <th className="px-4 py-3">Catégorie</th>
                <th className="px-4 py-3">Interprétation</th>
                <th className="px-4 py-3">Conduite à tenir</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={r.code} className={i % 2 ? "bg-muted/40" : ""}>
                  <td className="px-4 py-3">
                    <span className={`inline-flex rounded-md px-2 py-1 text-xs font-semibold text-white ${r.color}`}>
                      BI-RADS {r.code}
                    </span>
                  </td>
                  <td className="px-4 py-3">{r.title}</td>
                  <td className="px-4 py-3">{r.action}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
