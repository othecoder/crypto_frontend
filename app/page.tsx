import { AlertTriangle, Clock3, Gauge, ShieldCheck } from "lucide-react";
import type { ReactNode } from "react";
import { AssetTable } from "./components/AssetTable";
import { MetricCard } from "./components/MetricCard";
import { Shell } from "./components/Shell";
import { getAssets, getCategories, getHealth } from "./lib/api";
import { dateTime } from "./lib/format";

export const dynamic = "force-dynamic";

export default async function Home({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams;
  const query = buildQuery(params);
  const [assets, categories, health] = await Promise.all([getAssets(query), getCategories(), getHealth()]);

  const strong = assets.data.filter((asset) => asset.action_label === "Güçlü Aday").length;
  const risky = assets.data.filter((asset) => asset.action_label === "Riskli" || asset.action_label === "Uzak Dur").length;
  const lastUpdate = assets.data.map((asset) => asset.updated_at).filter(Boolean).sort().at(-1) || null;

  return (
    <Shell>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Toplam izlenen coin" value={assets.meta.total} hint="Aktif radar kayıtları" icon={<Gauge size={20} />} />
        <MetricCard label="Güçlü aday" value={strong} hint="Bu sayfadaki sonuçlar içinde" icon={<ShieldCheck size={20} />} />
        <MetricCard label="Riskli coin" value={risky} hint="Riskli veya uzak dur etiketi" icon={<AlertTriangle size={20} />} />
        <MetricCard label="Son veri güncelleme" value={dateTime(lastUpdate)} hint={`API: ${health.status}`} icon={<Clock3 size={20} />} />
      </div>

      <form className="mt-6 rounded-lg border border-white/10 bg-white/[0.04] p-4">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-6">
          <Field name="search" label="Search" defaultValue={first(params.search)} placeholder="Coin veya sembol" />
          <Field name="market_cap_min" label="MCAP min" defaultValue={first(params.market_cap_min)} placeholder="1000000" />
          <Field name="market_cap_max" label="MCAP max" defaultValue={first(params.market_cap_max)} placeholder="50000000" />
          <Select name="category" label="Category" defaultValue={first(params.category)} options={categories.data} />
          <Select name="risk_level" label="Risk level" defaultValue={first(params.risk_level)} options={["Düşük", "Orta", "Yüksek", "Çok Yüksek", "Veri Eksik"]} />
          <Select name="action_label" label="Action" defaultValue={first(params.action_label)} options={["Güçlü Aday", "İzle", "Riskli", "Uzak Dur", "Manuel Kontrol Gerekli"]} />
          <Field name="score_min" label="Score min" defaultValue={first(params.score_min)} placeholder="40" />
          <Field name="score_max" label="Score max" defaultValue={first(params.score_max)} placeholder="90" />
          <Field name="fdv_mcap_max" label="FDV/MCAP max" defaultValue={first(params.fdv_mcap_max)} placeholder="8" />
          <Field name="volume_mcap_min" label="Volume/MCAP min" defaultValue={first(params.volume_mcap_min)} placeholder="0.01" />
          <Field name="liquidity_min" label="Liquidity min" defaultValue={first(params.liquidity_min)} placeholder="100000" />
          <Select name="sort" label="Sort" defaultValue={first(params.sort)} options={["score_asc", "market_cap_desc", "market_cap_asc", "liquidity_desc", "liquidity_asc", "name_asc"]} />
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <button className="rounded-md bg-cyan-300 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-cyan-200">Filtrele</button>
          <a href="/" className="rounded-md border border-white/10 px-4 py-2 text-sm text-slate-300 hover:border-white/25">Temizle</a>
        </div>
      </form>

      <div className="mt-6">
        <AssetTable assets={assets.data} />
      </div>

      <div className="mt-4 flex items-center justify-between text-sm text-slate-400">
        <span>Sayfa {assets.meta.current_page} / {assets.meta.last_page}</span>
        <div className="flex gap-2">
          <PageLink page={Math.max(1, assets.meta.current_page - 1)} disabled={assets.meta.current_page <= 1} params={params}>Önceki</PageLink>
          <PageLink page={Math.min(assets.meta.last_page, assets.meta.current_page + 1)} disabled={assets.meta.current_page >= assets.meta.last_page} params={params}>Sonraki</PageLink>
        </div>
      </div>
    </Shell>
  );
}

function buildQuery(params: Record<string, string | string[] | undefined>) {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    const current = first(value);
    if (current) search.set(key, current);
  }
  if (!search.has("per_page")) search.set("per_page", "25");
  const text = search.toString();
  return text ? `?${text}` : "";
}

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value || "";
}

function Field({ name, label, defaultValue, placeholder }: { name: string; label: string; defaultValue: string; placeholder: string }) {
  return (
    <label className="block">
      <span className="text-xs text-slate-400">{label}</span>
      <input name={name} defaultValue={defaultValue} placeholder={placeholder} className="mt-1 h-10 w-full rounded-md border border-white/10 bg-black/25 px-3 text-sm text-white outline-none focus:border-cyan-300/60" />
    </label>
  );
}

function Select({ name, label, defaultValue, options }: { name: string; label: string; defaultValue: string; options: string[] }) {
  return (
    <label className="block">
      <span className="text-xs text-slate-400">{label}</span>
      <select name={name} defaultValue={defaultValue} className="mt-1 h-10 w-full rounded-md border border-white/10 bg-black/25 px-3 text-sm text-white outline-none focus:border-cyan-300/60">
        <option value="">Tümü</option>
        {options.map((option) => <option key={option} value={option}>{option}</option>)}
      </select>
    </label>
  );
}

function PageLink({ page, disabled, params, children }: { page: number; disabled: boolean; params: Record<string, string | string[] | undefined>; children: ReactNode }) {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    const current = first(value);
    if (current && key !== "page") search.set(key, current);
  }
  search.set("page", String(page));

  return disabled ? (
    <span className="rounded-md border border-white/10 px-3 py-2 text-slate-600">{children}</span>
  ) : (
    <a className="rounded-md border border-white/10 px-3 py-2 text-slate-300 hover:border-cyan-300/50" href={`/?${search.toString()}`}>{children}</a>
  );
}
