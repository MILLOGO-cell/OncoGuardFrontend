"use client";

import * as React from "react";
import * as RadixRadioGroup from "@radix-ui/react-radio-group";
import { Check } from "lucide-react";
import clsx from "clsx";

export type RadioOption<T extends string = string> = {
  value: T;
  label: React.ReactNode;
  description?: React.ReactNode;
};

type Props<T extends string = string> = {
  options: RadioOption<T>[];
  value: T | "";
  onChange: (val: T | "") => void;
  name?: string;
  className?: string;
  disabled?: boolean;
  direction?: "row" | "col";
  allowDeselect?: boolean;
};

export function Radio<T extends string = string>({
  options,
  value,
  onChange,
  name,
  className,
  disabled = false,
  direction = "col",
  allowDeselect = false,
}: Props<T>) {
  return (
    <RadixRadioGroup.Root
      value={value as string}
      onValueChange={(val) => onChange(val as T)}
      name={name}
      disabled={disabled}
      className={clsx(
        direction === "col" ? "flex flex-col gap-4" : "flex flex-row gap-4",
        className
      )}
    >
      {options.map((opt) => {
        const checked = value === opt.value;
        return (
          <div
            key={String(opt.value)}
            onMouseDown={(e) => {
              if (allowDeselect && checked && !disabled) {
                e.preventDefault();
                onChange("" as T | "");
              }
            }}
            className={clsx(
              "flex items-center gap-3 rounded-md border p-3 cursor-pointer",
              "hover:bg-muted/50 transition",
              checked && "border-primary ring-2 ring-primary/30"
            )}
          >
            <RadixRadioGroup.Item
              value={opt.value}
              className={clsx(
                "flex h-5 w-5 items-center justify-center rounded-full border border-border",
                "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary",
                "data-[state=checked]:bg-primary data-[state=checked]:border-primary",
                disabled && "opacity-50 cursor-not-allowed"
              )}
            >
              <RadixRadioGroup.Indicator>
                <Check className="h-4 w-4 text-white" />
              </RadixRadioGroup.Indicator>
            </RadixRadioGroup.Item>

            <div className="flex flex-col flex-1">
              <span className="text-sm font-medium">{opt.label}</span>
              {opt.description && (
                <span className="text-xs text-muted-foreground">{opt.description}</span>
              )}
            </div>
          </div>
        );
      })}
    </RadixRadioGroup.Root>
  );
}
