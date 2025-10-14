"use client";

import * as Popover from "@radix-ui/react-popover";
import { useMemo, useState } from "react";
import { Check, ChevronDown, X } from "lucide-react";
import clsx from "clsx";

export type MultiOption<T extends string = string> = { value: T; label: string };

export interface MultiSelectSearchableProps<T extends string = string> {
  label?: string;
  options: readonly MultiOption<T>[];
  value: T[];
  onChange: (value: T[]) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  className?: string;
  disabled?: boolean;
  loading?: boolean;
  maxHeight?: number;
}

export default function MultiSelectSearchable<T extends string = string>({
  label,
  options,
  value,
  onChange,
  placeholder = "Sélectionner...",
  searchPlaceholder = "Rechercher…",
  className,
  disabled = false,
  loading = false,
  maxHeight = 260,
}: MultiSelectSearchableProps<T>) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");

  const selectedLabels = useMemo(() => {
    const map = new Map(options.map((o) => [o.value, o.label]));
    return value.map((v) => map.get(v) ?? v);
  }, [options, value]);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return options;
    return options.filter((o) => o.label.toLowerCase().includes(term));
  }, [q, options]);

  const toggle = (v: T) => {
    const exists = value.includes(v);
    const next = exists ? value.filter((x) => x !== v) : [...value, v];
    onChange(next);
  };

  const clear = () => onChange([]);

  return (
    <div className={clsx("w-full flex flex-col gap-1", className)}>
      {label && <span className="text-sm">{label}</span>}

      <Popover.Root open={open} onOpenChange={setOpen}>
        <Popover.Trigger
          className={clsx(
            "inline-flex w-full items-center justify-between rounded-md border h-10 px-3 text-sm",
            "focus:outline-none focus:ring-2 focus:ring-offset-1",
            "bg-background text-foreground border-border",
            (disabled || loading) && "opacity-50 cursor-not-allowed"
          )}
          disabled={disabled || loading}
        >
          <span className={clsx("truncate", selectedLabels.length ? "" : "text-gray-400")}>
            {loading ? "Chargement..." : selectedLabels.length ? selectedLabels.join(", ") : placeholder}
          </span>
          <ChevronDown className="h-4 w-4 shrink-0" />
        </Popover.Trigger>

        <Popover.Portal>
          <Popover.Content
            align="start"
            sideOffset={6}
            className={clsx(
              "z-50 rounded-md shadow-lg border p-2 w-[min(520px,90vw)]",
              "bg-white text-gray-900 border-border",
              "dark:bg-gray-900 dark:text-gray-100 dark:border-border"
            )}
          >
            <div className="flex items-center gap-2 mb-2">
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder={searchPlaceholder}
                className={clsx(
                  "flex-1 rounded-md border h-9 px-3 text-sm",
                  "bg-background text-foreground border-border focus:outline-none focus:ring-2 focus:ring-offset-1"
                )}
              />
              {!!value.length && (
                <button
                  type="button"
                  onClick={clear}
                  className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-md border"
                >
                  <X className="h-3 w-3" /> Effacer
                </button>
              )}
            </div>

            <div
              className="overflow-y-auto rounded-md border"
              style={{ maxHeight }}
            >
              {filtered.map((o) => {
                const checked = value.includes(o.value);
                return (
                  <button
                    key={o.value}
                    type="button"
                    onClick={() => toggle(o.value)}
                    className={clsx(
                      "w-full flex items-center justify-between px-3 py-2 text-left text-sm",
                      "hover:bg-muted focus:bg-muted"
                    )}
                  >
                    <span>{o.label}</span>
                    {checked && <Check className="h-4 w-4" />}
                  </button>
                );
              })}
              {!filtered.length && (
                <div className="px-3 py-2 text-sm text-gray-500">Aucun résultat</div>
              )}
            </div>

            <div className="mt-2 text-right">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="text-sm px-3 py-1 rounded-md border"
              >
                Fermer
              </button>
            </div>
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>
    </div>
  );
}
