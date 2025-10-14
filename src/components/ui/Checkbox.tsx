// src/components/ui/Checkbox.tsx
"use client";
import * as React from "react";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { Check, Minus } from "lucide-react";
import clsx from "clsx";

interface CheckboxProps extends React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root> {
  label?: React.ReactNode;
  description?: React.ReactNode;
  indeterminate?: boolean;
}

export function Checkbox({ 
  label, 
  description, 
  className, 
  disabled, 
  id, 
  indeterminate = false,
  checked,
  ...props 
}: CheckboxProps) {
  const inputId = React.useId();
  const controlId = id ?? inputId;

  // Gérer l'état indéterminé
  const checkboxState = indeterminate ? "indeterminate" : checked;

  return (
    <div className={clsx("flex items-start gap-3", className)}>
      <CheckboxPrimitive.Root
        id={controlId}
        className={clsx(
          "peer relative flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 transition-all duration-200",
          // États normaux
          "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800",
          // États focus
          "focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500",
          // États checked/indeterminate
          "data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600 data-[state=checked]:text-white",
          "data-[state=indeterminate]:bg-blue-600 data-[state=indeterminate]:border-blue-600 data-[state=indeterminate]:text-white",
          // États hover
          !disabled && [
            "hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950",
            "data-[state=checked]:hover:bg-blue-700",
            "data-[state=indeterminate]:hover:bg-blue-700"
          ],
          // États disabled
          disabled && [
            "opacity-50 cursor-not-allowed",
            "data-[state=checked]:bg-gray-400 data-[state=checked]:border-gray-400",
            "data-[state=indeterminate]:bg-gray-400 data-[state=indeterminate]:border-gray-400"
          ],
          // Curseur
          !disabled && "cursor-pointer"
        )}
        disabled={disabled}
        checked={checkboxState}
        {...props}
      >
        <CheckboxPrimitive.Indicator 
          className="flex items-center justify-center w-full h-full"
          forceMount
        >
          {indeterminate ? (
            <Minus className="h-3 w-3 text-current" strokeWidth={3} />
          ) : (
            <Check className="h-3 w-3 text-current" strokeWidth={2.5} />
          )}
        </CheckboxPrimitive.Indicator>
      </CheckboxPrimitive.Root>
      
      {(label || description) && (
        <label 
          htmlFor={controlId} 
          className={clsx(
            "flex flex-col gap-0.5 select-none",
            !disabled && "cursor-pointer",
            disabled && "opacity-50"
          )}
        >
          {label && (
            <span className="text-sm font-medium text-gray-900 dark:text-gray-100 leading-none">
              {label}
            </span>
          )}
          {description && (
            <span className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
              {description}
            </span>
          )}
        </label>
      )}
    </div>
  );
}

export default Checkbox;