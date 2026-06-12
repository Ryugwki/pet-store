"use client";

import { useState } from "react";
import Image from "next/image";
import ZoomableImage from "@/components/shared/ZoomableImage";

type ExtraImage = { src: string; label: string };

type Props = {
  name: string;
  breed: string;
  images: string[];
  /** neutral litter status string, shown as a bronze tag if present */
  tag?: string | null;
  extras: ExtraImage[];
};

/**
 * Mirrors the mockup's #view-detail .gallery block:
 *   .gallery-main (swaps on thumb click) + .gallery-thumbs + .ph-caption
 *   + .extra-gallery for pedigree / awards / certificate images.
 * Real Next.js <Image> elements replace the mockup's CSS background-image
 * placeholders, and ZoomableImage adds click-to-zoom — same data, faithful look.
 */
export default function DetailGallery({
  name,
  breed,
  images,
  tag,
  extras,
}: Props) {
  const hasImages = images.length > 0;
  const [current, setCurrent] = useState<number>(0);
  const mainSrc = hasImages ? images[current] : "/images/placeholder.svg";

  return (
    <div className="gallery">
      {/* main */}
      <ZoomableImage src={mainSrc} alt={`${name} portrait`}>
        <div
          className="gallery-main ph"
          role="img"
          aria-label={`${name} portrait`}
        >
          <Image
            src={mainSrc}
            alt={`${name} portrait`}
            fill
            sizes="(min-width: 980px) 52vw, 100vw"
            className="object-cover"
            style={{ position: "absolute", inset: 0 }}
            unoptimized={mainSrc.startsWith("http")}
          />
          {tag ? <span className="tag tag-bronze">{tag}</span> : null}
        </div>
      </ZoomableImage>

      {/* thumbs — only when more than one photo, matching the mockup */}
      {images.length > 1 && (
        <div className="gallery-thumbs">
          {images.map((src, i) => (
            <button
              key={`thumb-${i}`}
              type="button"
              className={"ph" + (i === current ? " current" : "")}
              aria-label={`View image ${i + 1}`}
              aria-pressed={i === current}
              onClick={() => setCurrent(i)}
              style={{ padding: 0, border: 0, cursor: "pointer" }}
            >
              <Image
                src={src}
                alt={`${name} image ${i + 1}`}
                fill
                sizes="120px"
                className="object-cover"
                style={{ position: "absolute", inset: 0 }}
                unoptimized={src.startsWith("http")}
              />
            </button>
          ))}
        </div>
      )}

      <p className="ph-caption">
        {hasImages
          ? `${breed || "Maine Coon"} · ${name}`
          : "Photography coming soon"}
      </p>

      {/* extra gallery: pedigree + awards + certificate — fetched but
          previously surfaced only at the foot of the page */}
      {extras.length > 0 && (
        <div className="extra-gallery">
          <span className="label">Pedigree &amp; awards</span>
          <div className="extra-grid">
            {extras.map((x, i) => (
              <ZoomableImage
                key={`extra-${i}`}
                src={x.src}
                alt={`${x.label} ${i + 1}`}
              >
                <div className="ph" role="img" aria-label={x.label}>
                  <Image
                    src={x.src}
                    alt={`${x.label} ${i + 1}`}
                    fill
                    sizes="120px"
                    className="object-cover"
                    style={{ position: "absolute", inset: 0 }}
                    unoptimized={x.src.startsWith("http")}
                  />
                  <small>{x.label}</small>
                </div>
              </ZoomableImage>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
