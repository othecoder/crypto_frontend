export function compactNumber(value: string | number | null | undefined) {
  if (value === null || value === undefined || value === "") return "-";
  const number = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(number)) return "-";

  const absolute = Math.abs(number);
  if (absolute >= 1_000_000_000) return `${trim(number / 1_000_000_000)}B`;
  if (absolute >= 1_000_000) return `${trim(number / 1_000_000)}M`;
  if (absolute >= 1_000) return `${trim(number / 1_000)}K`;
  if (absolute < 0.01 && absolute > 0) return number.toPrecision(2);
  return trim(number);
}

export function fullNumber(value: string | number | null | undefined) {
  if (value === null || value === undefined || value === "") return "-";
  const number = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(number)) return "-";

  const absolute = Math.abs(number);
  const maximumFractionDigits = absolute >= 1 ? 2 : 8;

  return new Intl.NumberFormat("tr-TR", {
    maximumFractionDigits,
  }).format(number);
}

export function money(value: string | number | null | undefined) {
  const formatted = fullNumber(value);
  return formatted === "-" ? formatted : `$${formatted}`;
}

export function percentRatio(value: string | number | null | undefined) {
  if (value === null || value === undefined || value === "") return "-";
  const number = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(number)) return "-";
  return `${trim(number * 100)}%`;
}

export function percentValue(value: string | number | null | undefined) {
  if (value === null || value === undefined || value === "") return "-";
  const number = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(number)) return "-";
  return `${trim(number)}%`;
}

export function percentChange(current: string | number | null | undefined, baseline: string | number | null | undefined) {
  if (current === null || current === undefined || current === "" || baseline === null || baseline === undefined || baseline === "") return "-";
  const currentNumber = typeof current === "number" ? current : Number(current);
  const baselineNumber = typeof baseline === "number" ? baseline : Number(baseline);
  if (!Number.isFinite(currentNumber) || !Number.isFinite(baselineNumber) || baselineNumber === 0) return "-";

  const change = ((currentNumber - baselineNumber) / baselineNumber) * 100;
  const prefix = change > 0 ? "+" : "";

  return `${prefix}${trim(change)}%`;
}

export function dateTime(value: string | null | undefined) {
  if (!value) return "-";
  return new Intl.DateTimeFormat("tr-TR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function trim(value: number) {
  return new Intl.NumberFormat("tr-TR", {
    maximumFractionDigits: Math.abs(value) < 10 ? 2 : 1,
  }).format(value);
}
