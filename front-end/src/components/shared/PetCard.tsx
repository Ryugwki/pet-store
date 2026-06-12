"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import type { Pet } from "@/types/pet";

type PetCardProps = {
  pet: Pet;
  href: string;
};

// "now" anchor for derived age, matching the mockup's 2026-06-12 snapshot
const NOW = new Date("2026-06-12T00:00:00.000Z");

// derive age from dob as of NOW: years if >= 1, else months
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
function genderSymbol(g?: string): string {
  if (g === "male") return "♂ Male";
  if (g === "female") return "♀ Female";
  return "Cat";
}

export default function PetCard({ pet, href }: PetCardProps) {
  const [imgSrc, setImgSrc] = useState<string>(
    (pet.petImages && pet.petImages[0]) || "/images/placeholder.svg"
  );

  const ems = pet.characteristics?.color || "—";
  const category = pet.category || "Other";
  const litterStatus =
    Array.isArray(pet.litter) && pet.litter.length
      ? pet.litter.filter(Boolean)[0]
      : null;

  return (
    <Link className="pet-card" href={href} aria-label={`Open ${pet.name} details`}>
      <div className="ph" role="img" aria-label={pet.name}>
        <Image
          src={imgSrc}
          alt={`${pet.name} - ${pet.breed}`}
          fill
          sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 100vw"
          className="object-cover"
          style={{ position: "absolute", inset: 0 }}
          onError={() => setImgSrc("/images/placeholder.svg")}
        />
        <span className="tag tag-bronze">{genderSymbol(pet.gender)}</span>
      </div>

      <h3 className="pet-name">{pet.name}</h3>
      <p className="pet-ems">
        {ems} · {category} · {genderLabel(pet.gender)}
      </p>

      <div className="pet-meta">
        <span className="pet-dob">
          b. {fmtDob(pet.dob)} · {ageFromDob(pet.dob)}
        </span>
        <span className="pet-line">{pet.cattery || "—"}</span>
      </div>

      {litterStatus && <span className="status-chip">{litterStatus}</span>}
    </Link>
  );
}
