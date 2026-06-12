// Shared marketing-content defaults + types.
//
// These capture the CURRENT hardcoded marketing copy so the new
// admin-editable settings can fall back to today's EXACT values. When the
// admin has not set a field, the front-end uses the matching DEFAULT_* here,
// so the site looks identical until the owner edits it.
//
// ADDITIVE only: nothing here removes or renames existing FE fields.

// ---------------------------------------------------------------------------
// Home hero marketing (eyebrow + the 3-stat band)
// ---------------------------------------------------------------------------

export type HomeStat = {
  value: string;
  label: string;
};

export type HomeMarketing = {
  eyebrow: string;
  stats: HomeStat[];
};

// The live cat-count stat uses the "{count}" token; the FE replaces it with the
// real pet count via withCount() so the band still shows the live catalogue size.
export const DEFAULT_HOME_MARKETING: HomeMarketing = {
  eyebrow: "WCF & CFA Registered · Maine Coon",
  stats: [
    {
      value: "100%",
      label: "Health-tested lines\nHCM · SMA · PKD",
    },
    {
      value: "{count}",
      label: "Cats in our\ncurrent catalogue",
    },
    {
      value: "3–5 yrs",
      label: "The slow maturing of a\ntrue gentle giant",
    },
  ],
};

// ---------------------------------------------------------------------------
// Trust strip (eyebrow + title + 3 columns)
// ---------------------------------------------------------------------------

export type TrustColumn = {
  num: string;
  title: string;
  body: string;
};

export type TrustContent = {
  eyebrow: string;
  title: string;
  columns: TrustColumn[];
};

export const DEFAULT_TRUST: TrustContent = {
  eyebrow: "Why families wait for one of our kittens",
  title: "Bred with the patience of a much older tradition.",
  columns: [
    {
      num: "No. 1",
      title: "Health, proven on paper",
      body: "Our lines are DNA-tested clear for HCM, SMA and PKD, with cardiac ultrasounds and full DNA panels. Results are shared openly with every family who asks.",
    },
    {
      num: "No. 2",
      title: "Registered pedigree",
      body: "We register every cat and kitten with the World Cat Federation (WCF) and the Cat Fanciers’ Association (CFA). Each kitten carries papers tracing to European champion catteries, viewable in full on PawPeds.",
    },
    {
      num: "No. 3",
      title: "Raised underfoot",
      body: "Kittens grow up in our living room among children and ordinary noise — kept to twelve to sixteen weeks so they are emotionally mature before they go to their new homes.",
    },
  ],
};

// ---------------------------------------------------------------------------
// Policy page content (intro + policy bullets + reservation steps)
// ---------------------------------------------------------------------------

export type ReservationStep = {
  title: string;
  body: string;
};

export type PolicyContent = {
  intro?: string;
  bullets: string[];
  reservation: ReservationStep[];
};

export const DEFAULT_POLICY: PolicyContent = {
  bullets: [
    "Registered kittens with vet check-up and sales agreement.",
    "Parents/ancestors health tested for HCM/PKD (ultrasound), HD (X-ray), and DNA.",
    "Kittens tested for FeLV/FIV and parasites.",
  ],
  // Bodies use {deposit}, {price} and {litterYear} tokens so the rendered copy
  // pulls live values from DEFAULT_PRICING (or admin-set pricing) instead of
  // hardcoded literals. With the defaults these resolve to the EXACT prior
  // strings ($500 deposit, $3,000 price, 2024 litters), so the page is identical.
  reservation: [
    {
      title: "Deposit",
      body: "A {deposit} non-refundable deposit is required to secure your spot on the waiting list.",
    },
    {
      title: "Second Deposit",
      body: "An additional {deposit} deposit is due 4 weeks after the kittens are born.",
    },
    {
      title: "Deposit Guarantee",
      body: "Your deposit guarantees a quality kitten from our {litterYear} litters, with your preferred gender, coat type, and color (subject to availability).",
    },
    {
      title: "Price",
      body: "{price} for all colors.",
    },
  ],
};

// ---------------------------------------------------------------------------
// Pricing (policy page base price + currency conversion)
// ---------------------------------------------------------------------------

export type PricingContent = {
  basePrice: number;
  currency: string;
  deposit: number;
  vndRate: number;
  litterYear: string;
};

export const DEFAULT_PRICING: PricingContent = {
  basePrice: 3000,
  currency: "USD",
  deposit: 500,
  vndRate: 25000,
  litterYear: "2024",
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Replace the "{count}" token in a stat value with the live pet count.
 * Stats that do not contain the token are returned unchanged.
 */
export function withCount(value: string, count: number): string {
  return value.replace(/\{count\}/g, String(count));
}
