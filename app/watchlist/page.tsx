import { Suspense } from "react";
import { Shell } from "../components/Shell";
import { WatchlistClient } from "./WatchlistClient";

export const dynamic = "force-dynamic";

export default function WatchlistPage() {
  return (
    <Shell>
      <Suspense fallback={<div className="h-64 animate-pulse rounded-lg bg-white/[0.05]" />}>
        <WatchlistClient />
      </Suspense>
    </Shell>
  );
}
