export const runtime = "edge"; // Required by Cloudflare Pages for this dynamic route
import Image from "next/image";
import ZoomableImage from "@/components/shared/ZoomableImage";
import { notFound } from "next/navigation";
import type { Pet } from "@/types";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
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

export default async function PetDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const pet = await getPet(slug);
  const images: string[] = pet.petImages?.length
    ? pet.petImages
    : ["/images/placeholder.svg"]; // fallback
  const pedigreeCount = pet.pedigreeImages?.length ?? 0;

  const personality = pet.characteristics?.personality ?? [];
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

  return (
    <div className="bg-card">
      <div className="container mx-auto px-6 sm:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-[1.06fr_0.94fr] gap-12 lg:gap-16 items-start">
          {/* gallery */}
          <div>
            <Card className="p-3 bg-card border-border rounded-none shadow-none">
              <div className="relative">
                <Carousel className="w-full">
                  <CarouselContent>
                    {images.map((src, idx) => (
                      <CarouselItem key={idx}>
                        <ZoomableImage
                          src={src}
                          alt={`${pet.name} image ${idx + 1}`}
                        >
                          <div className="relative w-full aspect-[4/5] overflow-hidden">
                            <Image
                              src={src}
                              alt={`${pet.name} image ${idx + 1}`}
                              fill
                              sizes="(max-width: 768px) 100vw, 50vw"
                              className="object-cover"
                              unoptimized={src.startsWith("http")}
                            />
                          </div>
                        </ZoomableImage>
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                  <CarouselPrevious className="left-3" />
                  <CarouselNext className="right-3" />
                </Carousel>
              </div>
            </Card>
            <p className="mt-4 flex items-center gap-3 text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
              <span
                aria-hidden="true"
                className="inline-block h-px w-7 bg-[var(--color-bronze-soft)]"
              />
              {images.length} photograph{images.length === 1 ? "" : "s"}
            </p>
          </div>

          {/* info */}
          <div>
            <span className="eyebrow block mb-4">
              {[pet.breed, pet.gender, pet.characteristics?.color]
                .filter(Boolean)
                .join(" · ")}
            </span>
            <h1 className="font-serif text-4xl lg:text-5xl font-normal leading-tight mb-3">
              {pet.name}
            </h1>
            {pet.cattery && (
              <p className="font-serif italic text-lg text-[var(--color-bronze-deep)] mb-8">
                {pet.cattery} cattery
              </p>
            )}
            {pet.litter?.length > 0 && (
              <div className="mb-8 flex flex-wrap gap-2">
                {pet.litter.map((l, i) => (
                  <Badge
                    key={i}
                    variant="outline"
                    className="capitalize rounded-full border-border bg-background text-foreground font-normal"
                  >
                    {l}
                  </Badge>
                ))}
              </div>
            )}

            {/* spec list */}
            <ul className="border-t border-border mb-9">
              <li className="flex items-start justify-between gap-6 py-3 border-b border-border text-sm">
                <span className="text-[10.5px] font-semibold uppercase tracking-[0.2em] text-muted-foreground pt-0.5">
                  Breed
                </span>
                <b className="font-medium text-right text-foreground">
                  {pet.breed}
                </b>
              </li>
              <li className="flex items-start justify-between gap-6 py-3 border-b border-border text-sm">
                <span className="text-[10.5px] font-semibold uppercase tracking-[0.2em] text-muted-foreground pt-0.5">
                  Gender
                </span>
                <b className="font-medium text-right text-foreground capitalize">
                  {pet.gender}
                </b>
              </li>
              <li className="flex items-start justify-between gap-6 py-3 border-b border-border text-sm">
                <span className="text-[10.5px] font-semibold uppercase tracking-[0.2em] text-muted-foreground pt-0.5">
                  Age
                </span>
                <b className="font-medium text-right text-foreground">
                  {pet.age} years
                </b>
              </li>
              {pet.dob && (
                <li className="flex items-start justify-between gap-6 py-3 border-b border-border text-sm">
                  <span className="text-[10.5px] font-semibold uppercase tracking-[0.2em] text-muted-foreground pt-0.5">
                    Date of birth
                  </span>
                  <b className="font-medium text-right text-foreground">
                    {new Date(pet.dob).toLocaleDateString("en-GB", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                    })}
                  </b>
                </li>
              )}
              <li className="flex items-start justify-between gap-6 py-3 border-b border-border text-sm">
                <span className="text-[10.5px] font-semibold uppercase tracking-[0.2em] text-muted-foreground pt-0.5">
                  Color
                </span>
                <b className="font-medium text-right text-foreground">
                  {pet.characteristics?.color || "—"}
                </b>
              </li>
            </ul>

            {/* temperament chips */}
            {personality.length > 0 && (
              <>
                <span className="eyebrow block mb-3.5">Temperament</span>
                <div className="flex flex-wrap gap-2.5 mb-9">
                  {personality.map((trait, i) => (
                    <span
                      key={i}
                      className="text-[11px] font-medium uppercase tracking-[0.12em] border border-border text-foreground/80 bg-background rounded-full px-4 py-2"
                    >
                      {trait}
                    </span>
                  ))}
                </div>
              </>
            )}

            {/* health badges (truthful) */}
            <span className="eyebrow block mb-3.5">Health</span>
            <div className="flex flex-wrap gap-2.5 mb-10">
              {healthBadges.map((b) => (
                <span
                  key={b.label}
                  className={
                    "inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.1em] px-3.5 py-2 border " +
                    (b.ok
                      ? "text-[var(--color-bronze-deep)] border-[var(--color-bronze-soft)] bg-[rgba(160,124,69,0.06)]"
                      : "text-muted-foreground border-border bg-transparent")
                  }
                >
                  <span aria-hidden="true">{b.ok ? "✓" : "✗"}</span>
                  {b.label}
                </span>
              ))}
            </div>

            {/* pedigree link */}
            {pet.pedigreeURL && (
              <div className="border-l-2 border-[var(--color-bronze)] bg-muted px-7 py-6 mb-8">
                <h4 className="eyebrow mb-3.5 tracking-[0.24em]">Pedigree</h4>
                <a
                  href={pet.pedigreeURL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block text-[12px] font-semibold uppercase tracking-[0.18em] text-[var(--color-bronze-deep)] border-b border-[var(--color-bronze-soft)] pb-1 hover:text-foreground hover:border-foreground transition-colors break-all"
                >
                  View full pedigree on PawPeds
                </a>
              </div>
            )}

            {/* description */}
            {pet.description && (
              <div className="border-t border-border pt-7">
                <span className="eyebrow block mb-3.5">About</span>
                <p className="text-sm text-muted-foreground whitespace-pre-line leading-relaxed">
                  {pet.description}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
      {pet.pedigreeImages && pet.pedigreeImages.length > 0 && (
        <div className="bg-background border-t border-border mt-4">
          <div className="container mx-auto px-6 sm:px-8 py-16 lg:py-20">
            <div className="text-center mb-12">
              <span className="eyebrow block mb-4">Pedigree</span>
              <h2 className="font-serif text-3xl lg:text-4xl font-normal">
                Documented bloodline
              </h2>
              <div
                aria-hidden="true"
                className="rule-bronze h-px w-14 mx-auto mt-5"
              />
            </div>
            {pedigreeCount === 1 ? (
              <div className="flex justify-center">
                {pet.pedigreeImages.map((src, idx) => (
                  <div key={`pedigree-wrap-${idx}`} className="w-fit">
                    <ZoomableImage src={src} alt={`Pedigree ${idx + 1}`}>
                      <figure className="flex flex-col items-center w-fit">
                        <div className="relative inline-flex items-center justify-center overflow-hidden bg-card p-2 border border-border">
                          <Image
                            src={src}
                            alt={`Pedigree ${idx + 1}`}
                            width={1600}
                            height={1200}
                            className="object-contain w-auto h-auto max-h-[70vh]"
                            unoptimized={src.startsWith("http")}
                          />
                        </div>
                      </figure>
                    </ZoomableImage>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 place-items-center">
                {pet.pedigreeImages.map((src, idx) => (
                  <div key={`pedigree-wrap-${idx}`} className="w-fit mx-auto">
                    <ZoomableImage src={src} alt={`Pedigree ${idx + 1}`}>
                      <figure className="flex flex-col items-center w-fit">
                        <div className="relative inline-flex items-center justify-center overflow-hidden bg-card p-2 border border-border">
                          <Image
                            src={src}
                            alt={`Pedigree ${idx + 1}`}
                            width={1600}
                            height={1200}
                            className="object-contain w-auto h-auto max-h-[70vh]"
                            unoptimized={src.startsWith("http")}
                          />
                        </div>
                      </figure>
                    </ZoomableImage>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
