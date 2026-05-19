import { Activity, Database, HeartPulse, Radar } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

const nav = [
  { href: "/", label: "Radar", icon: Radar },
  { href: "/watchlist", label: "Watchlist", icon: Activity },
  { href: "/status", label: "Status", icon: HeartPulse },
];

export function Shell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[#080a0f] text-slate-100">
      <header className="sticky top-0 z-30 border-b border-white/10 bg-[#080a0f]/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
          <Link href="/" className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-md border border-cyan-400/30 bg-cyan-400/10 text-cyan-200">
              <Database size={20} />
            </span>
            <span>
              <span className="block text-lg font-semibold">Crypto Low-Cap Radar</span>
              <span className="block text-sm text-slate-400">İzleme ve risk değerlendirme paneli</span>
            </span>
          </Link>
          <nav className="flex gap-2 overflow-x-auto">
            {nav.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="inline-flex items-center gap-2 rounded-md border border-white/10 px-3 py-2 text-sm text-slate-300 hover:border-cyan-300/40 hover:text-white"
                >
                  <Icon size={16} />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </header>
      <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6">{children}</main>
      <div className="mx-auto max-w-7xl px-4 pb-8 text-xs text-slate-500 sm:px-6">
        Bu sistem yatırım tavsiyesi vermez. Veriler yalnızca izleme ve risk değerlendirme amaçlıdır.
      </div>
    </div>
  );
}
