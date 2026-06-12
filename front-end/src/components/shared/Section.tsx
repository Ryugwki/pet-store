"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type SectionProps = {
  title?: string;
  subtitle?: string;
  children: ReactNode;
  className?: string;
  headerClassName?: string;
  containerClassName?: string;
  center?: boolean;
  actions?: ReactNode;
};

export default function Section({
  title,
  subtitle,
  children,
  className,
  headerClassName,
  containerClassName,
  center = false,
  actions,
}: SectionProps) {
  return (
    <section
      className={cn(
        "py-14 md:py-20 bg-background text-foreground",
        className
      )}
    >
      <div className={cn("container mx-auto px-4", containerClassName)}>
        {(title || subtitle || actions) && (
          <div
            className={cn(
              "mb-10 flex flex-col gap-3 md:mb-14",
              center ? "items-center text-center" : "items-start",
              headerClassName
            )}
          >
            {title && (
              <h2 className="font-serif text-3xl md:text-4xl font-light tracking-tight">
                {title}
              </h2>
            )}
            {title && (
              <div
                className={cn(
                  "h-px w-14 mt-1 rule-bronze",
                  center && "mx-auto"
                )}
                aria-hidden="true"
              />
            )}
            {subtitle && (
              <p className="text-muted-foreground max-w-2xl leading-relaxed">
                {subtitle}
              </p>
            )}
            {actions && <div className={cn(center && "mt-1")}>{actions}</div>}
          </div>
        )}
        {children}
      </div>
    </section>
  );
}
