"use client";

import { Plus, Trash2 } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { apiBaseUrl } from "../lib/api";
import { dateTime, money, percentChange } from "../lib/format";
import type { AssetListItem, WatchlistItem } from "../lib/types";
import { FlagList } from "../components/FlagList";
import { RiskBadge } from "../components/RiskBadge";

export function WatchlistClient() {
  const [items, setItems] = useState<WatchlistItem[]>([]);
  const [assets, setAssets] = useState<AssetListItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const searchParams = useSearchParams();
  const preselectedAssetId = searchParams.get("asset");
  const [selectedAssetId, setSelectedAssetId] = useState(preselectedAssetId ?? "");

  useEffect(() => {
    void load();
  }, []);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const [watchlistResponse, assetsResponse] = await Promise.all([
        fetch(`${apiBaseUrl()}/radar/watchlist`, { headers: { Accept: "application/json" } }),
        fetch(`${apiBaseUrl()}/radar/assets?per_page=100`, { headers: { Accept: "application/json" } }),
      ]);
      const watchlistJson = await watchlistResponse.json();
      const assetsJson = await assetsResponse.json();
      setItems(watchlistJson.data || []);
      setAssets(assetsJson.data || []);
    } catch {
      setError("API erişilemedi. Backend çalışıyorsa NEXT_PUBLIC_API_URL değerini kontrol et.");
    } finally {
      setLoading(false);
    }
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setError(null);

    if (!selectedAssetId) {
      setError("Önce watchlist'e eklenecek coini seç.");
      return;
    }

    try {
      const response = await fetch(`${apiBaseUrl()}/radar/watchlist`, {
        method: "POST",
        headers: { Accept: "application/json", "Content-Type": "application/json" },
        body: JSON.stringify({
          crypto_asset_id: Number(selectedAssetId),
          note: form.get("note") || null,
          priority: form.get("priority") ? Number(form.get("priority")) : null,
        }),
      });

      if (!response.ok) throw new Error("watchlist");
      event.currentTarget.reset();
      setSelectedAssetId("");
      await load();
    } catch {
      setError("Watchlist kaydı oluşturulamadı.");
    }
  }

  async function remove(id: number) {
    setError(null);
    try {
      const response = await fetch(`${apiBaseUrl()}/radar/watchlist/${id}`, { method: "DELETE" });
      if (!response.ok) throw new Error("delete");
      await load();
    } catch {
      setError("Watchlist kaydı pasifleştirilemedi.");
    }
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[380px_1fr]">
      <form onSubmit={submit} className="rounded-lg border border-white/10 bg-white/[0.04] p-5">
        <h1 className="text-xl font-semibold text-white">Watchlist</h1>
        <p className="mt-2 text-sm text-slate-400">İlk MVP global takip listesi kullanır; auth yoktur.</p>
        <label className="mt-5 block">
          <span className="text-xs text-slate-400">Coin</span>
          <select
            name="crypto_asset_id"
            required
            value={selectedAssetId}
            onChange={(event) => setSelectedAssetId(event.target.value)}
            className="mt-1 h-11 w-full rounded-md border border-white/10 bg-black/25 px-3 text-sm text-white outline-none focus:border-cyan-300/60"
          >
            <option value="">Seç</option>
            {assets.map((asset) => <option key={asset.id} value={asset.id}>{asset.symbol} · {asset.name}</option>)}
          </select>
        </label>
        <label className="mt-3 block">
          <span className="text-xs text-slate-400">Priority</span>
          <select name="priority" className="mt-1 h-11 w-full rounded-md border border-white/10 bg-black/25 px-3 text-sm text-white outline-none focus:border-cyan-300/60">
            <option value="">Yok</option>
            {[1, 2, 3, 4, 5].map((value) => <option key={value} value={value}>{value}</option>)}
          </select>
        </label>
        <label className="mt-3 block">
          <span className="text-xs text-slate-400">Not</span>
          <textarea name="note" rows={4} className="mt-1 w-full resize-none rounded-md border border-white/10 bg-black/25 px-3 py-2 text-sm text-white outline-none focus:border-cyan-300/60" />
        </label>
        <button className="mt-4 inline-flex items-center gap-2 rounded-md bg-cyan-300 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-cyan-200">
          <Plus size={16} />
          Ekle
        </button>
        {error ? <p className="mt-3 text-sm text-red-200">{error}</p> : null}
      </form>

      <section className="rounded-lg border border-white/10 bg-white/[0.04] p-5">
        {loading ? <div className="h-64 animate-pulse rounded-lg bg-white/[0.05]" /> : null}
        {!loading && !items.length ? <p className="text-sm text-slate-400">Watchlist boş.</p> : null}
        <div className="grid gap-3">
          {items.map((item) => (
            <div key={item.id} className="rounded-lg border border-white/10 bg-black/20 p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-lg font-semibold text-white">{item.asset.symbol} <span className="text-slate-400">{item.asset.name}</span></p>
                  <p className="mt-1 text-sm text-slate-400">Eklendi: {dateTime(item.tracked_at)}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <RiskBadge value={item.asset.risk_level} />
                  <RiskBadge value={item.asset.action_label} />
                  <button onClick={() => remove(item.id)} className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-white/10 text-slate-300 hover:border-red-300/40 hover:text-red-100" title="Pasifleştir">
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
              <div className="mt-4 grid gap-3 text-sm md:grid-cols-2 xl:grid-cols-4">
                <WatchMetric
                  label="Fiyat"
                  entry={money(item.entry_price)}
                  current={money(item.asset.price)}
                  change={percentChange(item.asset.price, item.entry_price)}
                />
                <WatchMetric
                  label="Market Cap"
                  entry={money(item.entry_market_cap)}
                  current={money(item.asset.market_cap)}
                  change={percentChange(item.asset.market_cap, item.entry_market_cap)}
                />
                <WatchMetric
                  label="Likidite"
                  entry={money(item.entry_liquidity_usd)}
                  current={money(item.asset.liquidity_usd)}
                  change={percentChange(item.asset.liquidity_usd, item.entry_liquidity_usd)}
                />
                <WatchMetric
                  label="Skor"
                  entry={String(item.entry_score ?? "-")}
                  current={String(item.asset.total_score ?? "-")}
                  change={scoreChange(item.asset.total_score, item.entry_score)}
                />
              </div>
              {item.note ? <p className="mt-3 rounded-md border border-white/10 bg-white/[0.04] p-3 text-sm text-slate-300">{item.note}</p> : null}
              <div className="mt-3"><FlagList flags={item.asset.risk_flags} /></div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function WatchMetric({ label, entry, current, change }: { label: string; entry: string; current: string; change: string }) {
  return (
    <div className="rounded-md border border-white/10 bg-white/[0.03] p-3">
      <p className="text-xs text-slate-500">{label}</p>
      <div className="mt-2 grid gap-1">
        <p className="text-slate-300">Alış gibi: <span className="font-medium text-slate-100">{entry}</span></p>
        <p className="text-slate-300">Şimdi: <span className="font-medium text-slate-100">{current}</span></p>
        <p className={`font-semibold ${changeColor(change)}`}>{change}</p>
      </div>
    </div>
  );
}

function scoreChange(current: number | null, entry: number | null) {
  if (current === null || entry === null) return "-";
  const change = current - entry;
  const prefix = change > 0 ? "+" : "";

  return `${prefix}${change}`;
}

function changeColor(value: string) {
  if (value.startsWith("+")) return "text-emerald-300";
  if (value.startsWith("-")) return "text-red-300";

  return "text-slate-400";
}
