"use client";

import * as React from "react";
import * as RadixSlot from "@radix-ui/react-slot";
import { motion } from "framer-motion";
import clsx from "clsx";
import { FaSpinner } from "react-icons/fa";

type ButtonVariant =
  | "primary"
  | "secondary"
  | "success"
  | "danger"
  | "default"
  | "link"
  | "outline"
  | "ghost"
  | "flat";

type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  isLoading?: boolean;
  iconLeft?: React.ReactNode;
  iconRight?: React.ReactNode;
  asChild?: boolean;
  href?: string;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary: "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500",
  secondary: "bg-gray-200 text-gray-800 hover:bg-gray-300 focus:ring-gray-400",
  success: "bg-green-600 text-white hover:bg-green-700 focus:ring-green-500",
  danger: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500",
  default:
    "bg-white text-gray-800 border border-gray-300 hover:bg-gray-100 focus:ring-gray-400 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-700",
  link: "text-blue-600 underline hover:text-blue-800 focus:ring-blue-500 bg-transparent border-0",
  outline:
    "bg-transparent text-blue-600 border border-blue-600 hover:bg-blue-50 focus:ring-blue-500 dark:text-blue-400 dark:border-blue-400 dark:hover:bg-blue-900/30",
  ghost:
    "bg-transparent text-gray-800 hover:bg-gray-100 focus:ring-gray-400 dark:text-gray-200 dark:hover:bg-gray-700 focus:ring-2 focus:ring-offset-2",
  flat:
    "bg-transparent text-gray-800 dark:text-gray-200 hover:underline hover:bg-transparent border-0 focus:ring-0",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "h-9 px-3 text-sm",
  md: "h-10 px-4 text-sm",
  lg: "h-11 px-5 text-base",
};

export function Button({
  variant = "primary",
  size = "md",
  fullWidth = false,
  isLoading = false,
  iconLeft,
  iconRight,
  asChild = false,
  disabled,
  className,
  children,
  href,
  ...props
}: ButtonProps) {
  const isDisabled = disabled || isLoading;

  const classes = clsx(
    "inline-flex items-center justify-center rounded-md font-medium transition-colors focus:outline-none",
    variantClasses[variant],
    sizeClasses[size],
    fullWidth && "w-full",
    variant === "link" && "px-0 py-0",
    isDisabled ? "opacity-60 cursor-not-allowed" : "cursor-pointer",
    className
  );

  if (asChild) {
    return (
      <motion.div
        whileTap={{ scale: 0.97 }}
        whileHover={!isDisabled ? { scale: 1.02 } : undefined}
        className={clsx("inline-block", fullWidth && "w-full")}
      >
        <RadixSlot.Slot
          className={classes}
          aria-disabled={isDisabled || undefined}
          data-loading={isLoading || undefined}
          {...props}
        >
          {children as React.ReactElement}
        </RadixSlot.Slot>
      </motion.div>
    );
  }

  const Comp: any = variant === "link" ? "a" : "button";

  return (
    <motion.div
      whileTap={{ scale: 0.97 }}
      whileHover={!isDisabled ? { scale: 1.02 } : undefined}
      className={clsx("inline-block", fullWidth && "w-full")}
    >
      <Comp
        href={variant === "link" ? href : undefined}
        className={classes}
        disabled={variant !== "link" ? isDisabled : undefined}
        {...props}
      >
        {isLoading ? (
          <FaSpinner className="animate-spin mr-2 h-4 w-4" aria-hidden="true" />
        ) : (
          iconLeft && <span className="mr-2">{iconLeft}</span>
        )}
        {children}
        {!isLoading && iconRight && <span className="ml-2">{iconRight}</span>}
      </Comp>
    </motion.div>
  );
}

export default Button;
