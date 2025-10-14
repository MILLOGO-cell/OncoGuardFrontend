"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import * as Tooltip from "@radix-ui/react-tooltip";
import clsx from "clsx";
import { useNavigation } from "@/utils/navigation";

export interface SubItem {
  label: string;
  href: string;
}

export interface ItemModel {
  icon: React.ReactNode;
  label: string;
  href?: string;
  subItems?: SubItem[];
  requiredPermissions?: string[];
  onClick?: () => void;
}

interface ItemProps extends ItemModel {
  isCollapsed?: boolean;
  currentPath?: string;
  activeMatcher?: (pathname: string, item: { href?: string; subItems?: { href: string }[] }) => boolean;
  className?: string;
  onNavigate?: (href: string) => void; // optionnel — sinon on utilise goTo()
}

export function Item({
  icon,
  label,
  href,
  subItems,
  isCollapsed = false,
  currentPath,
  activeMatcher,
  onClick,
  className,
  onNavigate,
}: ItemProps) {
  const pathname = usePathname();
  const path = currentPath ?? pathname;

  const { goTo } = useNavigation();                    
  const navigate = onNavigate ?? goTo;                 

  const hasChildren = !!subItems?.length;
  const hasAction = !!onClick;
  const isActive = (activeMatcher ?? defaultActiveMatcher)(path, { href, subItems });

  const [open, setOpen] = React.useState<boolean>(false);
  React.useEffect(() => {
    if (hasChildren) {
      setOpen(isActive && !!subItems?.some((s) => path.startsWith(s.href)));
    }
  }, [path, hasChildren, isActive, subItems]);

  const baseItemCls =
    "group relative flex items-center rounded-md text-sm leading-5 transition-colors outline-none";
  const paddings = isCollapsed ? "px-2 py-2.5" : "px-3 py-2.5";
  const colors = isActive
    ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-200"
    : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800";
  const cursorStyle = isCollapsed ? "cursor-default" : "cursor-pointer";

  const leftIndicatorCls = clsx(
    "absolute left-0 top-1 bottom-1 w-1 rounded-r-full",
    isActive
      ? "bg-indigo-600"
      : "bg-indigo-600/0 group-hover:bg-indigo-600/40 dark:group-hover:bg-indigo-400/40"
  );

  // Autoriser ouverture nouvel onglet/fenêtre (cmd/ctrl/shift/alt/clic milieu)
  const isModifiedClick = (e: React.MouseEvent) =>
    e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button === 1;

  const handleButtonClick = (e: React.MouseEvent) => {
    if (hasChildren) {
      setOpen((v) => !v);
      return;
    }
    if (hasAction) {
      onClick?.();
      return;
    }
    if (href) {
      if (isModifiedClick(e)) return;
      navigate(href);
    }
  };

  const handleAnchorClick = (e: React.MouseEvent, targetHref: string) => {
    if (isModifiedClick(e)) return; // laisser le comportement natif
    e.preventDefault();
    navigate(targetHref);
  };

  const content = (
    <button
      type="button"
      onClick={handleButtonClick}
      className={clsx(baseItemCls, paddings, colors, "w-full", cursorStyle, className)}
      aria-expanded={hasChildren ? open : undefined}
      aria-current={isActive ? "page" : undefined}
    >
      <span aria-hidden className={leftIndicatorCls} />
      <span className="mr-2 inline-flex h-5 w-5 shrink-0 items-center justify-center text-current">
        {icon}
      </span>
      {!isCollapsed && <span className="min-w-0 flex-1 truncate text-left">{label}</span>}
      {hasChildren && !isCollapsed && (
        <svg
          className={clsx(
            "ml-2 h-4 w-4 shrink-0 text-gray-500 transition-transform dark:text-gray-400",
            open ? "rotate-180" : "rotate-0"
          )}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          aria-hidden
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 9l6 6 6-6" />
        </svg>
      )}
    </button>
  );

  if (href && !hasChildren && !hasAction) {
    return (
      <Tooltip.Provider delayDuration={200} disableHoverableContent={false}>
        <Tooltip.Root>
          <Tooltip.Trigger asChild>
            <Link
              href={href}
              onClick={(e) => handleAnchorClick(e, href)}
              className={clsx(baseItemCls, paddings, colors, "w-full", cursorStyle, className)}
              aria-current={isActive ? "page" : undefined}
            >
              <span aria-hidden className={leftIndicatorCls} />
              <span className="mr-2 inline-flex h-5 w-5 shrink-0 items-center justify-center text-current">
                {icon}
              </span>
              {!isCollapsed && <span className="min-w-0 flex-1 truncate">{label}</span>}
            </Link>
          </Tooltip.Trigger>
          {isCollapsed && (
            <Tooltip.Portal>
              <Tooltip.Content
                side="right"
                align="center"
                className="z-50 rounded-md bg-gray-900 px-2 py-1 text-xs text-white shadow-md dark:bg-gray-100 dark:text-gray-900"
              >
                {label}
                <Tooltip.Arrow className="fill-gray-900 dark:fill-gray-100" />
              </Tooltip.Content>
            </Tooltip.Portal>
          )}
        </Tooltip.Root>
      </Tooltip.Provider>
    );
  }

  return (
    <Tooltip.Provider delayDuration={200}>
      <div>
        <Tooltip.Root>
          <Tooltip.Trigger asChild>{content}</Tooltip.Trigger>
          {isCollapsed && (
            <Tooltip.Portal>
              <Tooltip.Content
                side="right"
                align="center"
                className="z-50 rounded-md bg-gray-900 px-2 py-1 text-xs text-white shadow-md dark:bg-gray-100 dark:text-gray-900"
              >
                {label}
                <Tooltip.Arrow className="fill-gray-900 dark:fill-gray-100" />
              </Tooltip.Content>
            </Tooltip.Portal>
          )}
        </Tooltip.Root>

        <AnimatePresence initial={false}>
          {hasChildren && !isCollapsed && open && (
            <motion.ul
              key="submenu"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="ml-6 overflow-hidden pt-1"
            >
              {subItems!.map((sub) => {
                const subActive = path === sub.href || path.startsWith(sub.href + "/");
                return (
                  <li key={sub.href}>
                    <Link
                      href={sub.href}
                      onClick={(e) => handleAnchorClick(e, sub.href)}
                      className={clsx(
                        "relative block rounded-md px-2 py-2 text-sm transition-colors",
                        subActive
                          ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-200"
                          : "text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
                      )}
                      aria-current={subActive ? "page" : undefined}
                    >
                      <span
                        aria-hidden
                        className={clsx(
                          "absolute -left-3 top-0 h-full w-px",
                          subActive
                            ? "bg-indigo-400/80 dark:bg-indigo-400/60"
                            : "bg-gray-200 dark:bg-gray-800"
                        )}
                      />
                      {sub.label}
                    </Link>
                  </li>
                );
              })}
            </motion.ul>
          )}
        </AnimatePresence>
      </div>
    </Tooltip.Provider>
  );
}

function defaultActiveMatcher(
  pathname: string,
  item: { href?: string; subItems?: { href: string }[] }
) {
  if (item.href && pathname === item.href) return true;
  if (item.href && pathname.startsWith(item.href + "/")) return true;
  if (item.subItems?.some((s) => pathname === s.href || pathname.startsWith(s.href + "/")))
    return true;
  return false;
}
