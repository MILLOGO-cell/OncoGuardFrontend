"use client";

import * as Select from "@radix-ui/react-select";
import { Check, ChevronDown, ChevronUp } from "lucide-react";
import clsx from "clsx";

export type SelectOption<T extends string = string> = { value: T; label: string };

export interface SelectSearchableProps<T extends string = string> {
  label?: string;
  options: readonly SelectOption<T>[];
  value: T;
  onChange: (value: T) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  loading?: boolean;             
  searchPlaceholder?: string;   
}

export function SelectSearchable<T extends string = string>({
  label,
  options,
  value,
  onChange,
  placeholder = "Choisir...",
  className,
  disabled = false,
  loading = false,
}: SelectSearchableProps<T>) {
  const EMPTY = "__EMPTY_SENTINEL__";
  const toItemValue = (v: string) => (v === "" ? EMPTY : v);
  const fromItemValue = (v: string) => (v === EMPTY ? "" : v);

  const isDisabled = disabled || loading;

  return (
    <div className={clsx("w-full flex flex-col gap-1", className)}>
      {label && <span className="text-sm">{label}</span>}

      <Select.Root
        value={toItemValue(String(value))}
        onValueChange={(v) => onChange(fromItemValue(v) as T)}
        disabled={isDisabled}
      >
        <Select.Trigger
          className={clsx(
            "inline-flex w-full items-center justify-between rounded-md border h-10 px-3 text-sm",
            "focus:outline-none focus:ring-2 focus:ring-offset-1",
            "bg-background text-foreground border-border",
            isDisabled && "opacity-50 cursor-not-allowed"
          )}
        >
          <Select.Value placeholder={loading ? "Chargement..." : placeholder} />
          <Select.Icon>
            <ChevronDown className="h-4 w-4" />
          </Select.Icon>
        </Select.Trigger>

        <Select.Portal>
          <Select.Content
            position="popper"
            sideOffset={6}
            align="start"
            className={clsx(
              "z-50 rounded-md shadow-lg border",
              "bg-white text-gray-900 border-border",
              "dark:bg-gray-900 dark:text-gray-100 dark:border-border"
            )}
          >
            <Select.ScrollUpButton className="sticky top-0 flex items-center justify-center p-1">
              <ChevronUp className="h-4 w-4" />
            </Select.ScrollUpButton>

            <Select.Viewport className="p-1 max-h-60 overflow-y-auto">
              {options.map((option) => {
                const raw = String(option.value);
                const val = toItemValue(raw);
                return (
                  <Select.Item
                    key={val}
                    value={val}
                    className={clsx(
                      "flex items-center justify-between px-3 py-2 rounded-md text-sm cursor-pointer outline-none",
                      "data-[highlighted]:bg-muted data-[highlighted]:text-foreground",
                      "data-[state=checked]:bg-muted/70 data-[state=checked]:font-medium"
                    )}
                  >
                    <Select.ItemText>{option.label}</Select.ItemText>
                    <Select.ItemIndicator>
                      <Check className="h-4 w-4" />
                    </Select.ItemIndicator>
                  </Select.Item>
                );
              })}
            </Select.Viewport>

            <Select.ScrollDownButton className="sticky bottom-0 flex items-center justify-center p-1">
              <ChevronDown className="h-4 w-4" />
            </Select.ScrollDownButton>
          </Select.Content>
        </Select.Portal>
      </Select.Root>
    </div>
  );
}
