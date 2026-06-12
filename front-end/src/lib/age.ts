// Shared age helpers derived from a pet's date of birth.
//
// IMPORTANT: age is computed against the *current* moment at runtime
// (new Date()), NOT a frozen snapshot. This replaces the duplicated
// `const NOW = new Date("2026-06-12...")` logic that previously lived in
// PetCard and the kitten detail page.

function parseDob(dob?: string | Date | null): Date | null {
  if (dob === null || dob === undefined || dob === "") return null;
  const d = dob instanceof Date ? dob : new Date(dob);
  if (Number.isNaN(d.getTime())) return null;
  return d;
}

// Whole completed months between dob and now (>= 0). null for missing/invalid.
function ageMonths(dob?: string | Date | null): number | null {
  const d = parseDob(dob);
  if (!d) return null;
  const now = new Date();
  let months =
    (now.getFullYear() - d.getFullYear()) * 12 +
    (now.getMonth() - d.getMonth());
  if (now.getDate() < d.getDate()) months -= 1;
  if (months < 0) months = 0;
  return months;
}

// Whole completed years between dob and now, or null for missing/invalid dob.
export function ageYears(dob?: string | Date | null): number | null {
  const months = ageMonths(dob);
  if (months === null) return null;
  return Math.floor(months / 12);
}

// Human-readable age string:
//   >= 1 year  -> "{n} yr" / "{n} yrs"
//   <  1 year  -> "{m} mo" / "{m} mos"
//   missing/invalid dob -> ""
export function ageFromDob(dob?: string | Date | null): string {
  const months = ageMonths(dob);
  if (months === null) return "";
  if (months >= 12) {
    const yrs = Math.floor(months / 12);
    return `${yrs} ${yrs === 1 ? "yr" : "yrs"}`;
  }
  return `${months} ${months === 1 ? "mo" : "mos"}`;
}
