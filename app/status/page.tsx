import { Database, HeartPulse } from "lucide-react";
import { MetricCard } from "../components/MetricCard";
import { RiskBadge } from "../components/RiskBadge";
import { Shell } from "../components/Shell";
import { getHealth, sourceLabel } from "../lib/api";
import { dateTime } from "../lib/format";

export const dynamic = "force-dynamic";

export default async function StatusPage() {
  const health = await getHealth();

  return (
    <Shell>
      <div className="grid gap-4 md:grid-cols-2">
        <MetricCard label="API health" value={health.status} hint={health.timestamp ? dateTime(health.timestamp) : "-"} icon={<HeartPulse size={20} />} />
        <MetricCard label="Database" value={health.database} hint="Backend health endpoint kontrolü" icon={<Database size={20} />} />
      </div>
      <section className="mt-6 rounded-lg border border-white/10 bg-white/[0.04] p-5">
        <h1 className="text-xl font-semibold text-white">Data source status</h1>
        <div className="mt-4 grid gap-3">
          {health.sources.length ? health.sources.map((source) => (
            <div key={source.source_name} className="grid gap-3 rounded-lg border border-white/10 bg-black/20 p-4 md:grid-cols-[1fr_1fr_1fr_90px] md:items-center">
              <div>
                <p className="font-semibold text-white">{source.source_name}</p>
                <p className="text-xs text-slate-500">Son hata: {source.last_error_message || "-"}</p>
              </div>
              <p className="text-sm text-slate-300">Başarılı: {dateTime(source.last_success_at)}</p>
              <p className="text-sm text-slate-300">Hata: {dateTime(source.last_failed_at)} · {source.failure_count}</p>
              <RiskBadge value={sourceLabel(source)} />
            </div>
          )) : (
            <div className="rounded-lg border border-white/10 bg-black/20 p-6 text-sm text-slate-400">Henüz kaynak durumu yok. Sync komutları çalışınca burada görünecek.</div>
          )}
        </div>
      </section>
    </Shell>
  );
}
