"use client";

import * as React from "react";
import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";
import { motion } from "framer-motion";
import clsx from "clsx";
import { ChevronDown } from "lucide-react";

type DropdownItem = {
  label: string;
  value: string;
  icon?: React.ReactNode;
  disabled?: boolean;
  onSelect?: () => void;
};

interface DropdownMenuProps {
  triggerLabel: string;
  items: DropdownItem[];
  align?: "start" | "center" | "end";
  sideOffset?: number;
  className?: string;
}

export function DropdownMenu({
  triggerLabel,
  items,
  align = "start",
  sideOffset = 4,
  className,
}: DropdownMenuProps) {
  return (
    <DropdownMenuPrimitive.Root>
      <DropdownMenuPrimitive.Trigger asChild>
        <button
          className={clsx(
            "inline-flex items-center gap-1 cursor-pointer rounded-md border bg-background px-4 py-2 text-sm shadow-sm hover:bg-muted focus:outline-none focus:ring-2 focus:ring-ring",
            className
          )}
        >
          {triggerLabel}
          <ChevronDown className="h-4 w-4" />
        </button>
      </DropdownMenuPrimitive.Trigger>

      <DropdownMenuPrimitive.Portal>
        <DropdownMenuPrimitive.Content
          sideOffset={sideOffset}
          align={align}
          className="z-50 min-w-[160px] rounded-md border bg-white dark:bg-gray-800 p-1 shadow-md cursor-pointer"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.15 }}
          >
            {items.map((item, index) =>
              item.label === "---" ? (
                <DropdownMenuPrimitive.Separator
                  key={`separator-${index}`}
                  className="my-1 h-px bg-border"
                />
              ) : (
                <DropdownMenuPrimitive.Item
                  key={item.value}
                  disabled={item.disabled}
                  onSelect={item.onSelect}
                  className={clsx(
                    "flex cursor-pointer select-none items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors",
                    "focus:bg-muted focus:outline-none",
                    item.disabled && "pointer-events-none opacity-50"
                  )}
                >
                  {item.icon && <span className="h-4 w-4">{item.icon}</span>}
                  {item.label}
                </DropdownMenuPrimitive.Item>
              )
            )}
          </motion.div>
        </DropdownMenuPrimitive.Content>
      </DropdownMenuPrimitive.Portal>
    </DropdownMenuPrimitive.Root>
  );
}

export default DropdownMenu;
