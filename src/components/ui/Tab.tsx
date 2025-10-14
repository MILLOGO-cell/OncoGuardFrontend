"use client";

import * as React from "react";
import * as RadixTabs from "@radix-ui/react-tabs";
import clsx from "clsx";

type Tab = {
  label: string;
  value: string;
  content: React.ReactNode;
  icon?: React.ReactNode;
  badge?: React.ReactNode;
  disabled?: boolean;
};

type TabsProps = {
  tabs: Tab[];
  defaultValue?: string;
  onTabChange?: (value: string) => void;
  className?: string;
};

export function Tabs({ tabs, defaultValue, onTabChange, className }: TabsProps) {
  const [active, setActive] = React.useState(defaultValue ?? tabs[0]?.value);

  React.useEffect(() => {
    if (defaultValue && defaultValue !== active) setActive(defaultValue);
  }, [defaultValue, active]);

  const handleChange = (value: string) => {
    setActive(value);
    onTabChange?.(value);
  };

  return (
    <RadixTabs.Root
      value={active}
      onValueChange={handleChange}
      className={clsx("w-full", className)}
    >
      <RadixTabs.List className="flex border-b border-gray-200 dark:border-gray-700">
        {tabs.map((tab) => {
          const activeState = active === tab.value;
          return (
            <RadixTabs.Trigger
              key={tab.value}
              value={tab.value}
              disabled={tab.disabled}
              className={clsx(
                "px-4 py-2 text-sm font-medium transition-colors",
                "border-b-2 -mb-[2px] cursor-pointer",
                activeState
                  ? "bg-primary text-white border-primary"
                  : "text-gray-600 dark:text-gray-400 border-transparent hover:bg-muted hover:text-foreground",
                tab.disabled && "opacity-50 cursor-not-allowed"
              )}
            >
              <span className="inline-flex items-center gap-2">
                {tab.icon && <span className="shrink-0">{tab.icon}</span>}
                <span>{tab.label}</span>
                {tab.badge && (
                  <span className="ml-1 inline-flex items-center justify-center rounded-full bg-primary/10 text-primary px-2 text-[10px] font-medium">
                    {tab.badge}
                  </span>
                )}
              </span>
            </RadixTabs.Trigger>
          );
        })}
      </RadixTabs.List>

      {tabs.map((tab) => (
        <RadixTabs.Content
          key={tab.value}
          value={tab.value}
          className="mt-4 focus:outline-none"
          tabIndex={0}
        >
          {tab.content}
        </RadixTabs.Content>
      ))}
    </RadixTabs.Root>
  );
}

export default Tabs;
