export const runtime = "edge"; // Required by Cloudflare Pages for this dynamic route
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import type { Pet } from "@/types";
import DetailGallery from "@/components/shared/DetailGallery";
import ZoomableImage from "@/components/shared/ZoomableImage";
import { API_BASE_URL } from "@/constants";

async function getPet(id: string): Promise<Pet> {
  // id is used in the fetch call; rename to avoid lint false positive if configured
  const res = await fetch(`${API_BASE_URL}/pets/${id}`, { cache: "no-store" });
  if (res.status === 404) notFound();
  if (!res.ok) throw new Error("Failed to fetch pet");
  const data = await res.json();
  // Normalize to Pet shape
  return {
    id: data._id || data.id,
    name: data.name,
    breed: data.breed,
    age: data.age,
    litter: data.litter ?? [],
    category: data.category,
    gender: data.gender,
    dob: data.dob,
    pedigreeURL: data.pedigreeURL,
    description: (data.description ?? "").trim(),
    petImages: data.petImages ?? data.images ?? [],
    pedigreeImages: data.pedigreeImages ?? [],
    awardsImages: data.awardsImages ?? [],
    certificateImages: data.certificateImages ?? [],
    cattery: data.cattery,
    health: data.health ?? {
      vaccinated: false,
      dewormed: false,
      healthCertificate: false,
    },
    characteristics: data.characteristics ?? {
      size: "medium",
      color: "",
      weight: 0,
      personality: [],
    },
    location: data.location ?? "",
    createdAt: data.createdAt ?? new Date().toISOString(),
    updatedAt: data.updatedAt ?? new Date().toISOString(),
  } as Pet;
}

/* ---------- mockup-faithful display helpers ---------- */
// "now" anchor for derived age, matching the mockup's 2026-06-12 snapshot
const NOW = new Date("2026-06-12T00:00:00.000Z");

function ageFromDob(dob?: string): string {
  if (!dob) return "—";
  const d = new Date(dob);
  if (Number.isNaN(d.getTime())) return "—";
  let months =
    (NOW.getFullYear() - d.getFullYear()) * 12 +
    (NOW.getMonth() - d.getMonth());
  if (NOW.getDate() < d.getDate()) months -= 1;
  if (months < 0) months = 0;
  if (months >= 12) {
    const yrs = Math.floor(months / 12);
    return `${yrs} ${yrs === 1 ? "yr" : "yrs"}`;
  }
  return `${months} ${months === 1 ? "mo" : "mos"}`;
}

function fmtDob(dob?: string): string {
  if (!dob) return "—";
  const d = new Date(dob);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function genderLabel(g?: string): string {
  if (g === "male") return "Male";
  if (g === "female") return "Female";
  return "—";
}

function parseCOI(desc?: string): string | null {
  if (!desc) return null;
  const m = String(desc).match(/COI:\s*([0-9.]+\s*%?)/i);
  return m ? m[1].replace(/\s+/g, "") : null;
}

export default async function PetDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const pet = await getPet(slug);

  // ---- derived display values (same real data) ----
  const images: string[] = (pet.petImages ?? []).filter(Boolean);
  const emsColor = pet.characteristics?.color || "—";
  const category = pet.category || "Other";
  const cattery = pet.cattery ? pet.cattery.trim() : "";
  const coi = parseCOI(pet.description);

  // neutral litter status string (informational only)
  const litterStatus =
    Array.isArray(pet.litter) && pet.litter.length
      ? pet.litter.filter(Boolean)[0] || null
      : null;

  // detail lede: cattery + COI, else a soft default — mirrors the mockup
  const lede =
    (cattery ? `From ${cattery} — ` : "") +
    (coi ? `COI ${coi}` : "Maine Coon, raised underfoot");

  // spec list rows
  const specs: [string, string][] = [
    ["Breed", pet.breed || "Maine Coon"],
    ["Born", `${fmtDob(pet.dob)} · ${ageFromDob(pet.dob)}`],
    ["Gender", genderLabel(pet.gender)],
    ["Colour (EMS)", emsColor],
    ["Cattery", cattery || "—"],
    ["Category", category],
  ];
  if (coi) specs.push(["COI", coi]);
  specs.push(["Registry", "WCF · CFA"]);

  // personality chips
  const personality = (pet.characteristics?.personality ?? []).filter(Boolean);

  // health badges — truthful booleans
  const health = pet.health ?? {
    vaccinated: false,
    dewormed: false,
    healthCertificate: false,
  };
  const healthBadges: { label: string; ok: boolean }[] = [
    { label: "Vaccinated", ok: !!health.vaccinated },
    { label: "Dewormed", ok: !!health.dewormed },
    { label: "Health certificate", ok: !!health.healthCertificate },
  ];

  // extra gallery: pedigree + awards + certificate (fetched + now surfaced)
  const extras: { src: string; label: string }[] = [];
  (pet.pedigreeImages ?? []).forEach((u) => {
    if (u) extras.push({ src: u, label: "Pedigree" });
  });
  (pet.awardsImages ?? []).forEach((u) => {
    if (u) extras.push({ src: u, label: "Award" });
  });
  (pet.certificateImages ?? []).forEach((u) => {
    if (u) extras.push({ src: u, label: "Certificate" });
  });

  // status block (showcase-only, no price)
  const statusHeadline = litterStatus || category;
  const statusBlurb =
    (cattery ? `${cattery} — ` : "") +
    `WCF registered, CFA eligible. Maine Coon, born ${fmtDob(pet.dob)}. ` +
    "Health testing and pedigree details available on request.";

  return (
    <section className="concept detail bg-card">
      {/* crumbs */}
      <div className="crumbs">
        <Link href="/kittens">Cats</Link>
        <i>/</i>
        <span>{category}</span>
        <i>/</i>
        <span>{pet.name}</span>
      </div>

      <div className="detail-grid">
        {/* gallery (client: thumbnail swap + zoom + extra images) */}
        <DetailGallery
          name={pet.name}
          breed={pet.breed}
          images={images}
          tag={litterStatus}
          extras={extras}
        />

        {/* info */}
        <div className="detail-info">
          <span className="label">
            {[category, genderLabel(pet.gender), emsColor]
              .filter(Boolean)
              .join(" · ")}
          </span>
          <h1 className="font-serif">{pet.name}</h1>
          <p className="detail-lede">{lede}</p>

          {/* spec list */}
          <ul className="spec-list">
            {specs.map(([k, v]) => (
              <li key={k}>
                <span>{k}</span>
                <b>{v}</b>
              </li>
            ))}
          </ul>

          {/* temperament chips */}
          <span className="label" style={{ marginBottom: 14, display: "block" }}>
            Temperament
          </span>
          <div className="chip-row">
            {personality.length > 0 ? (
              personality.map((trait, i) => (
                <span key={`chip-${i}`} className="chip">
                  {trait}
                </span>
              ))
            ) : (
              <span className="chip" style={{ color: "var(--muted)" }}>
                —
              </span>
            )}
          </div>

          {/* health badges (truthful) */}
          <span className="label" style={{ marginBottom: 14, display: "block" }}>
            Health
          </span>
          <div className="health-row">
            {healthBadges.map((b) => (
              <span
                key={b.label}
                className={"health-badge" + (b.ok ? "" : " is-no")}
              >
                {b.label}
              </span>
            ))}
          </div>

          {/* status block — from our cattery (showcase-only) */}
          <div className="price-block">
            <div className="price-row">
              <span className="price-now font-serif">{statusHeadline}</span>
              <span className="price-note">From our cattery</span>
            </div>
            <p>{statusBlurb}</p>
            <div className="price-btns">
              <Link
                className="btn btn-solid"
                href={`/contact?subject=${encodeURIComponent(
                  `Enquiry about ${pet.name}`
                )}`}
              >
                Ask about {pet.name}
              </Link>
              <Link className="btn btn-outline" href="/contact">
                Visit the cattery
              </Link>
            </div>
          </div>

          {/* info block — curious about our cats */}
          <div className="policy-box">
            <h4>Curious about our cats?</h4>
            <ul>
              <li>
                We welcome visitors by appointment at our home cattery.
              </li>
              <li>
                Every cat is photographed regularly — ask us for the latest
                portraits.
              </li>
              <li>
                Questions about the breed, our lines or our health testing are
                always welcome.
              </li>
              <li>
                A written health guarantee accompanies every kitten we raise.
              </li>
            </ul>
            <Link className="textlink" href="/contact">
              Get in touch
            </Link>
          </div>
        </div>
      </div>

      {/* pedigree */}
      {(pet.pedigreeURL ||
        (pet.pedigreeImages && pet.pedigreeImages.length > 0)) && (
        <div className="pedigree">
          <div className="pedigree-inner">
            <span className="label">Pedigree</span>
            <h2 className="font-serif">{pet.name}&rsquo;s bloodline</h2>

            {pet.pedigreeImages && pet.pedigreeImages.length > 0 && (
              <div
                className="pedigree-row"
                style={{
                  gridTemplateColumns:
                    pet.pedigreeImages.length === 1 ? "1fr" : undefined,
                  maxWidth:
                    pet.pedigreeImages.length === 1 ? "640px" : undefined,
                }}
              >
                {pet.pedigreeImages.map((src, idx) => (
                  <PedigreePlate key={`pedigree-${idx}`} src={src} index={idx} />
                ))}
              </div>
            )}

            {pet.pedigreeURL && (
              <div className="pedigree-link">
                <a
                  className="btn btn-outline"
                  href={pet.pedigreeURL}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  View full pedigree on PawPeds
                </a>
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}

/* small server-side plate used in the pedigree row (zoomable) */
function PedigreePlate({ src, index }: { src: string; index: number }) {
  return (
    <ZoomableImage src={src} alt={`Pedigree ${index + 1}`}>
      <figure className="parent-card is-static" style={{ cursor: "zoom-in" }}>
        <div
          className="ph"
          role="img"
          aria-label={`Pedigree ${index + 1}`}
          style={{ width: "100%", height: "auto", aspectRatio: "4 / 3" }}
        >
          <Image
            src={src}
            alt={`Pedigree ${index + 1}`}
            fill
            sizes="(min-width: 980px) 33vw, 100vw"
            className="object-contain"
            style={{ position: "absolute", inset: 0 }}
            unoptimized={src.startsWith("http")}
          />
        </div>
      </figure>
    </ZoomableImage>
  );
}
