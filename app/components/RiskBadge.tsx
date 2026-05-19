export function RiskBadge({ value }: { value: string | null | undefined }) {
  const label = value || "Veri Yok";
  const className =
    label === "Düşük" || label === "Güçlü Aday"
      ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-200"
      : label === "Orta" || label === "İzle"
        ? "border-amber-300/30 bg-amber-300/10 text-amber-100"
        : label === "Veri Eksik" || label === "Manuel Kontrol Gerekli"
          ? "border-sky-300/30 bg-sky-300/10 text-sky-100"
          : "border-red-400/30 bg-red-400/10 text-red-100";

  return <span className={`inline-flex whitespace-nowrap rounded-md border px-2 py-1 text-xs font-medium ${className}`}>{label}</span>;
}
