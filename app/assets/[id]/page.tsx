import { ExternalLink, ListChecks } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { FlagList } from "../../components/FlagList";
import { MetricCard } from "../../components/MetricCard";
import { RiskBadge } from "../../components/RiskBadge";
import { Shell } from "../../components/Shell";
import { getAsset } from "../../lib/api";
import { compactNumber, dateTime, money, percentRatio, percentValue } from "../../lib/format";

export const dynamic = "force-dynamic";

export default async function AssetDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { data: asset } = await getAsset(id);

  if (!asset) {
    return (
      <Shell>
        <div className="rounded-lg border border-white/10 bg-white/[0.04] p-8">
          <p className="text-lg font-semibold">Coin bulunamadı</p>
          <Link href="/" className="mt-4 inline-block rounded-md border border-white/10 px-4 py-2 text-sm text-slate-300">Radara dön</Link>
        </div>
      </Shell>
    );
  }

  return (
    <Shell>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <Link href="/" className="text-sm text-cyan-200 hover:text-cyan-100">Radar</Link>
          <h1 className="mt-2 text-3xl font-semibold text-white">{asset.name} <span className="text-slate-400">{asset.symbol}</span></h1>
          <p className="mt-2 text-sm text-slate-400">{asset.categories.join(", ") || asset.category || "Kategori yok"} · {asset.chain || "Chain bilinmiyor"}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <RiskBadge value={asset.risk_level} />
          <RiskBadge value={asset.action_label} />
        </div>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <MetricCard label="Score" value={asset.total_score ?? "-"} hint="0-100 merkezi skor" />
        <MetricCard label="Market Cap" value={money(asset.market_cap)} />
        <MetricCard label="FDV/MCAP" value={compactNumber(asset.fdv_mcap_ratio)} hint="8 üstü manuel unlock kontrolü gerektirir" />
        <MetricCard label="Liquidity" value={money(asset.liquidity_usd)} />
        <MetricCard label="TVL" value={money(asset.tvl)} />
      </div>

      <div className="mt-6 grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <section className="rounded-lg border border-white/10 bg-white/[0.04] p-5">
          <h2 className="text-lg font-semibold text-white">Bu coin neden bu skoru aldı?</h2>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {Object.entries(asset.explanation).map(([key, value]) => (
              <div key={key} className="rounded-md border border-white/10 bg-black/20 p-4">
                <p className="text-xs uppercase text-slate-500">{key}</p>
                <p className="mt-2 text-sm text-slate-200">{value}</p>
              </div>
            ))}
          </div>
          <div className="mt-5">
            <h3 className="mb-3 text-sm font-semibold text-slate-300">Risk bayrakları</h3>
            <FlagList flags={asset.risk_flags} limit={12} />
          </div>
        </section>

        <section className="rounded-lg border border-white/10 bg-white/[0.04] p-5">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-white"><ListChecks size={18} /> Manuel kontrol notları</h2>
          <div className="mt-4 grid gap-2">
            {asset.manual_checks.map((item) => (
              <div key={item} className="rounded-md border border-white/10 bg-black/20 p-3 text-sm text-slate-200">{item}</div>
            ))}
          </div>
          <p className="mt-4 text-xs text-slate-500">Bu panel karar üretmez; yalnızca veriyi okunabilir hale getirir.</p>
        </section>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <InfoPanel title="Market metrikleri" rows={[
          ["Price", money(asset.price)],
          ["FDV", money(asset.fdv)],
          ["24h Volume", money(asset.volume_24h)],
          ["Volume/MCAP", percentRatio(asset.volume_mcap_ratio)],
          ["7D Trend", percentValue(asset.trend_7d)],
          ["Son snapshot", dateTime(asset.updated_at)],
        ]} />
        <InfoPanel title="DEX pair bilgileri" rows={[
          ["DEX", String(asset.dex_pair?.dex_id || "-")],
          ["Chain", String(asset.dex_pair?.chain_id || asset.chain || "-")],
          ["Pair", String(asset.dex_pair?.pair_address || "-")],
          ["24h Txns", String(asset.dex_pair?.txns_24h || "-")],
          ["Buys/Sells", `${asset.dex_pair?.buys_24h || "-"} / ${asset.dex_pair?.sells_24h || "-"}`],
          ["Pair age", dateTime(String(asset.dex_pair?.pair_created_at || ""))],
        ]} footer={asset.dex_pair?.url ? <a href={String(asset.dex_pair.url)} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-sm text-cyan-200"><ExternalLink size={14} /> DEX kaynağı</a> : null} />
      </div>
    </Shell>
  );
}

function InfoPanel({ title, rows, footer }: { title: string; rows: [string, string][]; footer?: ReactNode }) {
  return (
    <section className="rounded-lg border border-white/10 bg-white/[0.04] p-5">
      <h2 className="text-lg font-semibold text-white">{title}</h2>
      <dl className="mt-4 grid gap-3 sm:grid-cols-2">
        {rows.map(([label, value]) => (
          <div key={label} className="rounded-md border border-white/10 bg-black/20 p-3">
            <dt className="text-xs text-slate-500">{label}</dt>
            <dd className="mt-1 break-words text-sm font-medium text-slate-100">{value}</dd>
          </div>
        ))}
      </dl>
      {footer ? <div className="mt-4">{footer}</div> : null}
    </section>
  );
}
