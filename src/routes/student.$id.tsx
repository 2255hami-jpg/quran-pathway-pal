import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { useStudent, progressOf, formatDate } from "@/lib/students-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, FileText, Pin, Check, X, Clock, Trash2 } from "lucide-react";
import { toast } from "sonner";

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
  const { student, ready, setAttendance, removeAttendance } = useStudent(id);
  const [attDate, setAttDate] = useState<string>(() => new Date().toISOString().slice(0, 10));

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
    const att = student.attendance || [];
    const present = att.filter((a) => a.status === "present").length;
    const absent = att.filter((a) => a.status === "absent").length;
    const excused = att.filter((a) => a.status === "excused").length;
    const today = formatDate(new Date().toISOString());

    const circSize = 160;
    const circR = 68;
    const circC = 2 * Math.PI * circR;
    const circOffset = circC - (pct / 100) * circC;

    const listGrid = (items: string[]) =>
      items.length
        ? `<div class="grid">${items.map((s) => `<div class="chip">${s}</div>`).join("")}</div>`
        : `<div class="empty">— لا يوجد —</div>`;

    const section = (icon: string, title: string, body: string, accent = "green") => `
      <section class="section ${accent}">
        <div class="section-head"><span class="ico">${icon}</span><h2>${title}</h2></div>
        <div class="section-body">${body}</div>
      </section>`;

    const html = `<!DOCTYPE html><html lang="ar" dir="rtl"><head><meta charset="utf-8">
<title>تقرير ${student.fullName}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Amiri:wght@700&family=Cairo:wght@400;600;700;800&display=swap" rel="stylesheet">
<style>
  *{box-sizing:border-box;margin:0;padding:0}
  @page{size:A4;margin:0}
  html,body{font-family:'Cairo',system-ui,sans-serif;color:#1a2e1f;background:#f5f3ee;-webkit-print-color-adjust:exact;print-color-adjust:exact}
  .page{width:210mm;min-height:297mm;margin:0 auto;background:#fff;padding:0 0 28mm 0;position:relative;overflow:hidden}
  .ornament{position:absolute;width:300px;height:300px;border-radius:50%;background:radial-gradient(circle,rgba(212,175,55,.18),transparent 70%);pointer-events:none}
  .ornament.tr{top:-120px;left:-120px}
  .ornament.bl{bottom:-120px;right:-120px;background:radial-gradient(circle,rgba(27,94,32,.15),transparent 70%)}
  header.hero{background:linear-gradient(135deg,#0f3d18 0%,#1B5E20 55%,#2E7D32 100%);color:#fff;padding:34px 40px 28px;position:relative;overflow:hidden}
  header.hero::before{content:"";position:absolute;inset:0;background-image:radial-gradient(circle at 20% 30%,rgba(212,175,55,.18) 0,transparent 40%),radial-gradient(circle at 80% 70%,rgba(255,255,255,.08) 0,transparent 40%)}
  .brand{display:flex;align-items:center;gap:12px;font-size:13px;opacity:.9;letter-spacing:1px;position:relative}
  .brand .dot{width:8px;height:8px;background:#D4AF37;border-radius:50%}
  h1.title{font-family:'Amiri',serif;font-size:38px;margin-top:10px;font-weight:700;position:relative}
  .subtitle{margin-top:6px;font-size:14px;opacity:.85;position:relative}
  .date-badge{position:absolute;top:30px;left:40px;background:rgba(255,255,255,.15);padding:8px 14px;border-radius:999px;font-size:12px;border:1px solid rgba(255,255,255,.25)}
  .top{display:grid;grid-template-columns:1.3fr 1fr;gap:20px;padding:24px 32px 8px;align-items:stretch}
  .profile{background:#fff;border:1px solid #e8e3d6;border-radius:18px;padding:20px 22px;box-shadow:0 4px 14px rgba(27,94,32,.06)}
  .profile h3{font-size:13px;color:#1B5E20;letter-spacing:1.5px;margin-bottom:14px;font-weight:700}
  .row{display:flex;justify-content:space-between;align-items:center;padding:9px 0;border-bottom:1px dashed #e8e3d6;font-size:13.5px}
  .row:last-child{border-bottom:0}
  .row .k{color:#6b7568;font-weight:600}
  .row .v{color:#1a2e1f;font-weight:700}
  .progress-card{background:linear-gradient(160deg,#1B5E20,#0f3d18);color:#fff;border-radius:18px;padding:18px;display:flex;flex-direction:column;align-items:center;justify-content:center;position:relative;overflow:hidden;box-shadow:0 8px 20px rgba(27,94,32,.25)}
  .progress-card::before{content:"";position:absolute;inset:0;background:radial-gradient(circle at center,rgba(212,175,55,.15),transparent 60%)}
  .progress-card h3{font-size:12px;letter-spacing:2px;opacity:.85;margin-bottom:10px;position:relative}
  .ring-wrap{position:relative;width:${circSize}px;height:${circSize}px}
  .ring-wrap svg{transform:rotate(-90deg)}
  .ring-wrap .center{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center}
  .ring-wrap .pct{font-size:34px;font-weight:800;color:#fff}
  .ring-wrap .lbl{font-size:10px;opacity:.8;letter-spacing:1.5px;margin-top:2px}
  .stats-row{display:flex;gap:16px;margin-top:14px;font-size:12px;position:relative}
  .stats-row span b{color:#D4AF37;font-size:15px;font-weight:800}
  .section{margin:18px 32px;border:1px solid #e8e3d6;border-radius:16px;overflow:hidden;background:#fff;box-shadow:0 2px 8px rgba(0,0,0,.03);page-break-inside:avoid}
  .section-head{display:flex;align-items:center;gap:10px;padding:12px 18px;border-bottom:1px solid #e8e3d6}
  .section.green .section-head{background:linear-gradient(90deg,rgba(27,94,32,.08),transparent)}
  .section.amber .section-head{background:linear-gradient(90deg,rgba(212,175,55,.15),transparent)}
  .section-head .ico{font-size:18px}
  .section-head h2{font-size:14px;font-weight:700;letter-spacing:.5px}
  .section.green .section-head h2{color:#1B5E20}
  .section.amber .section-head h2{color:#8a6d1a}
  .section-body{padding:14px 18px}
  .grid{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}
  .chip{background:#f5f3ee;border:1px solid #e8e3d6;border-radius:10px;padding:8px 12px;font-size:12.5px;font-weight:600;text-align:center}
  .section.green .chip{border-color:rgba(27,94,32,.2);background:rgba(27,94,32,.05);color:#1B5E20}
  .section.amber .chip{border-color:rgba(212,175,55,.35);background:rgba(212,175,55,.08);color:#7a5d10}
  .empty{color:#9aa395;font-style:italic;font-size:13px;text-align:center;padding:8px}
  .att-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-bottom:12px}
  .att-card{border-radius:12px;padding:14px;text-align:center;color:#fff}
  .att-card .n{font-size:26px;font-weight:800}
  .att-card .l{font-size:11px;opacity:.9;letter-spacing:1.5px;margin-top:2px}
  .att-card.p{background:linear-gradient(135deg,#1B5E20,#2E7D32)}
  .att-card.a{background:linear-gradient(135deg,#8b2e2e,#b53838)}
  .att-card.e{background:linear-gradient(135deg,#b8862b,#D4AF37)}
  .att-list{display:grid;grid-template-columns:1fr 1fr;gap:6px;font-size:12px}
  .att-row{display:flex;justify-content:space-between;padding:6px 10px;border:1px solid #e8e3d6;border-radius:8px;background:#fafaf6}
  .notes{background:#fffbea;border:1px solid #f0e4b8;border-radius:12px;padding:14px;font-size:13px;color:#5a4a18;line-height:1.7}
  footer{position:absolute;bottom:0;left:0;right:0;padding:14px 32px;background:linear-gradient(135deg,#0f3d18,#1B5E20);color:#fff;display:flex;justify-content:space-between;align-items:center;font-size:11px}
  footer .star{color:#D4AF37}
  @media print{body{background:#fff}.page{box-shadow:none;margin:0}.no-print{display:none!important}}
  .print-bar{position:fixed;top:12px;left:12px;z-index:10}
  .print-bar button{background:#1B5E20;color:#fff;border:0;padding:10px 18px;border-radius:999px;font-family:'Cairo',sans-serif;font-weight:700;cursor:pointer;box-shadow:0 4px 12px rgba(27,94,32,.3)}
</style></head><body>
<div class="print-bar no-print"><button onclick="window.print()">🖨️ طباعة / حفظ PDF</button></div>
<div class="page">
  <div class="ornament tr"></div>
  <div class="ornament bl"></div>
  <header class="hero">
    <div class="date-badge">📅 ${today}</div>
    <div class="brand"><span class="dot"></span><span>تطبيق طلاب القرآن الكريم</span></div>
    <h1 class="title">تقرير متابعة الحفظ</h1>
    <div class="subtitle">بسم الله الرحمن الرحيم — تقرير مفصل لمسيرة الطالب في حفظ كتاب الله</div>
  </header>
  <div class="top">
    <div class="profile">
      <h3>◆ بيانات الطالب</h3>
      <div class="row"><span class="k">الاسم</span><span class="v">${student.fullName}</span></div>
      <div class="row"><span class="k">الهاتف</span><span class="v" dir="ltr">${student.phone || "—"}</span></div>
      ${student.email ? `<div class="row"><span class="k">البريد</span><span class="v" dir="ltr" style="font-size:12px">${student.email}</span></div>` : ""}
      <div class="row"><span class="k">تاريخ الدخول</span><span class="v">${formatDate(student.entryDate || student.createdAt)}</span></div>
      ${student.presentationDate ? `<div class="row"><span class="k">تاريخ العرض</span><span class="v">${formatDate(student.presentationDate)}</span></div>` : ""}
      <div class="row"><span class="k">آخر مراجعة</span><span class="v">${formatDate(student.lastReviewAt)}</span></div>
    </div>
    <div class="progress-card">
      <h3>نسبة الحفظ</h3>
      <div class="ring-wrap">
        <svg width="${circSize}" height="${circSize}">
          <circle cx="${circSize / 2}" cy="${circSize / 2}" r="${circR}" fill="none" stroke="rgba(255,255,255,.18)" stroke-width="12"/>
          <circle cx="${circSize / 2}" cy="${circSize / 2}" r="${circR}" fill="none" stroke="#D4AF37" stroke-width="12" stroke-linecap="round" stroke-dasharray="${circC}" stroke-dashoffset="${circOffset}"/>
        </svg>
        <div class="center"><div class="pct">${pct}%</div><div class="lbl">من القرآن</div></div>
      </div>
      <div class="stats-row">
        <span>الصفحات <b>${student.pages}/604</b></span>
        <span>الأحزاب <b>${student.hizb}/60</b></span>
      </div>
    </div>
  </div>
  ${section("✅", "السور المحفوظة", listGrid(student.memorizedSurahs), "green")}
  ${section("📌", "السور المتوقعة", listGrid(student.expectedSurahs), "amber")}
  ${student.memorizedMutun?.length ? section("📜", "المتون المحفوظة", listGrid(student.memorizedMutun), "green") : ""}
  ${student.memorizedHadith?.length ? section("📚", "الأحاديث المحفوظة", listGrid(student.memorizedHadith), "green") : ""}
  ${student.tajweedRules?.length ? section("🎙️", "أحكام التلاوة المتقنة", listGrid(student.tajweedRules), "amber") : ""}
  ${section("🗓️", "سجل الحضور والغياب", `
    <div class="att-grid">
      <div class="att-card p"><div class="n">${present}</div><div class="l">حضور</div></div>
      <div class="att-card a"><div class="n">${absent}</div><div class="l">غياب</div></div>
      <div class="att-card e"><div class="n">${excused}</div><div class="l">بعذر</div></div>
    </div>
    ${att.length ? `<div class="att-list">${att.slice(0, 20).map((a) => `<div class="att-row"><span dir="ltr">${a.date}</span><b style="color:${a.status === "present" ? "#1B5E20" : a.status === "absent" ? "#b53838" : "#b8862b"}">${a.status === "present" ? "حضور" : a.status === "absent" ? "غياب" : "بعذر"}</b></div>`).join("")}</div>` : `<div class="empty">— لا توجد سجلات —</div>`}
  `, "green")}
  ${student.notes ? `<section class="section amber"><div class="section-head"><span class="ico">📝</span><h2>ملاحظات</h2></div><div class="section-body"><div class="notes">${student.notes.replace(/\n/g, "<br>")}</div></div></section>` : ""}
  <footer>
    <div><span class="star">✦</span> تقرير صادر بتاريخ ${today} <span class="star">✦</span></div>
    <div>﴾ وَرَتِّلِ الْقُرْآنَ تَرْتِيلًا ﴿</div>
  </footer>
</div>
</body></html>`;

    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(html);
    w.document.close();
  }

  function sendEmail() {
    if (!student?.email) return;
    const subject = `تقرير الطالب: ${student.fullName}`;
    const lines = [
      `السلام عليكم ورحمة الله وبركاته`,
      ``,
      `تقرير متابعة حفظ القرآن للطالب: ${student.fullName}`,
      `📞 الهاتف: ${student.phone || "—"}`,
      `📅 تاريخ الدخول: ${formatDate(student.entryDate || student.createdAt)}`,
      student.presentationDate ? `🎤 تاريخ العرض: ${formatDate(student.presentationDate)}` : "",
      `📖 الصفحات: ${student.pages} / 604`,
      `📕 الأحزاب: ${student.hizb}`,
      `📊 نسبة الحفظ: ${pct}%`,
      ``,
      `✅ السور المحفوظة:`,
      ...(student.memorizedSurahs.length ? student.memorizedSurahs.map((s) => `- ${s}`) : ["—"]),
      ``,
      `📌 السور المتوقعة:`,
      ...(student.expectedSurahs.length ? student.expectedSurahs.map((s) => `- ${s}`) : ["—"]),
      student.notes ? `\nملاحظات: ${student.notes}` : "",
      ``,
      `ملاحظة: يُرجى إرفاق ملف التقرير PDF يدوياً بعد تصديره من التطبيق.`,
    ].filter(Boolean);
    const body = lines.join("\n");
    const href = `mailto:${encodeURIComponent(student.email)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = href;
    toast.success("تم فتح تطبيق البريد");
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
        {student.email && (
          <div className="mt-1 text-sm text-muted-foreground">
            ✉️ البريد:{" "}
            <button
              onClick={sendEmail}
              className="text-primary font-semibold tracking-wide underline-offset-2 hover:underline"
              dir="ltr"
            >
              {student.email}
            </button>
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

      <Section title="📜 المتون المحفوظة" tone="green">
        <ListOrDash items={student.memorizedMutun} />
      </Section>

      <Section title="📚 الأحاديث المحفوظة" tone="green">
        <ListOrDash items={student.memorizedHadith} />
      </Section>

      <Section title="🎙️ أحكام التلاوة" tone="amber">
        <ListOrDash items={student.tajweedRules} />
      </Section>

      {/* Attendance */}
      <section
        className="mx-4 mt-4 rounded-2xl p-4"
        style={{ background: "var(--brand-stats)", boxShadow: "var(--shadow-card)" }}
      >
        <h4 className="mb-3 text-base font-bold text-foreground">🗓️ الحضور والغياب</h4>

        {(() => {
          const att = student.attendance || [];
          const present = att.filter((a) => a.status === "present").length;
          const absent = att.filter((a) => a.status === "absent").length;
          const excused = att.filter((a) => a.status === "excused").length;
          return (
            <div className="mb-3 grid grid-cols-3 gap-2 text-center text-xs">
              <div className="rounded-xl bg-card p-2">
                <div className="text-lg font-extrabold text-primary">{present}</div>
                <div className="text-muted-foreground">حضور</div>
              </div>
              <div className="rounded-xl bg-card p-2">
                <div className="text-lg font-extrabold text-destructive">{absent}</div>
                <div className="text-muted-foreground">غياب</div>
              </div>
              <div className="rounded-xl bg-card p-2">
                <div className="text-lg font-extrabold" style={{ color: "var(--brand-fab)" }}>{excused}</div>
                <div className="text-muted-foreground">بعذر</div>
              </div>
            </div>
          );
        })()}

        <div className="flex flex-wrap items-center gap-2">
          <Input
            type="date"
            value={attDate}
            onChange={(e) => setAttDate(e.target.value)}
            className="h-10 w-auto flex-1"
            dir="ltr"
          />
          <Button
            size="sm"
            onClick={() => {
              setAttendance(attDate, "present");
              toast.success("تم تسجيل الحضور");
            }}
            className="gap-1 bg-primary"
          >
            <Check className="h-4 w-4" /> حضور
          </Button>
          <Button
            size="sm"
            variant="destructive"
            onClick={() => {
              setAttendance(attDate, "absent");
              toast.success("تم تسجيل الغياب");
            }}
            className="gap-1"
          >
            <X className="h-4 w-4" /> غياب
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setAttendance(attDate, "excused");
              toast.success("تم تسجيل غياب بعذر");
            }}
            className="gap-1"
          >
            <Clock className="h-4 w-4" /> بعذر
          </Button>
        </div>

        {(student.attendance || []).length > 0 && (
          <ul className="mt-3 max-h-60 space-y-1.5 overflow-auto">
            {student.attendance.map((a) => (
              <li
                key={a.date}
                className="flex items-center justify-between rounded-lg bg-card px-3 py-2 text-sm"
              >
                <span dir="ltr" className="font-mono text-xs text-muted-foreground">{a.date}</span>
                <span
                  className={
                    a.status === "present"
                      ? "text-primary font-semibold"
                      : a.status === "absent"
                      ? "text-destructive font-semibold"
                      : "font-semibold"
                  }
                  style={a.status === "excused" ? { color: "var(--brand-fab)" } : undefined}
                >
                  {a.status === "present" ? "حضور" : a.status === "absent" ? "غياب" : "بعذر"}
                </span>
                <button
                  onClick={() => removeAttendance(a.date)}
                  aria-label="حذف"
                  className="text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>



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

function ListOrDash({ items }: { items?: string[] }) {
  if (!items || items.length === 0) {
    return <p className="text-sm text-muted-foreground">—</p>;
  }
  return (
    <ul className="space-y-1.5">
      {items.map((s, i) => (
        <li key={i} className="flex items-center gap-2 text-foreground">
          <span className="h-1.5 w-1.5 rounded-full bg-primary" />
          {s}
        </li>
      ))}
    </ul>
  );
}
