"use client";

import { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type EmptyStateProps = {
  icon?: ReactNode;
  title?: string;
  description?: string;
  action?: { label: string; onClick: () => void } | ReactNode;
  className?: string;
};

export default function EmptyState({
  icon,
  title = "Nothing here yet",
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "w-full rounded-sm border border-border bg-card text-foreground p-12 grid place-items-center",
        className
      )}
    >
      <div className="flex flex-col items-center text-center gap-4 max-w-md">
        {icon && <div className="text-[var(--color-bronze-soft)]">{icon}</div>}
        <h3 className="font-serif text-2xl font-normal">{title}</h3>
        <div className="h-px w-12 rule-bronze" aria-hidden="true" />
        {description && (
          <p className="text-sm text-muted-foreground leading-relaxed">
            {description}
          </p>
        )}
        {typeof action === "object" && action && "label" in action ? (
          <Button className="mt-1" onClick={action.onClick}>
            {action.label}
          </Button>
        ) : (
          action && <div className="mt-1">{action}</div>
        )}
      </div>
    </div>
  );
}
