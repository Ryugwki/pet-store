"use client";

import { Card } from "@/components/ui/card";
import { PawPrint } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { adminAPI, petsAPI, handleAPIError } from "@/lib/axios";

// Additive: backend /admin/stats now also returns category-based counts
// (kings/queens/uncategorized) plus a featured count. Every field is optional
// so a missing key never breaks the cards.
type Stats = {
  total?: number;
  males?: number;
  females?: number;
  kittens?: number;
  kings?: number;
  queens?: number;
  uncategorized?: number;
  featured?: number;
};

// Minimal shape of a pet row as returned by GET /pets ({ items, total, ... }).
type RecentPet = {
  _id?: string;
  id?: string;
  name?: string;
  category?: string;
  petImages?: string[];
  createdAt?: string;
  updatedAt?: string;
};

// Newest-first timestamp for a pet, preferring createdAt and falling back to
// updatedAt. Returns 0 when neither is present so undated rows sink to the end.
function recencyTime(p: RecentPet): number {
  const raw = p.createdAt ?? p.updatedAt;
  const t = raw ? new Date(raw).getTime() : NaN;
  return Number.isNaN(t) ? 0 : t;
}

function formatAddedDate(p: RecentPet): string {
  const raw = p.createdAt ?? p.updatedAt;
  if (!raw) return "Date unknown";
  const d = new Date(raw);
  if (Number.isNaN(d.getTime())) return "Date unknown";
  return d.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [recent, setRecent] = useState<RecentPet[] | null>(null);
  const [recentError, setRecentError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    adminAPI
      .getStats()
      .then((res) => {
        if (!mounted) return;
        setStats(res.data as Stats);
      })
      .catch((err) => {
        if (!mounted) return;
        setError(handleAPIError(err));
      });
    return () => {
      mounted = false;
    };
  }, []);

  // Real "Recently added cats": pull the pets list, sort by createdAt (fallback
  // updatedAt) descending, keep the newest 5. No fabricated data.
  useEffect(() => {
    let mounted = true;
    petsAPI
      .getAll({ limit: 50, sortBy: "createdAt", sortOrder: "desc" })
      .then((res) => {
        if (!mounted) return;
        const list = (res.data?.items ?? res.data ?? []) as RecentPet[];
        const sorted = [...list].sort((a, b) => recencyTime(b) - recencyTime(a));
        setRecent(sorted.slice(0, 5));
      })
      .catch((err) => {
        if (!mounted) return;
        setRecentError(handleAPIError(err));
      });
    return () => {
      mounted = false;
    };
  }, []);

  const kpis = [
    { label: "Total cats", value: stats?.total, sub: "in the registry", accent: true },
    { label: "Kings", value: stats?.kings, sub: "males on the roster" },
    { label: "Queens", value: stats?.queens, sub: "females on the roster" },
    { label: "Kittens", value: stats?.kittens, sub: "on the kittens page" },
  ];

  return (
    <div className="space-y-10">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow mb-2">Overview</p>
          <h1 className="font-serif text-3xl sm:text-4xl tracking-tight">Dashboard</h1>
          <span className="mt-3 block h-px w-40 rule-bronze" aria-hidden="true" />
          <p className="mt-4 max-w-xl text-sm text-muted-foreground">
            Live state of the cat registry — every figure below comes from the
            real collections.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <PawPrint className="h-5 w-5 text-[var(--color-bronze)]" />
          <span className="eyebrow">PetStore Admin</span>
        </div>
      </header>

      {error && (
        <p className="border-l-2 border-[var(--color-bronze)] bg-muted px-4 py-3 text-sm text-foreground">
          {error}
        </p>
      )}

      <section
        aria-label="Registry metrics"
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4"
      >
        {kpis.map((k) => (
          <Card
            key={k.label}
            className={`flex flex-col gap-2 rounded-lg border-border bg-card p-6 shadow-none ${
              k.accent ? "border-t-2 border-t-[var(--color-bronze)]" : ""
            }`}
          >
            <span className="eyebrow">{k.label}</span>
            <span className="font-serif text-4xl leading-none tracking-tight">
              {k.value ?? "--"}
            </span>
            <span className="text-xs text-muted-foreground">{k.sub}</span>
          </Card>
        ))}
      </section>

      <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="rounded-lg border-border bg-card p-0 shadow-none">
          <div className="flex items-center gap-3 border-b border-border px-6 py-4">
            <h2 className="font-serif text-lg">Registry health</h2>
            <span className="ml-auto eyebrow">From live counts</span>
          </div>
          <ul className="divide-y divide-border">
            <li className="flex items-center gap-4 px-6 py-4">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-muted text-sm text-[var(--color-bronze-deep)]">
                ✓
              </span>
              <div>
                <p className="text-sm font-medium">
                  {stats?.total ?? "--"} cats in the registry
                </p>
                <p className="text-xs text-muted-foreground">
                  Total records currently published across all pages.
                </p>
              </div>
            </li>
            <li className="flex items-center gap-4 px-6 py-4">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-muted text-sm text-[var(--color-bronze-deep)]">
                ♔
              </span>
              <div>
                <p className="text-sm font-medium">
                  {stats?.males ?? "--"} kings · {stats?.females ?? "--"} queens
                </p>
                <p className="text-xs text-muted-foreground">
                  Adult cats split by sex across the public roster.
                </p>
              </div>
            </li>
            <li className="flex items-center gap-4 px-6 py-4">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-muted text-sm text-[var(--color-bronze-deep)]">
                ❀
              </span>
              <div>
                <p className="text-sm font-medium">
                  {stats?.kittens ?? "--"} kittens on the kittens page
                </p>
                <p className="text-xs text-muted-foreground">
                  Younger cats featured on the dedicated kittens listing.
                </p>
              </div>
            </li>
            <li className="flex items-center gap-4 px-6 py-4">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-muted text-sm text-[var(--color-bronze-deep)]">
                ★
              </span>
              <div>
                <p className="text-sm font-medium">
                  {stats?.featured ?? "--"} featured
                  {stats?.uncategorized != null
                    ? ` · ${stats.uncategorized} uncategorized`
                    : ""}
                </p>
                <p className="text-xs text-muted-foreground">
                  Admin-selected highlights and cats still missing a category.
                </p>
              </div>
            </li>
          </ul>
        </Card>

        <Card className="rounded-lg border-border bg-card p-0 shadow-none">
          <div className="flex items-center gap-3 border-b border-border px-6 py-4">
            <h2 className="font-serif text-lg">Recently added cats</h2>
            <span className="ml-auto eyebrow">Newest first</span>
          </div>

          {recentError ? (
            <p className="px-6 py-4 text-sm text-muted-foreground">
              {recentError}
            </p>
          ) : recent === null ? (
            <p className="px-6 py-4 text-sm text-muted-foreground">Loading…</p>
          ) : recent.length === 0 ? (
            <p className="px-6 py-4 text-sm text-muted-foreground">
              No cats in the registry yet.
            </p>
          ) : (
            <ul className="divide-y divide-border">
              {recent.map((p, i) => {
                const thumb = p.petImages?.[0];
                const name = p.name || "Untitled cat";
                return (
                  <li
                    key={p._id ?? p.id ?? `${name}-${i}`}
                    className="flex items-center gap-4 px-6 py-4"
                  >
                    <span className="relative h-11 w-11 shrink-0 overflow-hidden rounded-md border border-border bg-muted">
                      {thumb ? (
                        <Image
                          src={thumb}
                          alt={name}
                          fill
                          sizes="44px"
                          unoptimized
                          className="object-cover"
                        />
                      ) : (
                        <span className="flex h-full w-full items-center justify-center text-[var(--color-bronze-deep)]">
                          <PawPrint className="h-4 w-4" />
                        </span>
                      )}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">
                        {name}
                        {p.category ? (
                          <span className="text-muted-foreground">
                            {" "}
                            · {p.category}
                          </span>
                        ) : null}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Added {formatAddedDate(p)}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>
      </section>
    </div>
  );
}
