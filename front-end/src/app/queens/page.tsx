"use client";
import { useEffect, useMemo, useState } from "react";
import PageHero from "@/components/shared/PageHero";
import PetCard from "@/components/shared/PetCard";
import Section from "@/components/shared/Section";
import EmptyState from "@/components/shared/EmptyState";
import { petsAPI, settingsAPI } from "@/lib/axios";
import type { Pet } from "@/types";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";

type BackendPet = Omit<Pet, "id"> & {
  _id: string;
  dob?: string;
  petImages?: string[];
};

export default function FemalesPage() {
  // Removed search and filters per request
  const [items, setItems] = useState<BackendPet[]>([]);
  const [hero, setHero] = useState<{
    title?: string;
    subtitle?: string;
    images?: string[];
  }>({});

  useEffect(() => {
    let mounted = true;
    Promise.all([
      petsAPI.getAll({ limit: 100 }),
      settingsAPI.get().catch(() => null),
    ]).then(([petsRes, settingsRes]) => {
      if (!mounted) return;
      setItems((petsRes.data.items ?? petsRes.data) as BackendPet[]);
      const h =
        (settingsRes?.data?.hero?.queens as {
          title?: string;
          subtitle?: string;
          images?: string[];
        }) || null;
      if (h) setHero(h);
    });
    return () => {
      mounted = false;
    };
  }, []);

  const data = useMemo(() => {
    return items.filter(
      (p) =>
        (p.category === "Queens" || p.gender === "female") &&
        p.category !== "Kittens"
    );
  }, [items]);

  const groups = useMemo(() => {
    const map = new Map<string, BackendPet[]>();
    for (const p of data) {
      const key = (p.cattery || "Other").trim();
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(p);
    }
    return Array.from(map.entries()).sort((a, b) => a[0].localeCompare(b[0]));
  }, [data]);

  return (
    <>
      {Array.isArray(hero.images) && hero.images.length > 1 ? (
        <section className="relative">
          <div className="container mx-auto px-0">
            <Carousel className="w-full">
              <CarouselContent>
                {hero.images.map((src, i) => (
                  <CarouselItem key={src || i}>
                    <PageHero
                      title={hero.title || "Available Females"}
                      subtitle={
                        hero.subtitle ||
                        "Elegant queens with sweet temperaments."
                      }
                      imageSrc={src || "/images/placeholder.svg"}
                    />
                  </CarouselItem>
                ))}
              </CarouselContent>
            </Carousel>
          </div>
        </section>
      ) : (
        <PageHero
          title={hero.title || "Available Females"}
          subtitle={hero.subtitle || "Elegant queens with sweet temperaments."}
          imageSrc={
            (hero.images && hero.images[0]) || "/images/placeholder.svg"
          }
        />
      )}
      <Section>
        <div className="max-w-6xl mx-auto mb-12 text-center md:mb-16">
          <span className="eyebrow block">The Cattery</span>
          <h2 className="font-serif mt-4 text-3xl font-normal tracking-tight md:text-4xl">
            {hero.title || "Available Females"}
          </h2>
          <span
            aria-hidden="true"
            className="rule-bronze mx-auto mt-5 block h-px w-14"
          />
          <p className="mx-auto mt-5 max-w-2xl text-muted-foreground">
            {hero.subtitle || "Elegant queens with sweet temperaments."}
          </p>
        </div>
        {data.length === 0 ? (
          <EmptyState description="No queens available right now." />
        ) : (
          <div className="max-w-6xl mx-auto space-y-16">
            {groups.map(([cattery, pets]) => (
              <div key={cattery} className="w-full">
                <div className="mb-10 flex items-baseline gap-6">
                  <h3 className="font-serif text-2xl font-normal tracking-tight">
                    {cattery}
                  </h3>
                  <span
                    aria-hidden="true"
                    className="h-px flex-1 bg-border"
                  />
                  <span className="eyebrow shrink-0">
                    {pets.length} {pets.length === 1 ? "Cat" : "Cats"}
                  </span>
                </div>
                <div className="grid justify-center grid-cols-[repeat(auto-fit,minmax(260px,320px))] gap-6">
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
                    return (
                      <PetCard
                        key={mapped.id}
                        pet={mapped}
                        href={`/queens/${mapped.id}`}
                      />
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </Section>
    </>
  );
}
