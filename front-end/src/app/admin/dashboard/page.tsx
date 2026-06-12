"use client";

import { Card } from "@/components/ui/card";
import { PawPrint } from "lucide-react";
import { useEffect, useState } from "react";
import { adminAPI, handleAPIError } from "@/lib/axios";

type Stats = { total: number; males: number; females: number; kittens: number };

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    adminAPI
      .getStats()
      .then((res) => {
        if (!mounted) return;
        setStats(res.data as Stats);
      })
      .catch((err) => setError(handleAPIError(err)));
    return () => {
      mounted = false;
    };
  }, []);

  const kpis = [
    { label: "Total cats", value: stats?.total, sub: "in the registry", accent: true },
    { label: "Males", value: stats?.males, sub: "kings on the roster" },
    { label: "Females", value: stats?.females, sub: "queens on the roster" },
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
          </ul>
        </Card>

        <Card className="rounded-lg border-border bg-card p-0 shadow-none">
          <div className="flex items-center gap-3 border-b border-border px-6 py-4">
            <h2 className="font-serif text-lg">Recent Activity</h2>
            <span className="ml-auto eyebrow">Latest</span>
          </div>
          <ul className="divide-y divide-border">
            <li className="flex items-center gap-3 px-6 py-4 text-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-bronze)]" aria-hidden="true" />
              New pet added: “Snowy” (Kitten)
            </li>
            <li className="flex items-center gap-3 px-6 py-4 text-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-bronze)]" aria-hidden="true" />
              User “minh” updated profile
            </li>
            <li className="flex items-center gap-3 px-6 py-4 text-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-bronze)]" aria-hidden="true" />
              Order #1024 marked as shipped
            </li>
          </ul>
        </Card>
      </section>
    </div>
  );
}
