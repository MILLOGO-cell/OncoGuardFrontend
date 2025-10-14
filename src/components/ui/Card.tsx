"use client"
import { HTMLMotionProps, motion } from "framer-motion";
import clsx from "clsx";
import { Button, ButtonProps } from "./Button";

interface CardProps extends Omit<HTMLMotionProps<"div">, "children"> {
  children?: React.ReactNode;
  title?: string;
  subtitle?: string;
  action?: {
    label: string;
    onClick: () => void;
    variant?: ButtonProps["variant"];
    icon?: React.ReactNode;
  };
  bordered?: boolean;
  shadow?: boolean;
  hoverEffect?: boolean;
}

export function Card({
  title,
  subtitle,
  action,
  bordered = true,
  shadow = true,
  hoverEffect = true,
  className,
  children,
  ...props
}: CardProps) {
  return (
    <motion.div
      whileHover={hoverEffect ? { y: -2 } : {}}
      className={clsx(
        "rounded-lg bg-white dark:bg-gray-900 overflow-hidden",
        bordered && "border border-gray-200 dark:border-gray-700",
        shadow && "shadow-sm",
        className
      )}
      {...props}
    >
      {(title || subtitle || action) && (
        <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-700">
          <div>
            {title && (
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                {title}
              </h3>
            )}
            {subtitle && (
              <p className="text-sm text-gray-500 dark:text-gray-400">{subtitle}</p>
            )}
          </div>
          {action && (
            <Button
              variant={action.variant ?? "default"}
              size="sm"
              onClick={action.onClick}
              iconRight={action.icon}
            >
              {action.label}
            </Button>
          )}
        </div>
      )}
      <div className="p-4">{children}</div>
    </motion.div>
  );
}

export default Card;
