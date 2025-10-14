"use client";

import * as React from "react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import clsx from "clsx";
import Image from "next/image";

type DropdownItem = {
  label: string;
  icon?: React.ReactNode;
  onSelect: () => void;
  disabled?: boolean;
};

interface AvatarDropdownProps {
  avatarUrl?: string;
  items: DropdownItem[];
  username?: string;
  className?: string;
  name?: string;
}

function DefaultAvatarIcon() {
  return (
    <svg
      className="h-8 w-8 text-gray-400 dark:text-gray-500"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <circle cx="12" cy="8" r="4" />
      <path d="M6 20c0-3.5 6-4 6-4s6 .5 6 4" />
    </svg>
  );
}

export function AvatarDropdown({
  avatarUrl,
  items,
  username,
  className,
  name = "User",
}: AvatarDropdownProps) {
  const [imgError, setImgError] = React.useState(false);
  const isSvgImage = avatarUrl?.toLowerCase().endsWith(".svg");

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button
          className={clsx(
            "inline-flex items-center gap-3 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 shadow-sm transition",
            "hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-indigo-500",
            "dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700",
            className
          )}
          aria-label={`Menu utilisateur pour ${username ?? name}`}
        >
          <div className="relative h-8 w-8 rounded-full border border-gray-400 dark:border-gray-600 overflow-hidden bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
            {!avatarUrl || imgError ? (
              <DefaultAvatarIcon />
            ) : isSvgImage ? (
              <img
                src={avatarUrl}
                alt={name}
                className="h-8 w-8 object-cover"
                onError={() => setImgError(true)}
              />
            ) : (
              <Image
                src={avatarUrl}
                alt={name}
                fill
                className="object-cover"
                sizes="32px"
                onError={() => setImgError(true)}
                unoptimized
              />
            )}
          </div>
          {username && (
            <span className="select-none truncate max-w-[150px] text-gray-800 dark:text-gray-100">
              {username}
            </span>
          )}
          <svg
            className="h-4 w-4 shrink-0 text-gray-400 dark:text-gray-500"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          sideOffset={8}
          align="end"
          asChild
          className="z-50"
        >
          <div className="min-w-[200px] rounded-lg border border-gray-300 bg-white p-1 shadow-lg dark:border-gray-700 dark:bg-gray-900">
            {items.map((item, index) => (
              <DropdownMenu.Item
                key={index}
                onSelect={item.onSelect}
                disabled={item.disabled}
                className={clsx(
                  "flex cursor-pointer select-none items-center gap-3 rounded-md px-4 py-2 text-sm font-medium transition-colors",
                  "hover:bg-indigo-100 dark:hover:bg-indigo-700",
                  "focus:bg-indigo-100 dark:focus:bg-indigo-700 focus:outline-none",
                  item.disabled && "pointer-events-none opacity-50 cursor-default"
                )}
              >
                {item.icon && <span className="h-5 w-5 text-indigo-600 dark:text-indigo-400">{item.icon}</span>}
                <span className="truncate">{item.label}</span>
              </DropdownMenu.Item>
            ))}
          </div>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}

export default AvatarDropdown;
