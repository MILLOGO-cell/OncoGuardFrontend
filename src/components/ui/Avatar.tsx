// components/ui/Avatar.tsx
"use client";

import Image from "next/image";
import clsx from "clsx";
import { useEffect, useState } from "react";

interface AvatarProps {
  name: string;
  src?: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  className?: string;
  rounded?: "full" | "lg" | "md" | "none";
}

export function Avatar({
  name,
  src,
  size = "md",
  className,
  rounded = "full",
}: AvatarProps) {
  const [initials, setInitials] = useState("");

  // Génère les initiales à partir du nom
  useEffect(() => {
    const generatedInitials = name
      .split(" ")
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? "")
      .join("");
    setInitials(generatedInitials);
  }, [name]);

  const sizeClasses = {
    xs: "h-6 w-6 text-xs",
    sm: "h-8 w-8 text-sm",
    md: "h-10 w-10 text-base",
    lg: "h-12 w-12 text-lg",
    xl: "h-14 w-14 text-xl",
  };

  const roundedClasses = {
    full: "rounded-full",
    lg: "rounded-lg",
    md: "rounded-md",
    none: "rounded-none",
  };

  return (
    <div
      className={clsx(
        "relative flex items-center justify-center bg-gray-200 dark:bg-gray-700 font-medium text-gray-700 dark:text-gray-200 overflow-hidden",
        sizeClasses[size],
        roundedClasses[rounded],
        className
      )}
    >
      {src ? (
        <Image
          src={src}
          alt={name}
          fill
          className="object-cover"
          sizes={`${sizeClasses[size].split(" ")[0]}`}
          onError={(e) => {
            // Fallback si l'image ne charge pas
            const target = e.target as HTMLImageElement;
            target.style.display = "none";
          }}
        />
      ) : (
        initials
      )}
    </div>
  );
}

export default Avatar;