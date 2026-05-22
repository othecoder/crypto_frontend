import { ArrowRight, ArrowUpDown } from "lucide-react";
import Link from "next/link";
import type { AssetListItem } from "../lib/types";
import { compactNumber, money, percentRatio, percentValue } from "../lib/format";
import { FlagList } from "./FlagList";
import { RiskBadge } from "./RiskBadge";

export function AssetTable({ assets }: { assets: AssetListItem[] }) {
  if (!assets.length) {
    return (
      <div className="rounded-lg border border-white/10 bg-white/[0.04] p-8 text-center">
        <p className="text-base font-medium text-white">Gösterilecek coin yok</p>
        <p className="mt-2 text-sm text-slate-400">Filtreleri gevşet veya demo seed çalıştır.</p>
      </div>
    );
  }

  return (
    <>
      {/* Desktop table */}
      <div className="hidden overflow-x-auto rounded-lg border border-white/10 bg-white/[0.04] lg:block">
        <table className="w-full min-w-[900px] border-collapse text-left text-sm">
          <thead className="sticky top-[73px] bg-[#111722] text-xs uppercase text-slate-400">
            <tr>
              {headers.map(({ label, sortable }) => (
                <th key={label} className="px-3 py-3 font-medium whitespace-nowrap">
                  <span className="inline-flex items-center gap-1" title={tooltip(label)}>
                    {label}
                    {sortable ? <ArrowUpDown size={12} /> : null}
                  </span>
                </th>
              ))}
              <th className="px-3 py-3" />
            </tr>
          </thead>
          <tbody>
            {assets.map((asset) => (
              <tr key={asset.id} className="group border-t border-white/10 hover:bg-white/[0.05] transition-colors">
                <td className="px-3 py-4">
                  <Link href={`/assets/${asset.id}`} className="flex min-w-[160px] items-center gap-3 group-hover:opacity-90">
                    <CoinAvatar asset={asset} />
                    <span>
                      <span className="block font-semibold text-white">{asset.symbol}</span>
                      <span className="block text-xs text-slate-400">{asset.name}</span>
                    </span>
                  </Link>
                </td>
                <td className="px-3 py-4 text-slate-300 whitespace-nowrap">{asset.category || "-"}</td>
                <td className="px-3 py-4 text-slate-200 whitespace-nowrap">{money(asset.price)}</td>
                <td className="px-3 py-4 text-slate-200 whitespace-nowrap">{money(asset.market_cap)}</td>
                <td className="px-3 py-4 text-slate-200 whitespace-nowrap">{compactNumber(asset.fdv_mcap_ratio)}</td>
                <td className="px-3 py-4 text-slate-200 whitespace-nowrap">{money(asset.volume_24h)}</td>
                <td className="px-3 py-4 text-slate-200 whitespace-nowrap">{percentRatio(asset.volume_mcap_ratio)}</td>
                <td className="px-3 py-4 text-slate-200 whitespace-nowrap">{money(asset.liquidity_usd)}</td>
                <td className="px-3 py-4 text-slate-200 whitespace-nowrap">{money(asset.tvl)}</td>
                <td className={`px-3 py-4 whitespace-nowrap font-medium ${trendColor(asset.trend_7d)}`}>
                  {percentValue(asset.trend_7d)}
                </td>
                <td className="px-3 py-4">
                  <span className="text-lg font-semibold text-white">{asset.total_score ?? "-"}</span>
                </td>
                <td className="px-3 py-4"><RiskBadge value={asset.risk_level} /></td>
                <td className="px-3 py-4"><RiskBadge value={asset.action_label} /></td>
                <td className="px-3 py-4">
                  <Link
                    href={`/assets/${asset.id}`}
                    className="inline-flex items-center gap-1 rounded-md border border-white/10 px-3 py-1.5 text-xs text-slate-300 hover:border-cyan-300/50 hover:text-cyan-200 transition-colors whitespace-nowrap"
                  >
                    Detay <ArrowRight size={12} />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile card list */}
      <div className="grid gap-3 lg:hidden">
        {assets.map((asset) => (
          <Link key={asset.id} href={`/assets/${asset.id}`} className="block rounded-lg border border-white/10 bg-white/[0.04] p-4 hover:border-white/20 transition-colors">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <CoinAvatar asset={asset} />
                <div>
                  <p className="font-semibold text-white">{asset.symbol}</p>
                  <p className="text-sm text-slate-400">{asset.name}</p>
                </div>
              </div>
              <div className="flex flex-col items-end gap-1">
                <p className="text-xl font-semibold text-white">{asset.total_score ?? "-"}</p>
                <RiskBadge value={asset.action_label} />
              </div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3 text-sm min-[390px]:grid-cols-3">
              <Metric label="Market Cap" value={money(asset.market_cap)} />
              <Metric label="FDV/MCAP" value={compactNumber(asset.fdv_mcap_ratio)} />
              <Metric label="Volume/MCAP" value={percentRatio(asset.volume_mcap_ratio)} />
              <Metric label="Liquidity" value={money(asset.liquidity_usd)} />
              <Metric label="Risk" value={asset.risk_level || "-"} />
              <Metric label="7D Trend" value={percentValue(asset.trend_7d)} />
            </div>
            {asset.risk_flags.length > 0 && (
              <div className="mt-3">
                <FlagList flags={asset.risk_flags} />
              </div>
            )}
            <div className="mt-3 flex items-center justify-end text-xs text-cyan-300">
              Detayı gör <ArrowRight size={12} className="ml-1" />
            </div>
          </Link>
        ))}
      </div>
    </>
  );
}

const headers = [
  { label: "Coin", sortable: false },
  { label: "Category", sortable: false },
  { label: "Price", sortable: false },
  { label: "Market Cap", sortable: true },
  { label: "FDV/MCAP", sortable: false },
  { label: "24h Volume", sortable: false },
  { label: "Volume/MCAP", sortable: false },
  { label: "Liquidity", sortable: true },
  { label: "TVL", sortable: false },
  { label: "7D Trend", sortable: false },
  { label: "Score", sortable: true },
  { label: "Risk", sortable: false },
  { label: "Durum", sortable: false },
];

function trendColor(value: string | null) {
  if (!value) return "text-slate-400";
  const n = parseFloat(value);
  if (n > 0) return "text-emerald-400";
  if (n < 0) return "text-red-400";
  return "text-slate-400";
}

function CoinAvatar({ asset }: { asset: AssetListItem }) {
  return asset.image_url ? (
    <img src={asset.image_url} alt="" className="h-9 w-9 flex-shrink-0 rounded-full bg-white/10" />
  ) : (
    <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-cyan-400/10 text-xs font-semibold text-cyan-200">
      {asset.symbol.slice(0, 3)}
    </span>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-white/10 bg-black/20 p-3">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="mt-1 break-words text-sm font-medium text-slate-100">{value}</p>
    </div>
  );
}

function tooltip(header: string) {
  const map: Record<string, string> = {
    "FDV/MCAP": "FDV piyasa değerine göre çok yüksekse unlock riski için manuel kontrol gerekir.",
    "Volume/MCAP": "24 saatlik hacmin market cap'e oranı.",
    Liquidity: "DEX tarafında seçilen ana pair likiditesi.",
    TVL: "DefiLlama üzerinden bulunan protokol TVL verisi.",
    Score: "Likidite, hacim, FDV, trend ve temel metriklerden 0-100 skor.",
  };
  return map[header] || header;
}
