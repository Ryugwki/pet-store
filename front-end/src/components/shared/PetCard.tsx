"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import type { Pet } from "@/types/pet";

type PetCardProps = {
  pet: Pet;
  href: string;
};

export default function PetCard({ pet, href }: PetCardProps) {
  const [imgSrc, setImgSrc] = useState<string>(
    (pet.petImages && pet.petImages[0]) || "/images/placeholder.svg"
  );

  return (
    <div className="relative bg-card text-foreground border border-border rounded-sm shadow-none hover:shadow-md transition-shadow overflow-hidden flex flex-col w-full max-w-[320px] group">
      <div className="relative w-full aspect-[4/5] bg-muted overflow-hidden">
        <Link
          href={href}
          aria-label={`Open ${pet.name} details`}
          className="block w-full h-full"
        >
          <Image
            src={imgSrc}
            alt={`${pet.name} - ${pet.breed}`}
            fill
            sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 100vw"
            className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
            onError={() => setImgSrc("/images/placeholder.svg")}
          />
        </Link>
      </div>
      <div className="p-5">
        {pet.litter?.length > 0 && (
          <div
            className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--color-bronze-deep)] border border-[var(--color-bronze-soft)] bg-[var(--color-card)] px-3 py-1 rounded-full mb-3 inline-block"
          >
            Litter: {pet.litter.join(", ")}
          </div>
        )}
        <h3 className="font-serif text-xl font-normal transition-colors group-hover:text-[var(--color-bronze-deep)]">
          {pet.name}
        </h3>
        <p className="mt-1 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
          {pet.breed}
        </p>
        <Link
          href={href}
          aria-label={`View details of ${pet.name}`}
          className="mt-4 inline-flex items-center text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--color-bronze-deep)] border-b border-[var(--color-bronze-soft)] pb-1 transition-colors hover:text-foreground hover:border-foreground"
        >
          View Details
        </Link>
      </div>
    </div>
  );
}
