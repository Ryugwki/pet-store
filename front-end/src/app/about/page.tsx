"use client";
import Image from "next/image";
import { useEffect, useState } from "react";
import { settingsAPI } from "@/lib/axios";
import Section from "@/components/shared/Section";

type About = { title?: string; content?: string; images?: string[] };

export default function AboutPage() {
  const [about, setAbout] = useState<About>({});

  useEffect(() => {
    let mounted = true;
    settingsAPI
      .get()
      .then((res) => {
        if (!mounted) return;
        const data = res.data as { about?: About };
        setAbout(data.about || {});
      })
      .catch(() => {});
    return () => {
      mounted = false;
    };
  }, []);

  const title = about.title || "About Us";
  const content =
    about.content ||
    "LilyTrinh & DrogonCoon Cattery is dedicated to breeding healthy, socialized Maine Coons and connecting them with loving families.";
  const images =
    about.images && about.images.length > 0
      ? about.images
      : ["/images/about.jpg"];

  // Sizes string tuned for max-w-4xl container
  const sizesStr =
    images.length > 1
      ? "(max-width: 640px) 100vw, (max-width: 1200px) 50vw, 448px"
      : "(max-width: 640px) 100vw, 896px"; // max-w-4xl = 896px

  return (
    <Section title={title} containerClassName="max-w-4xl">
      <p className="eyebrow mb-3">Our Story</p>
      <p className="font-serif text-xl md:text-2xl leading-relaxed text-foreground mb-3 whitespace-pre-line">
        {content}
      </p>
      <div className="h-px w-14 bg-[var(--color-bronze)] mb-8" aria-hidden="true" />
      <div
        className={`grid grid-cols-1 ${
          images.length > 1 ? "sm:grid-cols-2" : ""
        } gap-6`}
      >
        {images.map((src, i) => {
          const wrapperClass =
            images.length > 1
              ? "relative w-full aspect-[4/3]"
              : "relative w-full aspect-[16/9] sm:aspect-[4/3]";
          const imgClass =
            images.length > 1
              ? "object-cover ring-1 ring-border"
              : "object-contain bg-muted ring-1 ring-border";
          return (
            <div key={i} className={wrapperClass}>
              <Image
                src={src}
                alt={`About ${i + 1}`}
                fill
                sizes={sizesStr}
                className={imgClass}
                unoptimized
              />
            </div>
          );
        })}
      </div>
    </Section>
  );
}
