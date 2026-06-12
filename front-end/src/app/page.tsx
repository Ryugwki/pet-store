"use client";
import { Fragment, useEffect, useRef, useState } from "react";
import Link from "next/link";
import PetCard from "@/components/shared/PetCard";
import { settingsAPI, petsAPI } from "@/lib/axios";
import { sanitizeHtml } from "@/lib/sanitizeHtml";
import type { Pet } from "@/types";

type HomeSection = {
  _id?: string;
  title?: string;
  contentHtml?: string;
  bgColor?: string;
  textColor?: string;
  fontSize?: number;
  order?: number;
};

type AboutSettings = {
  title?: string;
  content?: string;
  images?: string[];
};

type ContactSettings = {
  email?: string;
  phone?: string;
  address?: string;
  imessage?: string;
};

type BackendPet = Omit<Pet, "id"> & {
  _id: string;
  dob?: string;
  pedigreeURL?: string;
  petImages?: string[];
};

export default function HomePage() {
  const [hero, setHero] = useState<{
    title?: string;
    subtitle?: string;
    image?: string;
    images?: string[];
  }>({});
  const [sections, setSections] = useState<HomeSection[]>([]);
  const [about, setAbout] = useState<AboutSettings>({});
  const [contact, setContact] = useState<ContactSettings>({});
  const [pets, setPets] = useState<BackendPet[]>([]);
  const [loadingPets, setLoadingPets] = useState(true);
  const [featuredPos, setFeaturedPos] = useState<number>(0);

  useEffect(() => {
    let mounted = true;
    settingsAPI
      .get()
      .then((res) => {
        if (!mounted) return;
        const arr = (res.data?.sections as HomeSection[]) || [];
        setSections([...arr].sort((a, b) => (a.order ?? 0) - (b.order ?? 0)));
        const count = arr.length;
        // C5: featuredPosition is a 1-based slot in [1 .. count+1]. Treat 0 and
        // non-numeric as "unset" and default to 1 (don't let `|| count+1` swallow
        // a legitimate 0); clamp any out-of-range value back into the valid range.
        const rawPos = Number(res.data?.featuredPosition);
        const pos =
          Number.isFinite(rawPos) && rawPos >= 1 && rawPos <= count + 1
            ? rawPos
            : 1;
        setFeaturedPos(pos);
        const h =
          (res.data?.hero?.home as {
            title?: string;
            subtitle?: string;
            image?: string;
            images?: string[];
          }) || {};
        setHero(h || {});
        setAbout((res.data?.about as AboutSettings) || {});
        setContact((res.data?.contact as ContactSettings) || {});
      })
      .catch(() => setSections([]));
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    let mounted = true;
    petsAPI
      .getFeatured()
      .then((res) => {
        if (!mounted) return;
        const data: BackendPet[] = (res.data.items ?? res.data) as BackendPet[];
        setPets(Array.isArray(data) ? data : []);
      })
      .catch(() => setPets([]))
      .finally(() => setLoadingPets(false));
    return () => {
      mounted = false;
    };
  }, []);

  // about teaser: first two paragraphs of settings.about.content (mockup parity)
  const aboutParas = String(about.content || "")
    .split(/\n+/)
    .map((t) => t.trim())
    .filter(Boolean)
    .slice(0, 2);
  const aboutPhoto = (about.images || []).filter(Boolean)[0] || "";
  const telHref = contact.phone
    ? `tel:${String(contact.phone).replace(/[^+\d]/g, "")}`
    : "";

  return (
    <>
      {/* (1) full-bleed hero slider over the real hero.images */}
      <HeroSlider
        title={hero.title || "Welcome to our Cattery"}
        subtitle={hero.subtitle || "Healthy, socialized cats and kittens."}
        images={(hero.images || []).filter(Boolean)}
      />

      {/* (2) hero-stats band */}
      <section className="hero-stats-band">
        <div className="wrap">
          <div className="hero-stats">
            <div className="hero-stat">
              <b>100%</b>
              <span>
                Health-tested lines
                <br />
                HCM · SMA · PKD
              </span>
            </div>
            <div className="hero-stat">
              <b>{loadingPets ? "—" : String(pets.length)}</b>
              <span>
                Cats in our
                <br />
                current catalogue
              </span>
            </div>
            <div className="hero-stat">
              <b>3–5 yrs</b>
              <span>
                The slow maturing of a
                <br />
                true gentle giant
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* (3) featured cats — "nursery" section */}
      {featuredPos === 1 && (
        <FeaturedNursery pets={pets} loading={loadingPets} />
      )}

      {/* (4) admin-managed homepage sections, Featured inserted at selected position */}
      {sections.map((sec, idx) => {
        const themeClass = `themed-${sec._id || idx}`;
        // Force the Heritage (mockup) palette — ignore the admin-set bgColor/
        // textColor so every section renders as a clean ivory/charcoal panel.
        const titleSize = sec.fontSize ? `${sec.fontSize}px` : undefined;
        const key = sec._id || `${sec.title}-${sec.order}`;
        return (
          <Fragment key={key}>
            {featuredPos === idx + 1 && idx + 1 !== 1 && (
              <FeaturedNursery pets={pets} loading={loadingPets} />
            )}
            <section className="cms-section">
              <style jsx>{`
                .cms-section {
                  background: var(--paper, #fffdf8);
                  border-top: 1px solid var(--hairline, #e6decf);
                  padding: 64px 0;
                }
                .${themeClass} {
                  background-color: var(--color-card);
                  color: var(--color-text);
                }
                /* Force the mockup palette: strip admin/Quill inline colours + highlights */
                .${themeClass} [style*="background"],
                .${themeClass} [style*="background-color"],
                .${themeClass} [class*="ql-bg-"],
                .${themeClass} mark {
                  background: transparent !important;
                  background-color: transparent !important;
                }
                .${themeClass} [style*="color"] {
                  color: inherit !important;
                }
                .${themeClass} ul {
                  list-style: disc !important;
                  list-style-position: outside;
                  padding-left: 1.25rem;
                  margin: 0.5rem 0;
                }
                .${themeClass} ol {
                  list-style: decimal !important;
                  list-style-position: outside;
                  padding-left: 1.25rem;
                  margin: 0.5rem 0;
                }
                .${themeClass} li {
                  margin: 0.25rem 0;
                  display: list-item;
                  padding-left: 0.125rem;
                }
                .${themeClass} li::marker {
                  color: currentColor;
                }
                .${themeClass} [data-list="bullet"],
                .${themeClass} [data-list="ordered"] {
                  display: list-item;
                  margin-left: 1.25rem;
                  margin-top: 0.25rem;
                  margin-bottom: 0.25rem;
                }
                .${themeClass} [data-list="bullet"]::marker {
                  content: "\\u2022 ";
                }
                .${themeClass} [data-list="ordered"]::marker {
                  content: counter(list-item) ". ";
                }
                .${themeClass} [data-list="bullet"]:not(li) {
                  display: block;
                  position: relative;
                  padding-left: 1.25rem;
                }
                .${themeClass} [data-list="bullet"]:not(li)::before {
                  content: "\\u2022";
                  position: absolute;
                  left: 0;
                  color: currentColor;
                }
                .${themeClass}-title {
                  ${titleSize ? `font-size: ${titleSize};` : ""}
                }
              `}</style>
              <div className="wrap">
                <div
                  className={`rounded-md border border-border px-6 py-7 md:px-8 md:py-9 ${themeClass}`}
                >
                  {sec.title && (
                    <>
                      <h2
                        className={`font-serif text-center ${themeClass}-title`}
                      >
                        {sec.title}
                      </h2>
                      <div className="drop-rule mx-auto mt-3 mb-6" />
                    </>
                  )}
                  <HtmlContent
                    className="prose max-w-none [&_*]:!text-inherit [&_*]:!leading-relaxed prose-ul:list-disc prose-ol:list-decimal prose-li:my-1"
                    html={sanitizeHtml(sec.contentHtml || "")}
                  />
                </div>
              </div>
            </section>
          </Fragment>
        );
      })}
      {/* If Featured position is after all sections */}
      {sections.length + 1 === featuredPos && featuredPos !== 1 && (
        <FeaturedNursery pets={pets} loading={loadingPets} />
      )}

      {/* (5) trust strip — registries folded into column No.2 */}
      <section className="trust">
        <div className="trust-inner">
          <span className="label">
            Why families wait for one of our kittens
          </span>
          <h2>Bred with the patience of a much older tradition.</h2>
          <div className="trust-cols">
            <div className="trust-col">
              <span className="trust-col-num">No. 1</span>
              <h3>Health, proven on paper</h3>
              <p>
                Our lines are DNA-tested clear for HCM, SMA and PKD, with cardiac
                ultrasounds and full DNA panels. Results are shared openly with
                every family who asks.
              </p>
            </div>
            <div className="trust-col">
              <span className="trust-col-num">No. 2</span>
              <h3>Registered pedigree</h3>
              <p>
                We register every cat and kitten with the World Cat Federation
                (WCF) and the Cat Fanciers&rsquo; Association (CFA). Each kitten
                carries papers tracing to European champion catteries, viewable
                in full on PawPeds.
              </p>
            </div>
            <div className="trust-col">
              <span className="trust-col-num">No. 3</span>
              <h3>Raised underfoot</h3>
              <p>
                Kittens grow up in our living room among children and ordinary
                noise — kept to twelve to sixteen weeks so they are emotionally
                mature before they go to their new homes.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* (6) about teaser from real settings.about */}
      {(about.title || aboutParas.length > 0 || aboutPhoto) && (
        <section className="about">
          <div className="about-grid">
            <div className="about-photo">
              <div
                className="ph"
                role="img"
                aria-label="The cattery at home"
                style={
                  aboutPhoto
                    ? {
                        backgroundImage: `url("${aboutPhoto}")`,
                        backgroundColor: "var(--photo-d)",
                      }
                    : { backgroundColor: "var(--photo-d)" }
                }
              />
              <p className="ph-caption">At home with the cats</p>
            </div>
            <div className="about-copy">
              <span className="label">The Cattery</span>
              <h2>{about.title || "About the cattery"}</h2>
              <div className="drop-rule" />
              <div>
                {aboutParas.length > 0 ? (
                  aboutParas.map((t, i) => <p key={i}>{t}</p>)
                ) : (
                  <p>—</p>
                )}
              </div>
              <Link className="textlink" href="/about">
                Read more about us
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* (7) contact band from real settings.contact */}
      <section className="cta-band">
        <div className="cta-inner">
          <span className="label">Get in touch</span>
          <h2>Come meet the gentle giants.</h2>
          <p>
            Our door is open to fellow Maine Coon lovers. Write to us with your
            questions, follow the cats as they grow, or arrange a visit to meet
            them in person.
          </p>
          <div className="cta-btns">
            {contact.email && (
              <a className="btn btn-ivory-solid" href={`mailto:${contact.email}`}>
                Say hello
              </a>
            )}
            {contact.phone && (
              <a className="btn btn-ivory" href={telHref}>
                Call us
              </a>
            )}
            {contact.imessage && (
              <a
                className="btn btn-ivory"
                href={`imessage:${encodeURIComponent(contact.imessage)}`}
              >
                iMessage us
              </a>
            )}
            {!contact.email && !contact.phone && !contact.imessage && (
              <Link className="btn btn-ivory-solid" href="/contact">
                Browse cats
              </Link>
            )}
          </div>
          {contact.address && (
            <p className="cta-address">
              <span aria-hidden="true">Visit&nbsp;·&nbsp;</span>
              {contact.address}
              <span> · by appointment</span>
            </p>
          )}
        </div>
        <style jsx>{`
          .cta-address {
            margin: 28px auto 0;
            max-width: 34em;
            color: var(--bronze-soft);
            font-size: 13.5px;
            line-height: 1.7;
            letter-spacing: 0.01em;
          }
        `}</style>
      </section>
    </>
  );
}

// "nursery" featured section — mirrors the mockup #view-home featured strip,
// fed by the real featured pets already fetched.
function FeaturedNursery({
  pets,
  loading,
}: {
  pets: BackendPet[];
  loading: boolean;
}) {
  return (
    <section className="nursery">
      <div className="nursery-inner">
        <div className="section-head">
          <div>
            <span className="label">Our Cats</span>
            <h2>Featured from the cattery</h2>
            <p>
              A selection of our kings, queens and rising stars — each listed
              with its registration colour and home cattery.
            </p>
          </div>
        </div>
        {loading ? (
          <div className="card-grid">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="animate-pulse"
                style={{
                  aspectRatio: "4 / 5",
                  background: "var(--photo-b)",
                }}
              />
            ))}
          </div>
        ) : pets.length === 0 ? (
          <p style={{ color: "var(--muted)", fontSize: 15 }}>
            No featured cats available right now.
          </p>
        ) : (
          <div className="card-grid">
            {pets.map((pet) => {
              const mapped: Pet = {
                id: pet._id,
                name: pet.name,
                breed: pet.breed,
                age: pet.age,
                litter: pet.litter ?? [],
                category: pet.category ?? undefined,
                gender: pet.gender,
                dob: pet.dob ?? undefined,
                description: pet.description ?? "",
                petImages: pet.petImages ?? [],
                health: pet.health ?? {
                  vaccinated: false,
                  dewormed: false,
                  healthCertificate: false,
                },
                characteristics: pet.characteristics ?? {
                  size: "medium",
                  color: "",
                  weight: 0,
                  personality: [],
                },
                location: pet.location ?? "",
                createdAt:
                  (pet as unknown as { createdAt?: string }).createdAt ??
                  new Date().toISOString(),
                updatedAt:
                  (pet as unknown as { updatedAt?: string }).updatedAt ??
                  new Date().toISOString(),
              };
              const segRaw = (pet.category || "").toString().toLowerCase();
              const segment =
                segRaw === "kings"
                  ? "kings"
                  : segRaw === "queens"
                  ? "queens"
                  : "kittens";
              return (
                <PetCard
                  key={mapped.id}
                  pet={mapped}
                  href={`/${segment}/${mapped.id}`}
                />
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}

// Full-bleed Heritage hero slider — mirrors the mockup .hero structure:
// .hero-slides cross-fade, .hero-scrim, .hero-overlay with bronze eyebrow,
// serif headline + subtitle, prev/next arrows, dot controls and autoplay.
function HeroSlider({
  title,
  subtitle,
  images,
}: {
  title: string;
  subtitle: string;
  images: string[];
}) {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  const count = images.length;

  // Autoplay with pause on hover/focus
  useEffect(() => {
    if (paused || count < 2) return;
    const id = setInterval(() => {
      setCurrent((c) => (c + 1) % count);
    }, 5500);
    return () => clearInterval(id);
  }, [paused, count]);

  const go = (i: number) => {
    if (count === 0) return;
    setCurrent(((i % count) + count) % count);
  };

  const slides = count > 0 ? images : ["/images/placeholder.svg"];

  return (
    <section
      className="hero"
      aria-roledescription="carousel"
      aria-label="Cattery introduction"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
    >
      <div className="hero-slides">
        {slides.map((src, i) => (
          <div
            key={`${src}-${i}`}
            className={`hero-slide${i === current ? " is-active" : ""}`}
            style={{ backgroundImage: `url("${src || "/images/placeholder.svg"}")` }}
            aria-hidden={i === current ? undefined : true}
          />
        ))}
      </div>

      <div className="hero-scrim" />

      <div className="hero-overlay">
        <div className="hero-overlay-inner">
          <span className="label hero-eyebrow">
            WCF &amp; CFA Registered · Maine Coon
          </span>
          <h1>{title}</h1>
          <p className="hero-sub">{subtitle}</p>
          <div className="hero-ctas">
            <Link className="btn btn-ivory-solid" href="/kittens">
              Meet the cats
            </Link>
            <Link className="textlink hero-textlink" href="/about">
              Our philosophy
            </Link>
          </div>
        </div>
      </div>

      {count > 1 && (
        <>
          <button
            type="button"
            aria-label="Previous photo"
            onClick={() => go(current - 1)}
            className="hero-arrow hero-prev"
          >
            <span aria-hidden="true">&#8249;</span>
          </button>
          <button
            type="button"
            aria-label="Next photo"
            onClick={() => go(current + 1)}
            className="hero-arrow hero-next"
          >
            <span aria-hidden="true">&#8250;</span>
          </button>
          <div className="hero-dots" role="tablist" aria-label="Choose slide">
            {images.map((_, i) => (
              <button
                key={i}
                type="button"
                role="tab"
                aria-selected={current === i}
                aria-label={`Show photo ${i + 1}`}
                onClick={() => go(i)}
                className={`hero-dot${current === i ? " is-active" : ""}`}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}

// Convert pseudo-bullets (•, -, *) into real lists while preserving inline markup
function HtmlContent({
  html,
  className,
}: {
  html: string;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const root = ref.current;
    if (!root) return;

    // Helper to strip inline backgrounds that are white-ish
    const sanitizeBackgrounds = (node: ParentNode) => {
      const isDark = document.documentElement.classList.contains("dark");
      if (!isDark) return;
      const whiteVals = new Set([
        "#fff",
        "#ffffff",
        "white",
        "rgb(255,255,255)",
        "rgba(255,255,255,1)",
      ]);
      // Any element with style containing background or background-color
      Array.from(node.querySelectorAll<HTMLElement>("[style]"))
        .filter((el) => /background/i.test(el.getAttribute("style") || ""))
        .forEach((el) => {
          const bg = (el.style.background || "").replace(/\s+/g, "");
          const bgc = (el.style.backgroundColor || "").replace(/\s+/g, "");
          if (!bg && !bgc) {
            // Still enforce transparency when any background is present in style attribute
            el.style.setProperty("background", "transparent", "important");
            el.style.setProperty(
              "background-color",
              "transparent",
              "important"
            );
            return;
          }
          if (
            whiteVals.has(bgc.toLowerCase()) ||
            whiteVals.has(bg.toLowerCase())
          ) {
            el.style.removeProperty("background");
            el.style.removeProperty("background-color");
            el.style.setProperty("background", "transparent", "important");
            el.style.setProperty(
              "background-color",
              "transparent",
              "important"
            );
          } else {
            // Force transparent in dark if any background defined
            el.style.setProperty("background", "transparent", "important");
            el.style.setProperty(
              "background-color",
              "transparent",
              "important"
            );
          }
        });
      // Quill background classes and mark
      Array.from(
        node.querySelectorAll<HTMLElement>('[class*="ql-bg-"], mark')
      ).forEach((el) => {
        el.style.setProperty("background", "transparent", "important");
        el.style.setProperty("background-color", "transparent", "important");
      });
    };
    // 1) Convert Quill-style paragraphs with data-list attr into real lists
    const toProcess = Array.from(
      root.querySelectorAll<HTMLElement>("p[data-list], div[data-list]")
    ).filter((el) => !el.closest("ul,ol,li"));
    toProcess.forEach((start) => {
      if (!start.isConnected) return;
      const type = start.getAttribute("data-list");
      if (type !== "bullet" && type !== "ordered") return;
      const list = document.createElement(type === "bullet" ? "ul" : "ol");
      list.style.margin = "0.5rem 0";
      list.style.paddingLeft = "1.25rem";
      start.parentElement?.insertBefore(list, start);
      let curr: Element | null = start;
      while (
        curr &&
        curr.getAttribute &&
        curr.getAttribute("data-list") === type
      ) {
        const li = document.createElement("li");
        li.innerHTML = curr.innerHTML;
        // preserve useful classes like alignment/indent
        if (curr instanceof HTMLElement && curr.className)
          li.className = curr.className;
        list.appendChild(li);
        const nextEl: Element | null = curr.nextElementSibling;
        curr.remove();
        curr = nextEl;
      }
    });

    const bulletTextRe =
      /^[\s  ]*(?:[••●·\-*])(\s| | )+/;
    const bulletHtmlRe =
      /^(?:\s| | |&nbsp;|<[^>]+>)*(?:[••●·\-*]|&bull;|&#8226;)(?:\s| | |&nbsp;)+/i;
    const stripLeading = (h: string) => h.replace(bulletHtmlRe, "");

    const getParas = () =>
      Array.from(root.querySelectorAll<HTMLParagraphElement>("p"));
    let paras = getParas();
    let i = 0;
    while (i < paras.length) {
      const p = paras[i];
      if (!p.isConnected || p.closest("ul,ol,li")) {
        i++;
        continue;
      }
      const h = p.innerHTML;
      const t = p.textContent || "";
      const looksBullet = bulletTextRe.test(t) || bulletHtmlRe.test(h);
      if (looksBullet) {
        const ul = document.createElement("ul");
        ul.style.margin = "0.5rem 0";
        ul.style.paddingLeft = "1.25rem";
        ul.style.listStyle = "disc";
        p.parentElement?.insertBefore(ul, p);
        let j = i;
        while (j < paras.length) {
          const pj = paras[j];
          if (!pj.isConnected || pj.closest("ul,ol,li")) break;
          const hh = pj.innerHTML;
          const tt = pj.textContent || "";
          if (!(bulletTextRe.test(tt) || bulletHtmlRe.test(hh))) break;
          const li = document.createElement("li");
          li.innerHTML = stripLeading(hh);
          ul.appendChild(li);
          pj.remove();
          j++;
        }
        i = j;
        paras = getParas();
        continue;
      }
      // Single paragraph with <br>-separated bullet-looking lines
      if (h.toLowerCase().includes("<br")) {
        const pieces = h.split(/<br\s*\/?>(?![^<]*>)/i);
        const bullets: string[] = [];
        for (const piece of pieces) {
          const plain = piece.replace(/<[^>]+>/g, "");
          if (bulletTextRe.test(plain) || bulletHtmlRe.test(piece)) {
            bullets.push(stripLeading(piece));
          }
        }
        if (bullets.length >= 2) {
          const ul = document.createElement("ul");
          ul.style.margin = "0.5rem 0";
          ul.style.paddingLeft = "1.25rem";
          ul.style.listStyle = "disc";
          bullets.forEach((b) => {
            const li = document.createElement("li");
            li.innerHTML = b;
            ul.appendChild(li);
          });
          p.replaceWith(ul);
          paras = getParas();
          i = 0;
          continue;
        }
      }
      i++;
    }

    // Initial sanitize and observe future changes
    sanitizeBackgrounds(root);
    const mo = new MutationObserver((records) => {
      for (const r of records) {
        if (r.type === "childList") {
          r.addedNodes.forEach((n) => {
            if (n.nodeType === 1) sanitizeBackgrounds(n as ParentNode);
          });
        } else if (r.type === "attributes" && r.target) {
          sanitizeBackgrounds(r.target.parentNode || root);
        }
      }
    });
    mo.observe(root, {
      subtree: true,
      childList: true,
      attributes: true,
      attributeFilter: ["style", "class"],
    });
    return () => mo.disconnect();
  }, [html]);
  return (
    <div
      ref={ref}
      className={className}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
