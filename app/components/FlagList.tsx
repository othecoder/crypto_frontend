export function FlagList({ flags, limit = 3 }: { flags: string[]; limit?: number }) {
  const visible = flags.slice(0, limit);
  const rest = flags.length - visible.length;

  if (!flags.length) {
    return <span className="text-xs text-slate-500">Bayrak yok</span>;
  }

  return (
    <div className="flex flex-wrap gap-1.5">
      {visible.map((flag) => (
        <span key={flag} className="rounded-md border border-white/10 bg-white/[0.05] px-2 py-1 text-xs text-slate-300" title={flag}>
          {flag}
        </span>
      ))}
      {rest > 0 ? <span className="rounded-md border border-white/10 px-2 py-1 text-xs text-slate-400">+{rest}</span> : null}
    </div>
  );
}
