export const runtime = "edge"; // Required by Cloudflare Pages for this dynamic route
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import type { Pet, PetParentRef } from "@/types";
import DetailGallery from "@/components/shared/DetailGallery";
import ZoomableImage from "@/components/shared/ZoomableImage";
import { API_BASE_URL } from "@/constants";
import { ageFromDob } from "@/lib/age";
import { sanitizeHtml } from "@/lib/sanitizeHtml";

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
    // Structured lineage / breeding metadata (additive — older payloads omit these).
    coi: data.coi,
    registry: data.registry,
    fatherId: data.fatherId,
    motherId: data.motherId,
    father: normalizeParent(data.father),
    mother: normalizeParent(data.mother),
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

// Normalize a populated parent object from GET /pets/:id. The backend may
// populate `father`/`mother` as full pet docs (with `_id`) or leave them as a
// bare id string / null when unpopulated — only the populated-object form
// yields a renderable mini-card.
function normalizeParent(p: unknown): PetParentRef | undefined {
  if (!p || typeof p !== "object") return undefined;
  const obj = p as Record<string, unknown>;
  const id = (obj._id ?? obj.id) as string | undefined;
  const name = obj.name as string | undefined;
  if (!id || !name) return undefined;
  return {
    _id: id,
    name,
    category: obj.category as string | undefined,
    petImages: Array.isArray(obj.petImages)
      ? (obj.petImages as string[]).filter(Boolean)
      : Array.isArray(obj.images)
      ? (obj.images as string[]).filter(Boolean)
      : [],
  };
}

/* ---------- mockup-faithful display helpers ---------- */
// Age is derived at runtime via ageFromDob (lib/age.ts); ageFromDob returns ""
// for a missing/invalid dob, so fall back to an em-dash for display parity.
function ageDisplay(dob?: string): string {
  return ageFromDob(dob) || "—";
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

// Description-regex fallback for COI. Sanitizes first so rich-text/embed markup
// in the admin-authored description can't smuggle anything past the match.
function parseCOI(desc?: string): string | null {
  if (!desc) return null;
  const m = sanitizeHtml(String(desc)).match(/COI:\s*([0-9.]+\s*%?)/i);
  return m ? m[1].replace(/\s+/g, "") : null;
}

// Prefer the structured `coi` field when present, else fall back to parsing the
// description. Returns a display string ("12%" / "0.5%") or null when unknown.
function resolveCOI(pet: Pet): string | null {
  if (pet.coi !== undefined && pet.coi !== null && String(pet.coi).trim() !== "") {
    const raw = String(pet.coi).trim();
    return raw.endsWith("%") ? raw : `${raw}%`;
  }
  return parseCOI(pet.description);
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
  // COI: structured pet.coi preferred, description regex fallback (B4).
  const coi = resolveCOI(pet);

  // Registry: structured pet.registry preferred, hardcoded default fallback (B5).
  const registry =
    pet.registry && String(pet.registry).trim()
      ? String(pet.registry).trim()
      : "WCF · CFA";

  // Size / weight from characteristics, surfaced only when present (A5).
  const size = pet.characteristics?.size
    ? String(pet.characteristics.size).trim()
    : "";
  const weight =
    typeof pet.characteristics?.weight === "number" &&
    pet.characteristics.weight > 0
      ? pet.characteristics.weight
      : null;

  // Populated parents (A3) — only renderable when the API returned objects.
  const father = pet.father;
  const mother = pet.mother;

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
    ["Born", `${fmtDob(pet.dob)} · ${ageDisplay(pet.dob)}`],
    ["Gender", genderLabel(pet.gender)],
    ["Colour (EMS)", emsColor],
    ["Cattery", cattery || "—"],
    ["Category", category],
  ];
  if (size) specs.push(["Size", size.charAt(0).toUpperCase() + size.slice(1)]);
  if (weight !== null) specs.push(["Weight", `${weight} kg`]);
  if (coi) specs.push(["COI", coi]);
  specs.push(["Registry", registry]);

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
      {(father ||
        mother ||
        pet.pedigreeURL ||
        (pet.pedigreeImages && pet.pedigreeImages.length > 0)) && (
        <div className="pedigree">
          <div className="pedigree-inner">
            <span className="label">Pedigree</span>
            <h2 className="font-serif">{pet.name}&rsquo;s bloodline</h2>

            {/* sire / dam linked mini-cards (A3) — gracefully hidden if absent */}
            {(father || mother) && (
              <div
                className="pedigree-row"
                style={{ gridTemplateColumns: "1fr auto 1fr", marginBottom: 48 }}
              >
                {father ? (
                  <ParentCard parent={father} role="Sire" />
                ) : (
                  <div aria-hidden="true" />
                )}
                <span className="pedigree-x" aria-hidden="true">
                  &times;
                </span>
                {mother ? (
                  <ParentCard parent={mother} role="Dam" />
                ) : (
                  <div aria-hidden="true" />
                )}
              </div>
            )}

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

/* linked sire/dam mini-card (A3): photo + name → parent's detail route */
function ParentCard({
  parent,
  role,
}: {
  parent: PetParentRef;
  role: "Sire" | "Dam";
}) {
  const photo = (parent.petImages ?? []).filter(Boolean)[0];
  return (
    <Link
      href={`/kittens/${parent._id}`}
      className="parent-card is-link"
      style={{ textDecoration: "none", color: "inherit" }}
    >
      <div
        className="ph"
        role="img"
        aria-label={`${role}: ${parent.name}`}
        style={{ position: "relative", overflow: "hidden" }}
      >
        {photo ? (
          <Image
            src={photo}
            alt={parent.name}
            fill
            sizes="108px"
            className="object-cover"
            style={{ position: "absolute", inset: 0 }}
            unoptimized={photo.startsWith("http")}
          />
        ) : null}
      </div>
      <div>
        <span className="parent-role">{role}</span>
        <h3 className="font-serif">{parent.name}</h3>
        {parent.category ? <p>{parent.category}</p> : null}
      </div>
    </Link>
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
