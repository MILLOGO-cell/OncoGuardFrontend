"use client";

import * as React from "react";
import Image from "next/image";
import clsx from "clsx";

type LogoPosition = "left" | "top";

interface LogoProps {
  src?: string;
  alt?: string;
  size?: number;  
  width?: number;
  height?: number;
  withText?: boolean;
  text?: string;
  textClassName?: string;
  className?: string;
  priority?: boolean;
  position?: LogoPosition;
  imageClassName?: string;
}

export function Logo({
  src = "/logo.png",
  alt = "Logo",
  size,
  width = 60,
  height = 60,
  withText = false,
  text = "MyCompany",
  textClassName,
  className,
  priority = false,
  position = "left",
  imageClassName,
}: LogoProps) {
  const imgWidth = size ?? width;
  const imgHeight = size ?? height;

  return (
    <div
      className={clsx(
        "flex",
        position === "top"
          ? "flex-col items-center gap-1"
          : "flex-row items-center gap-2",
        className
      )}
      style={{
        // Empêche le composant d'occuper tout l'espace horizontal
        // On peut ajuster si besoin (ex: maxWidth)
        maxWidth: position === "left" ? imgWidth * (withText ? 4 : 1) : "auto",
      }}
    >
      <Image
        src={src}
        alt={alt}
        width={imgWidth}
        height={imgHeight}
        priority={priority}
        className={clsx("object-contain", imageClassName)}
      />
      {withText && (
        <span
          className={clsx("font-bold", textClassName, {
            "text-base": imgWidth < 40,
            "text-lg": imgWidth >= 40 && imgWidth < 80,
            "text-xl": imgWidth >= 80,
          })}
          style={{
            userSelect: "none",
            whiteSpace: "nowrap",
          }}
        >
          {text}
        </span>
      )}
    </div>
  );
}

export default Logo;
