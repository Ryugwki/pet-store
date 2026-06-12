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

export default function FemalesPage() {
  const [items, setItems] = useState<BackendPet[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<boolean>(false);
  const [hero, setHero] = useState<{
    title?: string;
    subtitle?: string;
    images?: string[];
  }>({});
  // working filters (mockup #view-cats filter-bar)
  const [gender, setGender] = useState<string>("");
  const [cattery, setCattery] = useState<string>("");
  // bump to force a re-fetch (used by the error-state Retry button)
  const [reloadKey, setReloadKey] = useState<number>(0);

  // hero settings — fetched once (independent of the gender filter)
  useEffect(() => {
    let mounted = true;
    settingsAPI
      .get()
      .then((settingsRes) => {
        if (!mounted) return;
        const h =
          (settingsRes?.data?.hero?.queens as {
            title?: string;
            subtitle?: string;
            images?: string[];
          }) || null;
        if (h) setHero(h);
      })
      .catch(() => {
        /* hero is decorative — fall back to the editorial header */
      });
    return () => {
      mounted = false;
    };
  }, []);

  // pets — SERVER-SIDE filtered to this category (and gender when set),
  // so the page only loads its own listing instead of the whole catalogue.
  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError(false);
    petsAPI
      .getAll({
        category: "Queens",
        limit: 200,
        ...(gender ? { gender } : {}),
      })
      .then((petsRes) => {
        if (!mounted) return;
        setItems((petsRes.data.items ?? petsRes.data) as BackendPet[]);
      })
      .catch(() => {
        if (!mounted) return;
        setError(true);
        setItems([]);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, [gender, reloadKey]);

  // base set for this page (server already scoped it to Queens + gender)
  const base = items;

  // cattery options derived from the base set
  const catteryOptions = useMemo(() => {
    const set = new Set<string>();
    for (const p of base) set.add((p.cattery || "Other").trim());
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [base]);

  // apply the client-side cattery filter on top of the server-scoped set
  const data = useMemo(() => {
    return base.filter((p) => {
      if (cattery && (p.cattery || "Other").trim() !== cattery) return false;
      return true;
    });
  }, [base, cattery]);

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

  const intro = hero.subtitle || "Elegant queens with sweet temperaments.";

  const heroImage = hero.images?.[0];

  function clearFilters() {
    setGender("");
    setCattery("");
  }

  return (
    <section className="listing">
      <div
        className={`listing-hero${heroImage ? " listing-hero--image" : ""}`}
        style={
          heroImage ? { backgroundImage: `url(${heroImage})` } : undefined
        }
      >
        <span className="label">The Catalogue</span>
        <h1>{hero.title || "Available Females"}</h1>
        <p>{intro}</p>
      </div>

      <div className="filter-bar">
        <div className="filter-inner">
          <div className="filter-ctl" aria-label="Filter by category">
            <small>Category</small>
            <b>Queens</b>
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
            {data.length} {data.length === 1 ? "cat" : "cats"}
          </span>
        </div>
      </div>

      <div>
        {loading ? (
          <div className="listing-skeleton">
            <div className="listing-grid">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="skeleton-card" aria-hidden="true">
                  <div className="skeleton-photo" />
                  <div className="skeleton-line" />
                  <div className="skeleton-line short" />
                </div>
              ))}
            </div>
          </div>
        ) : error ? (
          <div className="listing-error" role="alert">
            <h2>We couldn&rsquo;t load the catalogue</h2>
            <p>
              Something went wrong reaching our cattery records. Please try
              again in a moment.
            </p>
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => setReloadKey((k) => k + 1)}
            >
              Retry
            </button>
          </div>
        ) : data.length === 0 ? (
          <div className="no-match">
            <h2>No cats match those filters</h2>
            <p>Try widening your selection — or view the whole catalogue.</p>
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
                  {pets.length} {pets.length === 1 ? "cat" : "cats"}
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
                      href={`/queens/${mapped.id}`}
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
