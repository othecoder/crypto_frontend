import { ArrowUpDown } from "lucide-react";
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
      <div className="hidden overflow-hidden rounded-lg border border-white/10 bg-white/[0.04] lg:block">
        <table className="w-full border-collapse text-left text-sm">
          <thead className="sticky top-[73px] bg-[#111722] text-xs uppercase text-slate-400">
            <tr>
              {["Coin", "Category", "Price", "Market Cap", "FDV/MCAP", "24h Volume", "Volume/MCAP", "Liquidity", "TVL", "7D Trend", "Score", "Risk", "Action", "Flags"].map((header) => (
                <th key={header} className="px-3 py-3 font-medium">
                  <span className="inline-flex items-center gap-1" title={tooltip(header)}>
                    {header}
                    {["Market Cap", "Score", "Liquidity"].includes(header) ? <ArrowUpDown size={12} /> : null}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {assets.map((asset) => (
              <tr key={asset.id} className="border-t border-white/10 hover:bg-white/[0.03]">
                <td className="px-3 py-4">
                  <Link href={`/assets/${asset.id}`} className="flex min-w-44 items-center gap-3">
                    <CoinAvatar asset={asset} />
                    <span>
                      <span className="block font-semibold text-white">{asset.symbol}</span>
                      <span className="block text-xs text-slate-400">{asset.name}</span>
                    </span>
                  </Link>
                </td>
                <td className="px-3 py-4 text-slate-300">{asset.category || "-"}</td>
                <td className="px-3 py-4 text-slate-200">{money(asset.price)}</td>
                <td className="px-3 py-4 text-slate-200">{money(asset.market_cap)}</td>
                <td className="px-3 py-4 text-slate-200">{compactNumber(asset.fdv_mcap_ratio)}</td>
                <td className="px-3 py-4 text-slate-200">{money(asset.volume_24h)}</td>
                <td className="px-3 py-4 text-slate-200">{percentRatio(asset.volume_mcap_ratio)}</td>
                <td className="px-3 py-4 text-slate-200">{money(asset.liquidity_usd)}</td>
                <td className="px-3 py-4 text-slate-200">{money(asset.tvl)}</td>
                <td className="px-3 py-4 text-slate-200">{percentValue(asset.trend_7d)}</td>
                <td className="px-3 py-4">
                  <span className="text-lg font-semibold text-white">{asset.total_score ?? "-"}</span>
                </td>
                <td className="px-3 py-4"><RiskBadge value={asset.risk_level} /></td>
                <td className="px-3 py-4"><RiskBadge value={asset.action_label} /></td>
                <td className="px-3 py-4">
                  <FlagList flags={asset.risk_flags} />
                  <p className="mt-2 text-xs text-slate-500">Neden: {asset.risk_flags[0] || asset.action_label || "Detayda açıklama var"}</p>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="grid gap-3 lg:hidden">
        {assets.map((asset) => (
          <Link key={asset.id} href={`/assets/${asset.id}`} className="rounded-lg border border-white/10 bg-white/[0.04] p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <CoinAvatar asset={asset} />
                <div>
                  <p className="font-semibold text-white">{asset.symbol}</p>
                  <p className="text-sm text-slate-400">{asset.name}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xl font-semibold text-white">{asset.total_score ?? "-"}</p>
                <RiskBadge value={asset.risk_level} />
              </div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3 text-sm min-[390px]:grid-cols-3">
              <Metric label="Market Cap" value={money(asset.market_cap)} />
              <Metric label="FDV/MCAP" value={compactNumber(asset.fdv_mcap_ratio)} />
              <Metric label="Volume/MCAP" value={percentRatio(asset.volume_mcap_ratio)} />
              <Metric label="Liquidity" value={money(asset.liquidity_usd)} />
              <Metric label="Action" value={asset.action_label || "-"} />
              <Metric label="7D Trend" value={percentValue(asset.trend_7d)} />
            </div>
            <div className="mt-4">
              <FlagList flags={asset.risk_flags} />
              <p className="mt-2 text-xs text-slate-500">Neden: {asset.risk_flags[0] || asset.action_label || "Detayda açıklama var"}</p>
            </div>
          </Link>
        ))}
      </div>
    </>
  );
}

function CoinAvatar({ asset }: { asset: AssetListItem }) {
  return asset.image_url ? (
    <img src={asset.image_url} alt="" className="h-9 w-9 rounded-full bg-white/10" />
  ) : (
    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-cyan-400/10 text-xs font-semibold text-cyan-200">
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
