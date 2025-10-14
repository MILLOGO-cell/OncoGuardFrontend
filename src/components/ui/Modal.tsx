"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import clsx from "clsx";

interface ModalProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  footerContent?: React.ReactNode;
  size?: "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "full";
  closeOnOverlayClick?: boolean;
  className?: string;
}

export default function Modal({
  open,
  onOpenChange,
  title,
  description,
  children,
  footerContent,
  size = "md",
  closeOnOverlayClick = true,
  className,
}: ModalProps) {
  const isControlled = open !== undefined;
  const [internalOpen, setInternalOpen] = React.useState(false);
  const actualOpen = isControlled ? !!open : internalOpen;

  const handleOpenChange = (next: boolean) => {
    if (!isControlled) setInternalOpen(next);
    onOpenChange?.(next);
  };

  const [portalEl, setPortalEl] = React.useState<HTMLElement | null>(null);
  React.useEffect(() => {
    if (typeof document === "undefined") return;
    const el = document.createElement("div");
    el.setAttribute("data-modal-portal", "true");
    document.body.appendChild(el);
    setPortalEl(el);
    return () => {
      try {
        document.body.removeChild(el);
      } catch {}
    };
  }, []);

  React.useEffect(() => {
    if (!actualOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [actualOpen]);

  const dialogRef = React.useRef<HTMLDivElement | null>(null);
  const lastFocused = React.useRef<HTMLElement | null>(null);

  React.useLayoutEffect(() => {
    if (!actualOpen) return;
    lastFocused.current = (document.activeElement as HTMLElement) ?? null;
    const root = dialogRef.current;
    const focusable =
      root?.querySelector<HTMLElement>("[data-autofocus]") ??
      root?.querySelector<HTMLElement>("button, [href], input, select, textarea, [tabindex]:not([tabindex='-1'])") ??
      root;
    focusable?.focus();
    return () => {
      lastFocused.current?.focus?.();
    };
  }, [actualOpen]);

  const sizeClasses = {
    xs: "max-w-sm",
    sm: "max-w-md",
    md: "max-w-lg",
    lg: "max-w-2xl",
    xl: "max-w-4xl",
    "2xl": "max-w-5xl",
    "3xl": "max-w-6xl",
    "4xl": "max-w-7xl",
    full: "max-w-full h-full",
  };

  if (!portalEl) return null;

  return createPortal(
    <AnimatePresence initial={false}>
      {actualOpen && (
        <>
          <motion.div
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onMouseDown={(e) => {
              if (!closeOnOverlayClick) return;
              if (e.target === e.currentTarget) handleOpenChange(false);
            }}
            aria-hidden
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby={title ? "modal-title" : undefined}
            aria-describedby={description ? "modal-desc" : undefined}
            className={clsx(
              "fixed left-1/2 top-1/2 z-50 w-full rounded-lg bg-white dark:bg-gray-900 p-6 shadow-lg",
              "transform -translate-x-1/2 -translate-y-1/2",
              size === "full" ? "max-h-full rounded-none" : "",
              sizeClasses[size as keyof typeof sizeClasses],
              className
            )}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            style={size === "full" ? { height: "100vh", maxHeight: "100vh" } : undefined}
            ref={dialogRef}
            tabIndex={-1}
          >
            <div className="flex items-start justify-between gap-4">
              {title && (
                <h2 id="modal-title" className="text-lg font-semibold">
                  {title}
                </h2>
              )}
              <button
                type="button"
                className="rounded-md cursor-pointer p-1 hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none"
                aria-label="Close"
                onClick={() => handleOpenChange(false)}
              >
                <X className="h-5 w-5 text-gray-700 dark:text-gray-300" />
              </button>
            </div>

            {description && (
              <p id="modal-desc" className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                {description}
              </p>
            )}

            <div className="mt-4">{children}</div>

            {footerContent && <div className="mt-6 flex justify-end gap-2">{footerContent}</div>}
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    portalEl
  );
}
