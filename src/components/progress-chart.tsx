import type { ProgressPoint } from "@/lib/students-store";

export function ProgressChart({ data }: { data: ProgressPoint[] }) {
  const width = 320;
  const height = 160;
  const padX = 28;
  const padY = 20;

  if (!data.length) {
    return (
      <p className="py-6 text-center text-sm text-muted-foreground">
        — لا توجد بيانات بعد، سيتم تسجيل التقدم تلقائياً عند تحديث الصفحات —
      </p>
    );
  }

  const maxPages = Math.max(10, ...data.map((d) => d.pages));
  const stepX = data.length > 1 ? (width - padX * 2) / (data.length - 1) : 0;
  const points = data.map((d, i) => {
    const x = padX + i * stepX;
    const y = height - padY - (d.pages / maxPages) * (height - padY * 2);
    return { x, y, ...d };
  });
  const path = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
  const area = `${path} L ${points[points.length - 1].x} ${height - padY} L ${points[0].x} ${height - padY} Z`;

  return (
    <div className="w-full overflow-x-auto">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full"
        preserveAspectRatio="none"
        style={{ maxHeight: 200 }}
      >
        <defs>
          <linearGradient id="pg-area" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="oklch(0.65 0.17 145)" stopOpacity="0.45" />
            <stop offset="100%" stopColor="oklch(0.65 0.17 145)" stopOpacity="0" />
          </linearGradient>
        </defs>
        {[0.25, 0.5, 0.75].map((r) => (
          <line
            key={r}
            x1={padX}
            x2={width - padX}
            y1={padY + (height - padY * 2) * r}
            y2={padY + (height - padY * 2) * r}
            stroke="oklch(0.35 0.01 150)"
            strokeDasharray="3 4"
            strokeWidth="1"
          />
        ))}
        <path d={area} fill="url(#pg-area)" />
        <path d={path} fill="none" stroke="oklch(0.70 0.18 145)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        {points.map((p) => (
          <g key={p.month}>
            <circle cx={p.x} cy={p.y} r="4" fill="#D4AF37" stroke="#1B5E20" strokeWidth="2" />
            <text
              x={p.x}
              y={p.y - 8}
              textAnchor="middle"
              fontSize="9"
              fill="oklch(0.85 0.02 140)"
              fontWeight="700"
            >
              {p.pages}
            </text>
            <text
              x={p.x}
              y={height - 4}
              textAnchor="middle"
              fontSize="8"
              fill="oklch(0.65 0.03 140)"
            >
              {p.month.slice(2)}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}
