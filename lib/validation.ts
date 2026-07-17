/**
 * Shared, dependency-free form validation helpers.
 *
 * Every validator returns `string | null` — a human-readable error message,
 * or null when the value is valid. Forms compose these into a per-field
 * `errors` record and refuse to submit while any entry is non-null.
 *
 * Several of these rules exist specifically because the Reports & Dashboard
 * pages read this data downstream (recent-activity sorting, days-until-due
 * countdowns, revenue charting by month, budget-used percentages). Bad
 * input here doesn't just look wrong on the form that created it — it
 * silently distorts those aggregate views. Where that's the reason for a
 * rule, it's called out below.
 */

export type Errors<T extends string> = Partial<Record<T, string>>;

/** True if an errors object has no messages in it. */
export function isValid<T extends string>(errors: Errors<T>): boolean {
  return Object.values(errors).every((v) => !v);
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// E.164-ish: optional +, 7-15 digits, tolerant of spaces/dashes/parens on input.
const PHONE_REGEX = /^\+?[0-9()\-.\s]{7,20}$/;

// Earliest plausible record date for this system — catches obvious typos
// like a stray "1901" or a two-digit-year slip, which would otherwise sort
// to the very top/bottom of "recent activity" or create a bogus far-past
// bucket on the revenue trend chart.
const EARLIEST_REALISTIC_DATE = new Date("2015-01-01T00:00:00");

export function required(value: string, label: string): string | null {
  return value.trim().length > 0 ? null : `${label} is required.`;
}

/** Like `required`, but also rejects single/two-character junk (e.g. "a", "xx") that would read oddly in activity feeds and tables. */
export function validateMinLength(value: string, label: string, min = 2): string | null {
  const v = value.trim();
  if (!v) return `${label} is required.`;
  if (v.length < min) return `${label} must be at least ${min} characters.`;
  return null;
}

// Unicode-aware "looks like a person's name" pattern: letters from any
// script, plus the small set of connector punctuation real names use
// (apostrophe, hyphen, period for initials/suffixes like "Jr."). Digits
// and other symbols are rejected outright.
const PERSON_NAME_REGEX = /^[\p{L}\p{M}][\p{L}\p{M}\s'’.-]*$/u;

/**
 * For fields that are always a person (customer contact, staff member,
 * project owner, task assignee). These names get rendered as initials in
 * avatars and read out in activity feeds — "12345" or "N/A" passing
 * `validateMinLength` would otherwise show up looking like a real person.
 * Rejects any digit and requires the rest to look like an actual name.
 */
export function validatePersonName(value: string, label: string, min = 2): string | null {
  const v = value.trim();
  if (!v) return `${label} is required.`;
  if (v.length < min) return `${label} must be at least ${min} characters.`;
  if (/\d/.test(v)) return `${label} shouldn't contain numbers.`;
  if (!PERSON_NAME_REGEX.test(v)) return `Enter a valid ${label.toLowerCase()}.`;
  return null;
}

/**
 * For fields that are name-like but not strictly a person — project
 * names, client/company names, task titles — where digits are
 * legitimate ("3M", "7-Eleven", "Q3 Launch"). This only blocks values
 * that are nothing but digits/symbols ("12345", "----"), which are
 * never a real name and would otherwise render as junk in cards and
 * dashboards further downstream.
 */
export function validateRealisticName(value: string, label: string, min = 2): string | null {
  const v = value.trim();
  if (!v) return `${label} is required.`;
  if (v.length < min) return `${label} must be at least ${min} characters.`;
  if (!/\p{L}/u.test(v)) return `${label} doesn't look like a real ${label.toLowerCase()} — check what was entered.`;
  return null;
}

export function validateEmail(value: string, label = "Email"): string | null {
  const v = value.trim();
  if (!v) return `${label} is required.`;
  if (!EMAIL_REGEX.test(v)) return `Enter a valid ${label.toLowerCase()} address.`;
  return null;
}

export function validatePhone(value: string, label = "Phone"): string | null {
  const v = value.trim();
  if (!v) return null; // phone is optional in these forms
  if (!PHONE_REGEX.test(v)) return `Enter a valid ${label.toLowerCase()} number.`;
  return null;
}

export function validatePassword(
  value: string,
  { minLength = 8 }: { minLength?: number } = {},
): string | null {
  if (!value) return "Password is required.";
  if (value.length < minLength) return `Password must be at least ${minLength} characters.`;
  if (!/[A-Za-z]/.test(value) || !/[0-9]/.test(value)) {
    return "Password must include at least one letter and one number.";
  }
  return null;
}

export function validateConfirm(
  value: string,
  original: string,
  label = "Passwords",
): string | null {
  if (!value) return "Please confirm your password.";
  return value === original ? null : `${label} don't match.`;
}

/**
 * Required numeric field, bounded on both ends.
 * `max` defaults to a generous but finite ceiling — high enough to never
 * block a legitimate value, low enough to catch a fat-fingered extra zero
 * before it distorts a revenue chart or KPI total.
 */
export function validateNumber(
  value: string,
  label: string,
  { min = 0, max = 100_000_000, allowZero = true }: { min?: number; max?: number; allowZero?: boolean } = {},
): string | null {
  const v = value.trim();
  if (!v) return `${label} is required.`;
  const n = Number(v);
  if (Number.isNaN(n)) return `${label} must be a number.`;
  if (!allowZero && n === 0) return `${label} must be greater than 0.`;
  if (n < min) return `${label} cannot be less than ${min}.`;
  if (n > max) return `${label} looks unrealistically large — check for a typo.`;
  return null;
}

/** Optional decimal field (e.g. estimated hours) — blank is fine, but if present must be a valid, bounded number. */
export function validateOptionalNumber(
  value: string,
  label: string,
  { min = 0, max = 100_000 }: { min?: number; max?: number } = {},
): string | null {
  const v = value.trim();
  if (!v) return null;
  const n = Number(v);
  if (Number.isNaN(n)) return `${label} must be a number.`;
  if (n < min) return `${label} must be at least ${min}.`;
  if (n > max) return `${label} looks unrealistically large — check for a typo.`;
  return null;
}

/** Optional whole-number field (e.g. counts) — blank is fine, but if present must be a valid, bounded integer. */
export function validateOptionalInteger(
  value: string,
  label: string,
  { min = 0, max = 100_000 }: { min?: number; max?: number } = {},
): string | null {
  const v = value.trim();
  if (!v) return null;
  const n = Number(v);
  if (!Number.isInteger(n)) return `${label} must be a whole number.`;
  if (n < min) return `${label} must be at least ${min}.`;
  if (n > max) return `${label} looks unrealistically large — check for a typo.`;
  return null;
}

export function validateDate(value: string, label: string): string | null {
  if (!value) return `${label} is required.`;
  const d = new Date(`${value}T00:00:00`);
  if (Number.isNaN(d.getTime())) return `${label} is not a valid date.`;
  return null;
}

/**
 * Date field bounded to a plausible window. Downstream, due dates drive
 * "days until due" countdowns (task board, project spotlight, agenda
 * timeline) and issued dates drive monthly revenue buckets — an out-of-range
 * year (typo'd or picked wrong in the date widget) produces a nonsensical
 * "12,847 days overdue" or a chart bucket decades away from everything else.
 */
export function validateRealisticDate(
  value: string,
  label: string,
  { maxYearsAhead = 5 }: { maxYearsAhead?: number } = {},
): string | null {
  const base = validateDate(value, label);
  if (base) return base;
  const d = new Date(`${value}T00:00:00`);
  if (d < EARLIEST_REALISTIC_DATE) return `${label} looks too far in the past — check the year.`;
  const latest = new Date();
  latest.setFullYear(latest.getFullYear() + maxYearsAhead);
  if (d > latest) return `${label} is more than ${maxYearsAhead} years out — check the year.`;
  return null;
}

/** For dates that record something that already happened (e.g. "joined") — can't be in the future. */
export function validateNotFutureDate(value: string, label: string): string | null {
  const base = validateDate(value, label);
  if (base) return base;
  if (new Date(value) < EARLIEST_REALISTIC_DATE) return `${label} looks too far in the past — check the year.`;
  const d = new Date(`${value}T00:00:00`);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (d > today) return `${label} can't be in the future.`;
  return null;
}

/** Ensures `endValue` isn't chronologically before `startValue` (only checked once both are valid dates). */
export function validateDateOrder(
  startValue: string,
  endValue: string,
  startLabel: string,
  endLabel: string,
): string | null {
  if (!startValue || !endValue) return null;
  const s = new Date(`${startValue}T00:00:00`).getTime();
  const e = new Date(`${endValue}T00:00:00`).getTime();
  if (Number.isNaN(s) || Number.isNaN(e)) return null;
  if (e < s) return `${endLabel} can't be before ${startLabel}.`;
  return null;
}

/**
 * Collapses internal whitespace and trims. Applied to identity fields
 * (name/company/etc.) at submit time — without this, "Acme Corp" and
 * "Acme  Corp" (stray double space) save as two different-looking values,
 * which fragments customer/revenue counts in the Reports page even though
 * a human reading them would consider them the same record.
 */
export function normalizeText(value: string): string {
  return value.trim().replace(/\s+/g, " ");
}

/** Comma-separated list field — trims, collapses whitespace, and drops empties before returning entries. */
export function splitList(raw: string): string[] {
  return raw
    .split(",")
    .map((s) => normalizeText(s))
    .filter(Boolean);
}

/** Bounded list validator for free-text tag-style fields — caps entry count and per-entry length so pills can't be broken by a giant paste. */
export function validateList(
  raw: string,
  label: string,
  { maxItems = 10, maxItemLength = 24 }: { maxItems?: number; maxItemLength?: number } = {},
): string | null {
  const items = splitList(raw);
  if (items.length > maxItems) return `${label} can have at most ${maxItems} entries.`;
  const tooLong = items.find((i) => i.length > maxItemLength);
  if (tooLong) return `Keep each ${label.toLowerCase()} entry under ${maxItemLength} characters.`;
  return null;
}

/** Like `validateList`, but for fields that specifically hold short initials (e.g. team avatars) — much tighter per-entry length. */
export function validateInitialsList(
  raw: string,
  label: string,
  { maxItems = 8, maxItemLength = 4 }: { maxItems?: number; maxItemLength?: number } = {},
): string | null {
  const items = splitList(raw);
  if (items.length > maxItems) return `${label} can have at most ${maxItems} members.`;
  const tooLong = items.find((i) => i.length > maxItemLength);
  if (tooLong) return `"${tooLong}" doesn't look like initials — keep each entry to ${maxItemLength} characters.`;
  return null;
}