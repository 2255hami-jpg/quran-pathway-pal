import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useStudent, progressOf, formatDate } from "@/lib/students-store";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, FileText, Pin } from "lucide-react";

export const Route = createFileRoute("/student/$id")({
  head: ({ params }) => ({
    meta: [{ title: `تفاصيل الطالب - ${params.id}` }],
  }),
  component: StudentDetails,
  notFoundComponent: () => (
    <div className="p-10 text-center">الطالب غير موجود</div>
  ),
  errorComponent: ({ error }) => (
    <div className="p-10 text-center text-destructive">{String(error)}</div>
  ),
});

function StudentDetails() {
  const { id } = Route.useParams();
  const router = useRouter();
  const { student, ready } = useStudent(id);

  if (!ready) return null;
  if (!student) {
    return (
      <div className="min-h-screen bg-background p-6 text-center">
        <p className="text-muted-foreground">الطالب غير موجود</p>
        <Link to="/" className="mt-4 inline-block text-primary underline">
          الرجوع
        </Link>
      </div>
    );
  }

  const pct = Math.round(progressOf(student) * 100);

  function exportPDF() {
    if (typeof window === "undefined" || !student) return;
    const html = `<!DOCTYPE html><html lang="ar" dir="rtl"><head><meta charset="utf-8"><title>تقرير ${student.fullName}</title>
    <style>
      body{font-family:'Cairo',Arial,sans-serif;padding:32px;color:#111;}
      h1{color:#1B5E20;margin-bottom:4px;}
      .meta{color:#555;margin-bottom:16px;}
      .card{border:1px solid #ddd;border-radius:12px;padding:16px;margin:12px 0;}
      .pct{font-size:48px;color:#1B5E20;font-weight:800;text-align:center;}
      ul{margin:8px 0;padding-right:18px;}
      .label{font-weight:700;color:#1B5E20;}
    </style></head><body>
      <h1>تقرير الطالب</h1>
      <div class="meta">تاريخ الإصدار: ${formatDate(new Date().toISOString())}</div>
      <div class="card">
        <div><span class="label">الاسم:</span> ${student.fullName}</div>
        <div><span class="label">الهاتف:</span> ${student.phone || "—"}</div>
        <div><span class="label">تاريخ الدخول:</span> ${formatDate(student.entryDate || student.createdAt)}</div>
        ${student.presentationDate ? `<div><span class="label">تاريخ العرض:</span> ${formatDate(student.presentationDate)}</div>` : ""}
        <div><span class="label">آخر مراجعة:</span> ${formatDate(student.lastReviewAt)}</div>
      </div>
      <div class="card">
        <div class="pct">${pct}%</div>
        <div style="text-align:center">صفحة ${student.pages} / 604 • حزب ${student.hizb}</div>
      </div>
      <div class="card">
        <div class="label">✅ السور المحفوظة</div>
        <ul>${student.memorizedSurahs.map((s) => `<li>${s}</li>`).join("") || "<li>—</li>"}</ul>
      </div>
      <div class="card">
        <div class="label">📌 السور المتوقعة</div>
        <ul>${student.expectedSurahs.map((s) => `<li>${s}</li>`).join("") || "<li>—</li>"}</ul>
      </div>
      ${student.notes ? `<div class="card"><div class="label">ملاحظات</div><div>${student.notes}</div></div>` : ""}
    </body></html>`;
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(html);
    w.document.close();
    setTimeout(() => w.print(), 400);
  }

  const size = 220;
  const stroke = 14;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (pct / 100) * c;

  return (
    <div className="min-h-screen bg-background pb-12">
      {/* Header */}
      <header
        className="flex items-center justify-between px-5 py-4"
        style={{ background: "var(--brand-header)", color: "var(--brand-header-foreground)" }}
      >
        <h1 className="text-xl font-extrabold">تفاصيل الطالب</h1>
        <button
          onClick={() => router.history.back()}
          aria-label="رجوع"
          className="flex items-center gap-1 text-sm font-semibold"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
      </header>

      <div className="px-4 pt-5">
        <h2 className="text-2xl font-extrabold">👤 {student.fullName}</h2>
        <div className="mt-1 text-sm text-muted-foreground">
          📅 تاريخ التسجيل: {formatDate(student.createdAt)}
        </div>
        {student.entryDate && (
          <div className="mt-1 text-sm text-muted-foreground">
            🚪 تاريخ الدخول: {formatDate(student.entryDate)}
          </div>
        )}
        {student.presentationDate && (
          <div className="mt-1 text-sm text-muted-foreground">
            🎤 تاريخ العرض: {formatDate(student.presentationDate)}
          </div>
        )}
        {student.phone && (
          <div className="mt-1 text-sm text-muted-foreground">
            📞 الهاتف:{" "}
            <a
              href={`tel:${student.phone}`}
              className="text-primary font-semibold tracking-wide"
              dir="ltr"
            >
              {student.phone}
            </a>
          </div>
        )}
      </div>

      {/* Progress card */}
      <section
        className="mx-4 mt-5 rounded-3xl p-5"
        style={{ background: "var(--brand-stats)" }}
      >
        <h3 className="text-center text-base font-bold text-primary">📊 نسبة الحفظ</h3>
        <div className="mt-4 flex justify-center">
          <svg width={size} height={size} className="-rotate-90">
            <circle
              cx={size / 2}
              cy={size / 2}
              r={r}
              fill="none"
              stroke="oklch(0.30 0.04 80)"
              strokeWidth={stroke}
            />
            <circle
              cx={size / 2}
              cy={size / 2}
              r={r}
              fill="none"
              stroke="oklch(0.65 0.17 145)"
              strokeWidth={stroke}
              strokeLinecap="round"
              strokeDasharray={c}
              strokeDashoffset={offset}
            />
          </svg>
          <div className="absolute flex items-center justify-center" style={{ width: size, height: size }}>
            <span className="text-4xl font-extrabold text-primary">{pct}%</span>
          </div>
        </div>
        <Progress value={pct} className="mt-5 h-2 bg-muted" />
        <div className="mt-2 text-center text-sm text-foreground/80">
          {student.pages} / 604 صفحة
        </div>
      </section>

      {/* Mini stats */}
      <div className="mx-4 mt-4 grid grid-cols-2 gap-3">
        <MiniStat icon="📖" value={student.pages} label="الصفحات" />
        <MiniStat icon="📕" value={student.hizb} label="الأحزاب" />
      </div>

      {/* Memorized */}
      <Section title="✅ السور المحفوظة" tone="green">
        {student.memorizedSurahs.length === 0 ? (
          <p className="text-sm text-muted-foreground">—</p>
        ) : (
          <ul className="space-y-1.5">
            {student.memorizedSurahs.map((s, i) => (
              <li key={i} className="flex items-center gap-2 text-foreground">
                <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                {s}
              </li>
            ))}
          </ul>
        )}
      </Section>

      {/* Expected */}
      <Section title="📌 السور المتوقعة" tone="amber">
        {student.expectedSurahs.length === 0 ? (
          <p className="text-sm text-muted-foreground">—</p>
        ) : (
          <ul className="space-y-1.5">
            {student.expectedSurahs.map((s, i) => (
              <li key={i} className="flex items-center gap-2 text-foreground">
                <span className="h-1.5 w-1.5 rounded-full" style={{ background: "var(--brand-fab)" }} />
                {s}
              </li>
            ))}
          </ul>
        )}
      </Section>

      <div className="px-4 pt-5">
        <Button
          onClick={exportPDF}
          variant="outline"
          className="h-14 w-full gap-2 rounded-2xl border-border/70 text-base"
        >
          <FileText className="h-5 w-5" />
          📄 تصدير تقرير PDF
        </Button>
      </div>
    </div>
  );
}

function MiniStat({ icon, value, label }: { icon: string; value: number; label: string }) {
  return (
    <div className="rounded-2xl bg-card p-4 text-center" style={{ boxShadow: "var(--shadow-card)" }}>
      <div className="text-2xl">{icon}</div>
      <div className="mt-1 text-2xl font-extrabold tabular-nums text-foreground">{value}</div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </div>
  );
}

function Section({
  title,
  tone,
  children,
}: {
  title: string;
  tone: "green" | "amber";
  children: React.ReactNode;
}) {
  const bg =
    tone === "green"
      ? "color-mix(in oklab, var(--primary) 14%, var(--card))"
      : "var(--brand-expected)";
  return (
    <section
      className="mx-4 mt-4 rounded-2xl p-4"
      style={{ background: bg, boxShadow: "var(--shadow-card)" }}
    >
      <h4 className="mb-2 flex items-center gap-2 text-base font-bold text-foreground">
        {tone === "amber" && <Pin className="h-4 w-4" style={{ color: "var(--brand-fab)" }} />}
        {title}
      </h4>
      {children}
    </section>
  );
}
