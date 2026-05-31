import { AlertTriangle, ArrowLeft, Bookmark, CheckCircle2, ExternalLink, HelpCircle, ListChecks } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { FlagList } from "../../components/FlagList";
import { MetricCard } from "../../components/MetricCard";
import { RiskBadge } from "../../components/RiskBadge";
import { Shell } from "../../components/Shell";
import { getAsset } from "../../lib/api";
import { compactNumber, dateTime, fullNumber, money, percentRatio, percentValue } from "../../lib/format";

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
          <Link href="/" className="inline-flex items-center gap-1 text-sm text-cyan-200 hover:text-cyan-100">
            <ArrowLeft size={14} /> Radar
          </Link>
          <h1 className="mt-2 text-3xl font-semibold text-white">{asset.name} <span className="text-slate-400">{asset.symbol}</span></h1>
          <p className="mt-2 text-sm text-slate-400">{asset.categories.join(", ") || asset.category || "Kategori yok"} · {asset.chain || "Chain bilinmiyor"}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <RiskBadge value={asset.risk_level} />
          <RiskBadge value={asset.action_label} />
          <Link
            href={`/watchlist?asset=${asset.id}`}
            className="inline-flex items-center gap-1.5 rounded-md border border-cyan-300/30 bg-cyan-300/10 px-3 py-1.5 text-sm font-medium text-cyan-200 hover:bg-cyan-300/20 transition-colors"
          >
            <Bookmark size={14} /> İzle&apos;ye Ekle
          </Link>
        </div>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <MetricCard label="Score" value={asset.total_score ?? "-"} hint="0-100 merkezi skor" />
        <MetricCard label="Market Cap" value={money(asset.market_cap)} />
        <MetricCard label="FDV/MCAP" value={compactNumber(asset.fdv_mcap_ratio)} hint="8 üstü manuel unlock kontrolü gerektirir" />
        <MetricCard label="Liquidity" value={money(asset.liquidity_usd)} />
        <MetricCard label="TVL" value={money(asset.tvl)} />
      </div>

      <section className={`mt-6 rounded-lg border p-5 ${decisionTone(asset.risk_flags).card}`}>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className={`inline-flex items-center gap-2 text-sm font-semibold ${decisionTone(asset.risk_flags).text}`}>
              <AlertTriangle size={16} /> Karar özeti
            </p>
            <h2 className="mt-2 text-xl font-semibold text-white">{decisionTitle(asset)}</h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-300">{decisionSummary(asset)}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <RiskBadge value={asset.risk_level} />
            <RiskBadge value={asset.action_label} />
          </div>
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          <SignalBox title="Kritik uyarılar" icon={<AlertTriangle size={15} />} flags={criticalFlags(asset.risk_flags)} tone="bad" empty="Kritik uyarı yok" />
          <SignalBox title="Olumlu sinyaller" icon={<CheckCircle2 size={15} />} flags={positiveSignals(asset)} tone="good" empty="Güçlü olumlu sinyal yok" />
          <SignalBox title="Eksik / kapalı veri" icon={<HelpCircle size={15} />} flags={missingSignals(asset)} tone="missing" empty="Eksik veri yok" />
        </div>
      </section>

      <div className="mt-6 grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <section className="rounded-lg border border-white/10 bg-white/[0.04] p-5">
          <h2 className="text-lg font-semibold text-white">Bu coin neden bu skoru aldı?</h2>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {Object.entries(asset.explanation).map(([key, value]) => (
              <ScoreReason key={key} label={key} score={scoreFor(asset.score_breakdown, key)} text={value} />
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

      <section className="mt-6 rounded-lg border border-white/10 bg-white/[0.04] p-5">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-white">On-chain risk radarı</h2>
            <p className="mt-1 text-sm text-slate-500">Mint/freeze authority, holder kümeleri, sniper/dev oranları ve %2 derinlik sinyalleri.</p>
          </div>
          <span className="text-xs text-slate-500">Snapshot: {dateTime(asset.onchain_risk?.snapshot_at)}</span>
        </div>
        {asset.onchain_risk ? (
          <>
            <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              <RiskMetric label="Mint Authority" value={asset.onchain_risk.mint_authority_revoked === null ? "-" : asset.onchain_risk.mint_authority_revoked ? "Revoked" : "Açık"} ok={asset.onchain_risk.mint_authority_revoked} />
              <RiskMetric label="Freeze Authority" value={asset.onchain_risk.freeze_authority_revoked === null ? "-" : asset.onchain_risk.freeze_authority_revoked ? "Revoked" : "Açık"} ok={asset.onchain_risk.freeze_authority_revoked} />
              <RiskMetric label="LP Durumu" value={asset.onchain_risk.lp_status || "-"} />
              <RiskMetric label="Top 10 Holder" value={percentValue(asset.onchain_risk.top10_holder_percent)} />
              <RiskMetric label="Sniper Oranı" value={percentValue(asset.onchain_risk.sniper_holder_percent)} />
              <RiskMetric label="Cüzdan Kümesi" value={percentValue(asset.onchain_risk.bundler_holder_percent)} />
              <RiskMetric label="Dev Holder" value={percentValue(asset.onchain_risk.dev_holder_percent)} />
              <RiskMetric label="Dev Satışı" value={percentValue(asset.onchain_risk.dev_sold_percent)} />
              <RiskMetric label="Smart Trader" value={percentValue(asset.onchain_risk.smart_trader_holder_percent)} />
              <RiskMetric label="Smart Win Rate" value={percentValue(asset.onchain_risk.smart_money_win_rate)} />
              <RiskMetric label="+2% Depth" value={money(asset.onchain_risk.buy_depth_2pct_usd)} />
              <RiskMetric label="-2% Depth" value={money(asset.onchain_risk.sell_depth_2pct_usd)} />
              <RiskMetric label="Yıllık Emisyon" value={percentValue(asset.onchain_risk.annual_emission_percent)} />
            </div>
            <div className="mt-4">
              <FlagList flags={asset.onchain_risk.risk_flags} limit={12} />
            </div>
          </>
        ) : (
          <p className="mt-4 rounded-md border border-amber-300/20 bg-amber-300/5 p-3 text-sm text-amber-100">
            On-chain risk verisi yok. Backend tarafında Birdeye ve Helius API anahtarları girildikten sonra `php artisan crypto:sync-onchain-risk` çalıştır.
          </p>
        )}
      </section>

      <div className="mt-6 grid gap-4 xl:grid-cols-3">
        <InfoPanel title="Market metrikleri" rows={[
          ["Price", money(asset.price)],
          ["FDV", money(asset.fdv)],
          ["24h Volume", money(asset.volume_24h)],
          ["Volume/MCAP", percentRatio(asset.volume_mcap_ratio)],
          ["1h Change", percentValue(asset.price_change_1h)],
          ["24h Change", percentValue(asset.price_change_24h)],
          ["7D Trend", percentValue(asset.trend_7d)],
          ["30D Change", percentValue(asset.price_change_30d)],
          ["Circulating Supply", fullNumber(asset.circulating_supply)],
          ["Total Supply", fullNumber(asset.total_supply)],
          ["Son snapshot", dateTime(asset.updated_at)],
        ]} />
        <InfoPanel title="DEX pair bilgileri" rows={[
          ["DEX", String(asset.dex_pair?.dex_id || "-")],
          ["Chain", String(asset.dex_pair?.chain_id || asset.chain || "-")],
          ["Pair", String(asset.dex_pair?.pair_address || "-")],
          ["24h Txns", String(asset.dex_pair?.txns_24h || "-")],
          ["Buys/Sells", `${asset.dex_pair?.buys_24h || "-"} / ${asset.dex_pair?.sells_24h || "-"}`],
          ["DEX 24h Change", percentValue(asset.dex_pair?.price_change_24h as string | number | null | undefined)],
          ["Pair age", dateTime(String(asset.dex_pair?.pair_created_at || ""))],
        ]} footer={asset.dex_pair?.url ? <a href={String(asset.dex_pair.url)} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-sm text-cyan-200"><ExternalLink size={14} /> DEX kaynağı</a> : null} />
        <InfoPanel title="Protokol verileri" rows={[
          ["DefiLlama", String(asset.protocol?.defillama_slug || "-")],
          ["TVL", money(asset.tvl)],
          ["TVL 7D", percentValue(asset.protocol?.tvl_change_7d as string | number | null | undefined)],
          ["TVL 30D", percentValue(asset.protocol?.tvl_change_30d as string | number | null | undefined)],
          ["Fees 24h", money(asset.protocol?.fees_24h as string | number | null | undefined)],
          ["Revenue 24h", money(asset.protocol?.revenue_24h as string | number | null | undefined)],
          ["Protocol Volume 24h", money(asset.protocol?.volume_24h as string | number | null | undefined)],
          ["Son protokol snapshot", dateTime(String(asset.protocol?.snapshot_at || ""))],
        ]} />
      </div>
    </Shell>
  );
}

function SignalBox({ title, icon, flags, tone, empty }: { title: string; icon: ReactNode; flags: string[]; tone: "bad" | "good" | "missing"; empty: string }) {
  const colors = {
    bad: "border-red-300/20 bg-red-300/5 text-red-100",
    good: "border-emerald-300/20 bg-emerald-300/5 text-emerald-100",
    missing: "border-amber-300/20 bg-amber-300/5 text-amber-100",
  };

  return (
    <div className={`rounded-md border p-4 ${colors[tone]}`}>
      <h3 className="flex items-center gap-2 text-sm font-semibold">{icon}{title}</h3>
      <div className="mt-3 grid gap-2">
        {(flags.length ? flags : [empty]).map((flag) => (
          <div key={flag} className="rounded border border-white/10 bg-black/20 px-3 py-2 text-xs text-slate-100">{flag}</div>
        ))}
      </div>
    </div>
  );
}

function decisionTone(flags: string[]) {
  return criticalFlags(flags).length > 0
    ? { card: "border-red-300/25 bg-red-300/5", text: "text-red-100" }
    : { card: "border-emerald-300/20 bg-emerald-300/5", text: "text-emerald-100" };
}

function decisionTitle(asset: NonNullable<Awaited<ReturnType<typeof getAsset>>["data"]>) {
  if (criticalFlags(asset.risk_flags).length > 0) return "İlk bakışta alınabilir değil: önce kritik tutarsızlık çözülmeli.";
  if (asset.action_label === "Güçlü Aday") return "Güçlü aday, ama eksik veri varsa küçük pozisyon/izleme mantıklı.";
  if (asset.action_label === "İzle") return "İzlenebilir, henüz net alım sinyali değil.";
  return "Risk yüksek: işlem öncesi manuel doğrulama gerekli.";
}

function decisionSummary(asset: NonNullable<Awaited<ReturnType<typeof getAsset>>["data"]>) {
  const critical = criticalFlags(asset.risk_flags);
  if (critical.includes("DEX likiditesi FDV/MCAP ile tutarsız")) {
    return "DEX likiditesi FDV/market cap ile mantıksız görünüyor. Bu genelde yanlış pair seçimi, API verisi şişmesi veya likidite datası anormalliği demek; score iyi görünse bile bu coin şu an güvenilir karar üretmiyor.";
  }

  if (critical.length > 0) {
    return `Kritik risk var: ${critical[0]}. Bu çözülmeden skor tek başına olumlu kabul edilmemeli.`;
  }

  return "Kritik kırmızı bayrak görünmüyor. Yine de holder/sniper/LP verileri boşsa bu alanlar doğrulanmadan karar eksik kalır.";
}

function criticalFlags(flags: string[]) {
  const critical = [
    "DEX likiditesi FDV/MCAP ile tutarsız",
    "Mint authority açık",
    "Freeze authority açık",
    "LP durumu güvenli değil",
    "Sniper holder oranı yüksek",
    "Bundler/cüzdan kümesi oranı yüksek",
    "Dev satışı izleniyor",
  ];

  return flags.filter((flag) => critical.includes(flag));
}

function positiveSignals(asset: NonNullable<Awaited<ReturnType<typeof getAsset>>["data"]>) {
  const signals = [];

  if (asset.onchain_risk?.mint_authority_revoked) signals.push("Mint authority revoked");
  if (asset.onchain_risk?.freeze_authority_revoked) signals.push("Freeze authority revoked");
  if (Number(asset.score_breakdown?.liquidity_score ?? 0) >= 16) signals.push("Likidite skoru güçlü");
  if (Number(asset.score_breakdown?.volume_score ?? 0) >= 16) signals.push("Hacim/MCAP skoru güçlü");
  if (Number(asset.score_breakdown?.fdv_score ?? 0) >= 16) signals.push("FDV/MCAP sağlıklı görünüyor");
  if (Number(asset.score_breakdown?.fundamental_score ?? 0) >= 16) signals.push("TVL/fundamental skoru güçlü");

  return signals;
}

function missingSignals(asset: NonNullable<Awaited<ReturnType<typeof getAsset>>["data"]>) {
  const signals = [];

  if (!asset.onchain_risk?.lp_status) signals.push("LP burned/locked durumu yok");
  if (!asset.onchain_risk?.top10_holder_percent) signals.push("Top holder dağılımı yok");
  if (!asset.onchain_risk?.sniper_holder_percent) signals.push("Sniper oranı yok");
  if (!asset.onchain_risk?.sell_depth_2pct_usd) signals.push("-2% gerçek derinlik kapalı/yok");
  if (!asset.onchain_risk?.annual_emission_percent) signals.push("Unlock/emisyon verisi yok");

  return signals;
}

function RiskMetric({ label, value, ok }: { label: string; value: string; ok?: boolean | null }) {
  const color = ok === undefined || ok === null ? "border-white/10 bg-black/20 text-slate-100" : ok ? "border-emerald-300/20 bg-emerald-300/5 text-emerald-100" : "border-red-300/20 bg-red-300/5 text-red-100";

  return (
    <div className={`rounded-md border p-3 ${color}`}>
      <p className="text-xs text-slate-500">{label}</p>
      <p className="mt-1 break-words text-sm font-semibold">{value}</p>
    </div>
  );
}

function ScoreReason({ label, score, text }: { label: string; score: number | null; text: string }) {
  const color = scoreColor(score);

  return (
    <div className={`flex gap-4 rounded-md border p-4 ${color.card}`}>
      <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-full border text-lg font-bold ${color.circle}`}>
        {score ?? "-"}
      </div>
      <div className="min-w-0">
        <p className="text-xs uppercase tracking-wide text-slate-400">{label}</p>
        <p className="mt-2 text-sm leading-6 text-slate-100">{text}</p>
        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10">
          <div className={`h-full rounded-full ${color.bar}`} style={{ width: `${scoreWidth(score)}%` }} />
        </div>
      </div>
    </div>
  );
}

function scoreFor(breakdown: Record<string, number> | null, key: string) {
  return breakdown?.[`${key}_score`] ?? null;
}

function scoreWidth(score: number | null) {
  if (score === null) return 0;

  return Math.min(100, Math.max(0, (score / 20) * 100));
}

function scoreColor(score: number | null) {
  if (score === null) {
    return {
      card: "border-slate-500/20 bg-slate-500/5",
      circle: "border-slate-500/30 bg-slate-500/10 text-slate-300",
      bar: "bg-slate-500",
    };
  }

  if (score >= 16) {
    return {
      card: "border-emerald-400/20 bg-emerald-400/5",
      circle: "border-emerald-300/50 bg-emerald-400/15 text-emerald-100",
      bar: "bg-emerald-400",
    };
  }

  if (score >= 12) {
    return {
      card: "border-amber-300/20 bg-amber-300/5",
      circle: "border-amber-300/50 bg-amber-300/15 text-amber-100",
      bar: "bg-amber-300",
    };
  }

  if (score >= 8) {
    return {
      card: "border-orange-400/20 bg-orange-400/5",
      circle: "border-orange-300/50 bg-orange-400/15 text-orange-100",
      bar: "bg-orange-400",
    };
  }

  return {
    card: "border-red-400/20 bg-red-400/5",
    circle: "border-red-300/50 bg-red-400/15 text-red-100",
    bar: "bg-red-400",
  };
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
