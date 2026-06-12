"use client";

import { useEffect, useState } from "react";
import Section from "@/components/shared/Section";
import { useCurrency } from "@/lib/currency";
import { settingsAPI } from "@/lib/axios";
import {
  DEFAULT_POLICY,
  DEFAULT_PRICING,
  type PolicyContent,
  type PricingContent,
} from "@/constants/siteDefaults";

export default function Content() {
  const { currency, format } = useCurrency();

  const [policy, setPolicy] = useState<PolicyContent>(DEFAULT_POLICY);
  const [pricing, setPricing] = useState<PricingContent>(DEFAULT_PRICING);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    settingsAPI
      .get()
      .then((res) => {
        if (!mounted) return;
        const data = res.data as {
          policy?: Partial<PolicyContent>;
          pricing?: Partial<PricingContent>;
        };
        // Fall back to today's EXACT defaults when the admin hasn't set them,
        // so the page looks identical until the owner edits.
        setPolicy({ ...DEFAULT_POLICY, ...(data.policy ?? {}) });
        setPricing({ ...DEFAULT_PRICING, ...(data.pricing ?? {}) });
        setError(null);
      })
      .catch(() => {
        if (!mounted) return;
        setError("Failed to load policy info");
      })
      .finally(() => {
        if (!mounted) return;
        setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  // Stored prices are in the admin's base currency (default USD). When the
  // visitor has selected VND, convert using the admin-set vndRate. This
  // preserves the prior $3000 -> ₫ behavior (baseUsd * 25000).
  const toDisplay = (base: number) =>
    currency === "VND" ? base * pricing.vndRate : base;

  const priceText = format(toDisplay(pricing.basePrice));
  const depositText = format(toDisplay(pricing.deposit));

  // Reservation bodies may contain {price}, {deposit} and {litterYear} tokens;
  // substitute them so admin copy + defaults both render with live values.
  const fillTokens = (body: string) =>
    body
      .replace(/\{price\}/g, priceText)
      .replace(/\{deposit\}/g, depositText)
      .replace(/\{litterYear\}/g, pricing.litterYear);

  return (
    <>
      {policy.intro && (
        <Section title="Policy" center>
          <p className="mx-auto max-w-2xl text-base leading-relaxed text-foreground">
            {policy.intro}
          </p>
        </Section>
      )}

      <Section title={policy.intro ? "Health & Registration" : "Policy"} center>
        {loading ? (
          <p className="mx-auto max-w-2xl text-center text-base leading-relaxed text-foreground">
            Loading…
          </p>
        ) : (
          <ul className="mx-auto max-w-2xl space-y-3 text-base leading-relaxed text-foreground">
            {policy.bullets.map((bullet, i) => (
              <li
                key={i}
                className="relative pl-6 before:absolute before:left-0 before:top-0 before:text-[var(--color-bronze)] before:content-['—']"
              >
                {bullet}
              </li>
            ))}
          </ul>
        )}
        {error && !loading && (
          <p className="mx-auto mt-4 max-w-2xl text-center text-sm text-[var(--color-bronze-deep)]">
            {error}
          </p>
        )}
      </Section>

      <Section title="Reservation Process" center>
        <ul className="mx-auto max-w-2xl space-y-4 text-base leading-relaxed text-foreground">
          {policy.reservation.map((step, i) => (
            <li
              key={i}
              className="relative pl-6 before:absolute before:left-0 before:top-0 before:text-[var(--color-bronze)] before:content-['—']"
            >
              <span className="font-serif text-lg text-[var(--color-bronze-deep)]">
                {step.title}:
              </span>{" "}
              {fillTokens(step.body)}
            </li>
          ))}
        </ul>
      </Section>
    </>
  );
}
