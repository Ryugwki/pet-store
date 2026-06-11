"use client";

import Section from "@/components/shared/Section";
import { useCurrency } from "@/lib/currency";

export default function Content() {
  const { currency, format } = useCurrency();
  // Base pricing in USD; simple example conversion for VND (fixed rate). Replace with real rates if needed.
  const baseUsd = 3000;
  const amount = currency === "VND" ? baseUsd * 25000 : baseUsd;

  return (
    <>
      <Section title="Policy" center>
        <ul className="mx-auto max-w-2xl space-y-3 text-base leading-relaxed text-foreground">
          <li className="relative pl-6 before:absolute before:left-0 before:top-0 before:text-[var(--color-bronze)] before:content-['—']">
            Registered kittens with vet check-up and sales agreement.
          </li>
          <li className="relative pl-6 before:absolute before:left-0 before:top-0 before:text-[var(--color-bronze)] before:content-['—']">
            Parents/ancestors health tested for HCM/PKD (ultrasound), HD
            (X-ray), and DNA.
          </li>
          <li className="relative pl-6 before:absolute before:left-0 before:top-0 before:text-[var(--color-bronze)] before:content-['—']">
            Kittens tested for FeLV/FIV and parasites.
          </li>
        </ul>
      </Section>

      <Section title="Reservation Process" center>
        <ul className="mx-auto max-w-2xl space-y-4 text-base leading-relaxed text-foreground">
          <li className="relative pl-6 before:absolute before:left-0 before:top-0 before:text-[var(--color-bronze)] before:content-['—']">
            <span className="font-serif text-lg text-[var(--color-bronze-deep)]">
              Deposit:
            </span>{" "}
            A $500 non-refundable deposit is required to secure your spot on the
            waiting list.
          </li>
          <li className="relative pl-6 before:absolute before:left-0 before:top-0 before:text-[var(--color-bronze)] before:content-['—']">
            <span className="font-serif text-lg text-[var(--color-bronze-deep)]">
              Second Deposit:
            </span>{" "}
            An additional $500 deposit is due 4 weeks after the kittens are born.
          </li>
          <li className="relative pl-6 before:absolute before:left-0 before:top-0 before:text-[var(--color-bronze)] before:content-['—']">
            <span className="font-serif text-lg text-[var(--color-bronze-deep)]">
              Deposit Guarantee:
            </span>{" "}
            Your deposit guarantees a quality kitten from our 2024 litters, with
            your preferred gender, coat type, and color (subject to
            availability).
          </li>
          <li className="relative pl-6 before:absolute before:left-0 before:top-0 before:text-[var(--color-bronze)] before:content-['—']">
            <span className="font-serif text-lg text-[var(--color-bronze-deep)]">
              Price:
            </span>{" "}
            {format(amount)} for all colors.
          </li>
        </ul>
      </Section>
    </>
  );
}
