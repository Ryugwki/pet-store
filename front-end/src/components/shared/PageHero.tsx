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
    // Fallback when no image: simple contained header
    return (
      <section className="bg-[#f8f8f8]">
        <div className="container mx-auto px-4 py-10 md:py-14">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-2 text-gray-600 max-w-2xl">{subtitle}</p>
          )}
          {children && <div className="mt-6">{children}</div>}
        </div>
      </section>
    );
  }

  return (
    <section className="relative">
      <div className="relative w-full h-[280px] sm:h-[320px] md:h-[380px] lg:h-[420px] xl:h-[640px]">
        <Image
          src={imageSrc}
          alt={title}
          fill
          sizes="100vw"
          className="object-cover"
          priority
        />
        {/* Readability overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-black/25 to-transparent" />

        {/* Text overlay */}
        <div className="absolute inset-0 flex items-center">
          <div className="container mx-auto px-4">
            <div className="max-w-2xl">
              <h1 className="text-3xl md:text-5xl font-bold text-white drop-shadow">
                {title}
              </h1>
              {subtitle && (
                <p className="mt-3 md:mt-4 text-white/90 text-base md:text-lg">
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
