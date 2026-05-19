import type { AssetDetail, HealthPayload, PaginatedAssets, SourceStatus, WatchlistItem } from "./types";

export function apiBaseUrl() {
  return (process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000/api").replace(/\/$/, "");
}

export async function fetchJson<T>(path: string, fallback: T): Promise<T> {
  try {
    const response = await fetch(`${apiBaseUrl()}${path}`, {
      cache: "no-store",
      headers: { Accept: "application/json" },
    });

    if (!response.ok) {
      return fallback;
    }

    return (await response.json()) as T;
  } catch {
    return fallback;
  }
}

export async function getAssets(query = "") {
  return fetchJson<PaginatedAssets>(`/radar/assets${query}`, {
    data: [],
    meta: { current_page: 1, per_page: 25, total: 0, last_page: 1 },
  });
}

export async function getAsset(id: string) {
  return fetchJson<{ data: AssetDetail | null }>(`/radar/assets/${id}`, { data: null });
}

export async function getHealth() {
  return fetchJson<HealthPayload>("/health", {
    status: "unavailable",
    database: "unavailable",
    timestamp: new Date().toISOString(),
    sources: [],
  });
}

export async function getCategories() {
  return fetchJson<{ data: string[] }>("/radar/categories", { data: [] });
}

export async function getRiskFlags() {
  return fetchJson<{ data: { flag: string; count: number }[] }>("/radar/risk-flags", { data: [] });
}

export async function getWatchlist() {
  return fetchJson<{ data: WatchlistItem[] }>("/radar/watchlist", { data: [] });
}

export function sourceLabel(source: SourceStatus) {
  if (source.last_success_at && source.failure_count === 0) return "Sağlıklı";
  if (source.last_success_at) return "Uyarı";
  return "Veri yok";
}
