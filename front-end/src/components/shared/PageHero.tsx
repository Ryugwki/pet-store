"use client";

import Image from "next/image";
import type { ReactNode } from "react";

type PageHeroProps = {
  title: string;
  subtitle?: string;
  imageSrc?: string;
  children?: ReactNode;
};

export default function PageHero({
  title,
  subtitle,
  imageSrc,
  children,
}: PageHeroProps) {
  if (!imageSrc) {
    // Fallback when no image: centered editorial header
    return (
      <section className="bg-background border-b border-border">
        <div className="container mx-auto px-4 py-16 md:py-24 text-center">
          <span className="eyebrow block mb-5">LilyDrogon</span>
          <h1 className="font-serif text-4xl md:text-5xl font-light text-foreground tracking-tight">
            {title}
          </h1>
          <div className="mx-auto mt-6 h-px w-14 rule-bronze" aria-hidden="true" />
          {subtitle && (
            <p className="mt-6 text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              {subtitle}
            </p>
          )}
          {children && <div className="mt-8">{children}</div>}
        </div>
      </section>
    );
  }

  return (
    <section className="relative">
      <div className="relative w-full h-[220px] sm:h-[300px] md:h-[380px] lg:h-[420px] xl:h-[520px]">
        <Image
          src={imageSrc}
          alt={title}
          fill
          sizes="100vw"
          className="object-cover object-center"
          priority
        />
        {/* Readability scrim */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(90deg, rgba(22,19,15,.82) 0%, rgba(22,19,15,.55) 34%, rgba(22,19,15,.18) 64%, rgba(22,19,15,.34) 100%)",
          }}
          aria-hidden="true"
        />

        {/* Text overlay */}
        <div className="absolute inset-0 flex items-center">
          <div className="container mx-auto px-4">
            <div className="max-w-2xl">
              <span className="block mb-4 text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--color-bronze-soft)]">
                LilyDrogon
              </span>
              <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-light text-[#faf7f2] tracking-tight drop-shadow">
                {title}
              </h1>
              {subtitle && (
                <p className="mt-3 md:mt-5 text-[#faf7f2]/90 text-sm md:text-lg leading-relaxed max-w-xl">
                  {subtitle}
                </p>
              )}
              {children && <div className="mt-6">{children}</div>}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
