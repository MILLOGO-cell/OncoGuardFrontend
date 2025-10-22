// src/providers/NavigationProvider.tsx
"use client";

import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { usePathname } from "next/navigation";

type NavCtx = {
  isNavigating: boolean;
  begin: () => void;
  end: () => void;
  minVisibleMs: number;
};

const NavigationContext = createContext<NavCtx | null>(null);

export function NavigationProvider({
  children,
  minVisibleMs = 300,
}: {
  children: React.ReactNode;
  minVisibleMs?: number;
}) {
  const pathname = usePathname();
  const [isNavigating, setIsNavigating] = useState(false);
  const startedAtRef = useRef<number | null>(null);
  const hideTimerRef = useRef<number | null>(null);

  const begin = useCallback(() => {
    if (!isNavigating) {
      setIsNavigating(true);
      startedAtRef.current = Date.now();
    }
  }, [isNavigating]);

  const end = useCallback(() => {
    const elapsed = startedAtRef.current ? Date.now() - startedAtRef.current : 0;
    const remaining = Math.max(0, minVisibleMs - elapsed);
    if (hideTimerRef.current) window.clearTimeout(hideTimerRef.current);
    hideTimerRef.current = window.setTimeout(() => {
      setIsNavigating(false);
      startedAtRef.current = null;
    }, remaining) as unknown as number;
  }, [minVisibleMs]);

  useEffect(() => {
    if (isNavigating) end();
    return () => {
      if (hideTimerRef.current) window.clearTimeout(hideTimerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  const value = useMemo<NavCtx>(() => ({ isNavigating, begin, end, minVisibleMs }), [isNavigating, begin, end, minVisibleMs]);

  return <NavigationContext.Provider value={value}>{children}</NavigationContext.Provider>;
}

export function useNavigationContext() {
  const ctx = useContext(NavigationContext);
  if (!ctx) throw new Error("NavigationContext not found. Wrap app with <NavigationProvider/>.");
  return ctx;
}
