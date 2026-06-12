"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { settingsAPI } from "@/lib/axios";

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

  // first image anchors the story photo; the rest become the gallery
  const heroImage = images[0];
  const galleryImages = images.slice(1);

  // split story copy into paragraphs (mockup: about.content -> <p> per block)
  const paragraphs = content
    .split(/\n+/)
    .map((p) => p.trim())
    .filter(Boolean);

  return (
    <section className="concept" id="view-about">
      <div className="listing-hero">
        <span className="label">The Cattery</span>
        <h1 id="aboutPageTitle">{title}</h1>
        <p id="aboutPageTagline">
          A small, home-based Maine Coon cattery.
        </p>
      </div>

      <section className="about">
        <div className="about-grid">
          <div className="about-photo">
            <div
              className="ph"
              id="aboutPagePhoto"
              role="img"
              aria-label="The cattery at home"
              style={
                heroImage
                  ? { backgroundImage: `url('${heroImage}')` }
                  : undefined
              }
            />
            <p className="ph-caption">At home with our cats</p>
          </div>
          <div className="about-copy">
            <span className="label">Our story</span>
            <div className="drop-rule" />
            <div id="aboutPageBody">
              {paragraphs.length ? (
                paragraphs.map((p, i) => <p key={i}>{p}</p>)
              ) : (
                <p>—</p>
              )}
            </div>
            <div className="hero-ctas" style={{ marginTop: 8 }}>
              <Link className="btn btn-solid" href="/cats">
                Meet the cats
              </Link>
              <Link className="textlink" href="/contact">
                Get in touch
              </Link>
            </div>
          </div>
        </div>
      </section>

      {galleryImages.length > 0 && (
        <section
          className="wrap"
          id="aboutPageGalleryWrap"
          style={{ padding: "0 32px 84px" }}
        >
          <div className="about-page-gallery" id="aboutPageGallery">
            {galleryImages.map((src, i) => (
              <div
                key={i}
                className="ph"
                role="img"
                aria-label="The cattery"
                style={{ backgroundImage: `url('${src}')` }}
              />
            ))}
          </div>
        </section>
      )}
    </section>
  );
}
