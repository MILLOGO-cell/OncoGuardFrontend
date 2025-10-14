"use client";

import * as React from "react";
import * as RadixTabs from "@radix-ui/react-tabs";
import clsx from "clsx";

type Onglet = {
  libelle: string;
  valeur: string;
  contenu: React.ReactNode;
  icone?: React.ReactNode;
  pastille?: React.ReactNode;
  desactive?: boolean;
};

type OngletsProps = {
  onglets: Onglet[];
  valeurParDefaut?: string;
  onChangement?: (valeur: string) => void;
  classe?: string;
  ariaLibelle?: string;
  variante?: "soulignés" | "pills";
  pleineLargeur?: boolean;
  mode?: "auto" | "light" | "dark";
};

export function Onglets({
  onglets,
  valeurParDefaut,
  onChangement,
  classe,
  ariaLibelle = "Navigation par onglets",
  variante = "soulignés",
  pleineLargeur = false,
  mode = "auto",
}: OngletsProps) {
  const [actif, setActif] = React.useState(valeurParDefaut ?? onglets[0]?.valeur);

  React.useEffect(() => {
    if (valeurParDefaut && valeurParDefaut !== actif) setActif(valeurParDefaut);
  }, [valeurParDefaut, actif]);

  const changer = (valeur: string) => {
    setActif(valeur);
    onChangement?.(valeur);
  };

  const baseTrigger =
    "px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 disabled:opacity-50 disabled:cursor-not-allowed rounded-sm cursor-pointer";

  const styleTrigger =
    variante === "pills"
      ? (estActif: boolean) =>
          clsx(
            baseTrigger,
            "rounded-full border",
            estActif
              ? "bg-primary text-primary-foreground border-primary shadow-sm"
              : "text-foreground/80 bg-muted/40 border-transparent hover:bg-muted"
          )
      : (estActif: boolean) =>
          clsx(
            baseTrigger,
            "border-b-2 -mb-[2px]",
            estActif
              ? "text-primary border-primary"
              : "text-foreground/70 border-transparent hover:text-foreground hover:border-muted-foreground/20"
          );

  return (
    <div className={clsx(mode === "dark" && "dark")}>
      <RadixTabs.Root
        value={actif}
        onValueChange={changer}
        className={clsx("w-full text-foreground", classe)}
        aria-label={ariaLibelle}
      >
        <RadixTabs.List
          className={clsx(
            "flex gap-1 overflow-x-auto no-scrollbar",
            "bg-background",
            variante === "soulignés" && "border-b border-border",
            pleineLargeur && "justify-between"
          )}
        >
          {onglets.map((o) => {
            const estActif = actif === o.valeur;
            return (
              <RadixTabs.Trigger
                key={o.valeur}
                value={o.valeur}
                disabled={o.desactive}
                className={clsx(styleTrigger(estActif), pleineLargeur && "flex-1")}
                aria-pressed={estActif}
                aria-current={estActif ? "page" : undefined}
                title={o.libelle}
              >
                <span className="inline-flex items-center gap-2">
                  {o.icone && <span className="shrink-0">{o.icone}</span>}
                  <span>{o.libelle}</span>
                  {o.pastille && (
                    <span className="ml-1 inline-flex items-center justify-center rounded-full bg-primary/10 text-primary px-2 text-[10px] font-medium">
                      {o.pastille}
                    </span>
                  )}
                </span>
              </RadixTabs.Trigger>
            );
          })}
        </RadixTabs.List>

        {onglets.map((o) => (
          <RadixTabs.Content
            key={o.valeur}
            value={o.valeur}
            className="mt-4 focus:outline-none bg-background text-foreground"
            tabIndex={0}
          >
            {o.contenu}
          </RadixTabs.Content>
        ))}
      </RadixTabs.Root>
    </div>
  );
}

export default Onglets;
