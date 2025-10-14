"use client";

import Link from "next/link";

export default function Page() {
  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Tableau de bord</h1>
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        <Link 
          href="/dashboard/stats" 
          className="rounded-xl border p-6 hover:shadow-md transition bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30"
        >
          <div className="text-lg font-medium">Statistiques</div>
          <div className="text-sm text-muted-foreground">Vue d'ensemble des analyses</div>
        </Link>
        
        <Link 
          href="/dashboard/ingest" 
          className="rounded-xl border p-6 hover:shadow-md transition bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30"
        >
          <div className="text-lg font-medium">Anonymiser</div>
          <div className="text-sm text-muted-foreground">Importer et anonymiser des fichiers</div>
        </Link>
        
        <Link 
          href="/dashboard/files" 
          className="rounded-xl border p-6 hover:shadow-md transition bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30"
        >
          <div className="text-lg font-medium">Images anonymisées</div>
          <div className="text-sm text-muted-foreground">Lister, télécharger, exporter</div>
        </Link>
        
        <Link 
          href="/dashboard/inference" 
          className="rounded-xl border p-6 hover:shadow-md transition bg-gradient-to-r from-pink-50 to-rose-50 dark:from-pink-950/30 dark:to-rose-950/30"
        >
          <div className="text-lg font-medium">Inférence</div>
          <div className="text-sm text-muted-foreground">Tester le classifieur</div>
        </Link>
        
        <Link 
          href="/dashboard/tagged" 
          className="rounded-xl border p-6 hover:shadow-md transition bg-gradient-to-r from-cyan-50 to-sky-50 dark:from-cyan-950/30 dark:to-sky-950/30"
        >
          <div className="text-lg font-medium">Résultats annotés</div>
          <div className="text-sm text-muted-foreground">Consulter les prédictions validées</div>
        </Link>
        
        <Link 
          href="/dashboard/birads" 
          className="rounded-xl border p-6 hover:shadow-md transition bg-gradient-to-r from-violet-50 to-fuchsia-50 dark:from-violet-950/30 dark:to-fuchsia-950/30"
        >
          <div className="text-lg font-medium">Guide BI-RADS</div>
          <div className="text-sm text-muted-foreground">Explications et tableau récapitulatif</div>
        </Link>
      </div>
    </div>
  );
}