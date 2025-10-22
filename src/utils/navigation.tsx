// src/utils/navigation.ts
"use client";

import { useNavigationContext } from "@/providers/NavigationProvider";
import { useRouter } from "next/navigation";
import { useCallback } from "react";

export function useNavigation() {
  const router = useRouter();
  const { isNavigating, begin } = useNavigationContext();

  const goTo = useCallback(
    (path: string) => {
      begin();
      router.push(path);
    },
    [router, begin]
  );

  const replace = useCallback(
    (path: string) => {
      begin();
      router.replace(path);
    },
    [router, begin]
  );

  const back = useCallback(() => {
    begin();
    router.back();
  }, [router, begin]);

  return { goTo, replace, back, isNavigating };
}
