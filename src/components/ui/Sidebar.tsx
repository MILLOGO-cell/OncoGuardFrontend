"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  FileArchive,
  FlaskConical,
  Images,
  Shield,
  BookOpen,
  Tag,
} from "lucide-react";
import clsx from "clsx";

const appLinks = [
  { href: "/dashboard", label: "Aperçu", icon: Shield },
  { href: "/dashboard/stats", label: "Statistiques", icon: BarChart3 },
  { href: "/dashboard/ingest", label: "Anonymiser", icon: FlaskConical },
  { href: "/dashboard/files", label: "Fichiers", icon: FileArchive },
  { href: "/dashboard/inference", label: "Inférence", icon: Images },
  { href: "/dashboard/tagged", label: "Résultats annotées", icon: Tag },
  { href: "/dashboard/birads", label: "Guide BI-RADS", icon: BookOpen },
];

const resourceLinks = [
  {
    href: "https://www.acr.org/Clinical-Resources/Reporting-and-Data-Systems/Bi-Rads",
    label: "ACR BI-RADS",
  },
  {
    href: "https://www.who.int/health-topics/breast-cancer",
    label: "OMS — Cancer du sein",
  },
];

export default function Sidebar({ collapsedExternal }: { collapsedExternal: boolean }) {
  const pathname = usePathname();

  // ✅ Ne rend "Aperçu" actif que pour /dashboard exact
  const isActive = (href: string) => {
    if (href === "/dashboard") {
      return pathname === "/dashboard";
    }
    return pathname.startsWith(href);
  };

  return (
    <aside
      className={clsx(
        "fixed inset-y-0 left-0 z-40 w-64 shrink-0 border-r bg-[var(--color-background)] transition-transform md:static md:translate-x-0",
        collapsedExternal ? "-translate-x-full" : "translate-x-0"
      )}
    >
      {/* En-tête */}
      <div className="flex h-14 items-center border-b px-4">
        <span className="font-semibold text-[var(--color-foreground)]">
          OncoGuard
        </span>
        <span className="ml-2 text-xs text-[var(--color-muted-foreground)]">
          v0.1.0
        </span>
      </div>

      {/* Navigation */}
      <nav className="space-y-1 p-2">
        {appLinks.map(({ href, label, icon: Icon }) => {
          const active = isActive(href);
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className={clsx(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--color-ring)]",
                active
                  ? "bg-[var(--color-primary)] text-[var(--color-primary-foreground)] shadow-sm"
                  : "text-[var(--color-muted-foreground)] hover:bg-[var(--color-hover)] hover:text-[var(--color-foreground)]"
              )}
            >
              <Icon
                className={clsx(
                  "h-4 w-4 transition-colors",
                  active
                    ? "text-[var(--color-primary-foreground)]"
                    : "text-[var(--color-muted-foreground)] group-hover:text-[var(--color-foreground)]"
                )}
              />
              <span>{label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Ressources */}
      <div className="px-3 pt-4">
        <div className="px-2 pb-2 text-xs font-semibold uppercase text-[var(--color-muted-foreground)]">
          Ressources
        </div>
        <div className="space-y-1">
          {resourceLinks.map((r) => (
            <Link
              key={r.href}
              href={r.href}
              target="_blank"
              rel="noreferrer"
              className="block rounded-md px-3 py-2 text-sm text-[var(--color-muted-foreground)] hover:bg-[var(--color-hover)] hover:text-[var(--color-foreground)] transition-colors"
            >
              {r.label}
            </Link>
          ))}
        </div>
      </div>
    </aside>
  );
}
