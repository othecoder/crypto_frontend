import type { ReactNode } from "react";

export function MetricCard({ label, value, hint, icon }: { label: string; value: ReactNode; hint?: string; icon?: ReactNode }) {
  return (
    <section className="rounded-lg border border-white/10 bg-white/[0.04] p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm text-slate-400">{label}</p>
          <div className="mt-2 text-2xl font-semibold text-white">{value}</div>
        </div>
        {icon ? <div className="text-cyan-200">{icon}</div> : null}
      </div>
      {hint ? <p className="mt-3 text-xs text-slate-500">{hint}</p> : null}
    </section>
  );
}
