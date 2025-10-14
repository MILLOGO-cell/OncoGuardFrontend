"use client";

import React from "react";

interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  label?: string;
  className?: string;
}

export function Switch({ checked, onChange, disabled = false, label, className }: SwitchProps) {
  return (
    <label
      className={`inline-flex items-center cursor-pointer select-none ${disabled ? "opacity-50 cursor-not-allowed" : ""} ${className}`}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        disabled={disabled}
        className="sr-only"
      />
      <span
        className={`w-11 h-6 rounded-full relative transition-colors duration-300 ease-in-out 
          ${checked ? "bg-blue-600" : "bg-gray-300 dark:bg-gray-600"}`}
      >
        <span
          className={`block w-5 h-5 bg-white rounded-full shadow transform transition-transform duration-300 ease-in-out
            ${checked ? "translate-x-5" : "translate-x-1"}`}
        />
      </span>
      {label && <span className="ml-3 text-sm text-gray-700 dark:text-gray-300">{label}</span>}
    </label>
  );
}
