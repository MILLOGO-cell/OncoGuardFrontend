"use client";

import * as React from "react";
import * as RadixSelect from "@radix-ui/react-select";
import clsx from "clsx";
import { ChevronDown, ChevronUp } from "lucide-react";

interface FilterOption {
  value: string;
  label: string;
}

export interface FilterProps {
  options: FilterOption[];
  value: string;
  onChange: (value: string) => void;
  label?: string;
  withAllOption?: boolean;
  className?: string;
}

export function Filter({
  options,
  value,
  onChange,
  label,
  withAllOption = true,
  className,
}: FilterProps) {
  const ALL = "__all__";
  const id = React.useId();

  // Mémoriser les calculs pour éviter les re-renders
  const { normalizedOptions, allLabel } = React.useMemo(() => {
    const calculatedAllLabel = options.find(o => o.value === "" || o.label.toLowerCase() === "tous")?.label || "Tous";
    const hasEmpty = options.some(o => o.value === "");
    
    const mapped = options.map(o => ({ 
      value: o.value === "" ? ALL : o.value, 
      label: o.label 
    }));
    
    const alreadyHasAll = mapped.some(o => o.value === ALL);
    
    let finalOptions = mapped;
    if (!alreadyHasAll && withAllOption && !hasEmpty) {
      finalOptions = [{ value: ALL, label: calculatedAllLabel }, ...mapped];
    }
    
    return {
      normalizedOptions: finalOptions,
      allLabel: calculatedAllLabel
    };
  }, [options, withAllOption, ALL]);

  // Calculer la valeur contrôlée de manière stable
  const controlledValue = React.useMemo(() => {
    const selectedValue = value === "" || value === ALL ? ALL : value;
    const exists = normalizedOptions.some(o => o.value === selectedValue);
    return exists ? selectedValue : ALL;
  }, [value, normalizedOptions, ALL]);

  const handleValueChange = React.useCallback((val: string) => {
    onChange(val === ALL ? "" : val);
  }, [onChange, ALL]);

  return (
    <div className={clsx("flex flex-col gap-1", className)}>
      {label && (
        <label className="text-sm font-medium" htmlFor={id}>
          {label}
        </label>
      )}
      <RadixSelect.Root value={controlledValue} onValueChange={handleValueChange}>
        <RadixSelect.Trigger
          id={id}
          className={clsx(
            "w-full rounded-md border px-3 py-2 text-sm transition-colors inline-flex items-center justify-between",
            "bg-white text-gray-900 border-gray-300 placeholder-gray-400",
            "dark:bg-gray-800 dark:text-gray-100 dark:border-gray-600 dark:placeholder-gray-400",
            "hover:border-gray-400 dark:hover:border-gray-500",
            "focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
          )}
          aria-label={label}
        >
          <RadixSelect.Value />
          <RadixSelect.Icon className="ml-2">
            <ChevronDown size={20} aria-hidden />
          </RadixSelect.Icon>
        </RadixSelect.Trigger>

        <RadixSelect.Portal>
          <RadixSelect.Content
            position="popper"
            sideOffset={6}
            avoidCollisions
            className="z-[9999] overflow-hidden rounded-md border bg-white text-gray-900 shadow-md dark:bg-gray-800 dark:text-gray-100 dark:border-gray-600"
          >
            <RadixSelect.ScrollUpButton className="flex items-center justify-center h-6 bg-gray-100 dark:bg-gray-700 cursor-default">
              <ChevronUp size={16} aria-hidden />
            </RadixSelect.ScrollUpButton>

            <RadixSelect.Viewport className="p-1 max-h-60">
              {normalizedOptions.map((opt) => (
                <RadixSelect.Item
                  key={opt.value}
                  className="relative flex items-center rounded-sm px-8 py-2 text-sm font-medium cursor-pointer select-none focus:bg-blue-600 focus:text-white"
                  value={opt.value}
                >
                  <RadixSelect.ItemText>{opt.label}</RadixSelect.ItemText>
                  <RadixSelect.ItemIndicator className="absolute left-2 inline-flex items-center">
                    ✓
                  </RadixSelect.ItemIndicator>
                </RadixSelect.Item>
              ))}
            </RadixSelect.Viewport>

            <RadixSelect.ScrollDownButton className="flex items-center justify-center h-6 bg-gray-100 dark:bg-gray-700 cursor-default">
              <ChevronDown size={16} aria-hidden />
            </RadixSelect.ScrollDownButton>
          </RadixSelect.Content>
        </RadixSelect.Portal>
      </RadixSelect.Root>
    </div>
  );
}

export default Filter;