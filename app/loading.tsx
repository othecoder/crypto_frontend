import { Shell } from "./components/Shell";

export default function Loading() {
  return (
    <Shell>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[0, 1, 2, 3].map((item) => <div key={item} className="h-28 animate-pulse rounded-lg border border-white/10 bg-white/[0.04]" />)}
      </div>
      <div className="mt-6 h-96 animate-pulse rounded-lg border border-white/10 bg-white/[0.04]" />
    </Shell>
  );
}
