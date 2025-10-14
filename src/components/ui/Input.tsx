"use client";

import React, { forwardRef, useState } from "react";
import { motion } from "framer-motion";
import clsx from "clsx";
import { Eye, EyeOff, XCircle } from "lucide-react";

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  error?: boolean | string;
  success?: boolean | string;
  clearable?: boolean;
  iconLeft?: React.ReactNode;
};

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      success,
      clearable,
      iconLeft,
      value,
      onChange,
      type = "text",
      className,
      ...props
    },
    ref
  ) => {
    const [showPassword, setShowPassword] = useState(false);

    const hasError = !!error;
    const hasSuccess = !!success;
    const isPassword = type === "password";

    const inputClass = clsx(
      "w-full h-10 px-3 py-2 rounded-md transition-all bg-background text-foreground border focus:outline-none focus:ring-2 focus:ring-offset-1",
      {
        "border-border focus:ring-ring": !hasError && !hasSuccess,
        "border-destructive focus:ring-destructive": hasError,
        "border-emerald-500 focus:ring-emerald-500": hasSuccess,
        "pl-9": !!iconLeft,
      },
      className
    );

    return (
      <div className="flex flex-col gap-1">
        {label && (
          <label className={clsx("text-sm transition-colors", hasError ? "text-destructive" : "text-muted-foreground")}>
            {label}
          </label>
        )}

        <motion.div whileFocus={{ scale: 1.01 }} className="relative">
          {iconLeft && (
            <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              {iconLeft}
            </div>
          )}

          <input
            ref={ref}
            type={isPassword && showPassword ? "text" : type}
            value={value}
            onChange={onChange}
            className={inputClass}
            {...props}
          />

          {isPassword && (
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground hover:text-foreground transition-colors"
              aria-label={showPassword ? "Cacher le mot de passe" : "Afficher le mot de passe"}
              tabIndex={-1}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          )}

          {clearable && value && (
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                if (onChange) {
                  const evt = { target: { value: "" } } as unknown as React.ChangeEvent<HTMLInputElement>;
                  onChange(evt);
                }
              }}
              className="absolute right-8 top-1/2 -translate-y-1/2 text-sm text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Effacer le contenu"
              tabIndex={-1}
            >
              <XCircle size={18} />
            </button>
          )}
        </motion.div>

        {hasError && typeof error === "string" && <p className="text-destructive text-xs">{error}</p>}
        {hasSuccess && typeof success === "string" && <p className="text-emerald-600 text-xs">{success}</p>}
      </div>
    );
  }
);

Input.displayName = "Input";

export default Input;
