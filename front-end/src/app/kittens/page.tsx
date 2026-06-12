"use client";
import { useEffect, useMemo, useState } from "react";
import PetCard from "@/components/shared/PetCard";
import { petsAPI, settingsAPI } from "@/lib/axios";
import type { Pet } from "@/types";

type BackendPet = Omit<Pet, "id"> & {
  _id: string;
  dob?: string;
  petImages?: string[];
};

function genderLabel(g: string): string {
  if (g === "male") return "Male";
  if (g === "female") return "Female";
  return "All";
}

export default function KittensPage() {
  const [items, setItems] = useState<BackendPet[]>([]);
  const [hero, setHero] = useState<{
    title?: string;
    subtitle?: string;
    images?: string[];
  }>({});
  // working filters (mockup #view-cats filter-bar)
  const [gender, setGender] = useState<string>("");
  const [cattery, setCattery] = useState<string>("");

  useEffect(() => {
    let mounted = true;
    Promise.all([
      petsAPI.getAll({ limit: 100 }),
      settingsAPI.get().catch(() => null),
    ]).then(([petsRes, settingsRes]) => {
      if (!mounted) return;
      setItems((petsRes.data.items ?? petsRes.data) as BackendPet[]);
      const h =
        (settingsRes?.data?.hero?.kittens as {
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

  // base set for this page (Kittens)
  const base = useMemo(() => {
    return items.filter((p) => p.category === "Kittens");
  }, [items]);

  // cattery options derived from the base set
  const catteryOptions = useMemo(() => {
    const set = new Set<string>();
    for (const p of base) set.add((p.cattery || "Other").trim());
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [base]);

  // apply the working filters on top of the base set
  const data = useMemo(() => {
    return base.filter((p) => {
      if (gender && p.gender !== gender) return false;
      if (cattery && (p.cattery || "Other").trim() !== cattery) return false;
      return true;
    });
  }, [base, gender, cattery]);

  // group pets by cattery name
  const groups = useMemo(() => {
    const map = new Map<string, BackendPet[]>();
    for (const p of data) {
      const key = (p.cattery || "Other").trim();
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(p);
    }
    return Array.from(map.entries()).sort((a, b) => a[0].localeCompare(b[0]));
  }, [data]);

  const intro =
    hero.subtitle || "Healthy, socialized kittens ready for loving homes.";

  function clearFilters() {
    setGender("");
    setCattery("");
  }

  return (
    <section className="listing">
      <div className="listing-hero">
        <span className="label">The Nursery</span>
        <h1>{hero.title || "Available Kittens"}</h1>
        <p>{intro}</p>
      </div>

      <div className="filter-bar">
        <div className="filter-inner">
          <div className="filter-ctl" aria-label="Filter by category">
            <small>Category</small>
            <b>Kittens</b>
          </div>
          <div className="filter-ctl" aria-label="Filter by gender">
            <small>Gender</small>
            <b>{gender ? genderLabel(gender) : "All"}</b>
            <select
              aria-label="Gender"
              value={gender}
              onChange={(e) => setGender(e.target.value)}
            >
              <option value="">All</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </div>
          <div className="filter-ctl" aria-label="Filter by cattery">
            <small>Cattery</small>
            <b>{cattery || "All"}</b>
            <select
              aria-label="Cattery"
              value={cattery}
              onChange={(e) => setCattery(e.target.value)}
            >
              <option value="">All</option>
              {catteryOptions.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <span className="filter-count">
            {data.length} {data.length === 1 ? "kitten" : "kittens"}
          </span>
        </div>
      </div>

      <div>
        {data.length === 0 ? (
          <div className="no-match">
            <h2>No kittens match those filters</h2>
            <p>Try widening your selection — or view the whole nursery.</p>
            <button
              type="button"
              className="btn btn-outline"
              onClick={clearFilters}
            >
              Clear filters
            </button>
          </div>
        ) : (
          groups.map(([catteryName, pets]) => (
            <div key={catteryName} className="litter-block">
              <div className="litter-head">
                <h2>{catteryName}</h2>
                <div className="litter-rule" />
                <span>
                  {pets.length} {pets.length === 1 ? "kitten" : "kittens"}
                </span>
              </div>
              <div className="listing-grid">
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
                      href={`/kittens/${mapped.id}`}
                    />
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
