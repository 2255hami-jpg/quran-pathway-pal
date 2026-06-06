import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  useStudents,
  progressOf,
  formatDate,
  exportBackupCSV,
  type Student,
} from "@/lib/students-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";
import { Trash2, Plus, Download } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "طلاب القرآن" },
      { name: "description", content: "إدارة طلاب حلقات تحفيظ القرآن الكريم" },
    ],
  }),
  component: Index,
});

type FormState = {
  fullName: string;
  phone: string;
  pages: string;
  hizb: string;
  notes: string;
  memorizedSurahs: string;
  expectedSurahs: string;
};

const emptyForm: FormState = {
  fullName: "",
  phone: "",
  pages: "0",
  hizb: "1",
  notes: "",
  memorizedSurahs: "",
  expectedSurahs: "",
};

function Index() {
  const { students, ready, add, update, remove } = useStudents();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Student | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);

  const filtered = useMemo(() => {
    const q = query.trim();
    if (!q) return students;
    return students.filter((s) => s.fullName.includes(q) || s.phone.includes(q));
  }, [students, query]);

  const stats = useMemo(() => {
    const totalPages = students.reduce((a, s) => a + s.pages, 0);
    const totalHizb = students.reduce((a, s) => a + s.hizb, 0);
    const best = students.reduce<Student | null>(
      (b, s) => (!b || s.pages > b.pages ? s : b),
      null
    );
    return { count: students.length, totalPages, totalHizb, best };
  }, [students]);

  function openAdd() {
    setEditing(null);
    setForm(emptyForm);
    setOpen(true);
  }
  function openEdit(s: Student) {
    setEditing(s);
    setForm({
      fullName: s.fullName,
      phone: s.phone,
      pages: String(s.pages),
      hizb: String(s.hizb),
      notes: s.notes,
      memorizedSurahs: s.memorizedSurahs.join("، "),
      expectedSurahs: s.expectedSurahs.join("، "),
    });
    setOpen(true);
  }

  function parseList(v: string) {
    return v
      .split(/[،,\n]/)
      .map((x) => x.trim())
      .filter(Boolean);
  }

  function submit() {
    if (!form.fullName.trim()) {
      toast.error("الاسم مطلوب");
      return;
    }
    const data = {
      fullName: form.fullName.trim(),
      phone: form.phone.trim(),
      pages: Math.max(0, parseInt(form.pages || "0", 10) || 0),
      totalPages: 604,
      hizb: Math.max(0, Math.min(60, parseInt(form.hizb || "0", 10) || 0)),
      notes: form.notes.trim(),
      memorizedSurahs: parseList(form.memorizedSurahs),
      expectedSurahs: parseList(form.expectedSurahs),
    };
    if (editing) {
      update(editing.id, data);
      toast.success("تم تحديث بيانات الطالب");
    } else {
      add(data);
      toast.success("تمت إضافة الطالب");
    }
    setOpen(false);
  }

  function handleExport() {
    if (!students.length) {
      toast.error("لا يوجد طلاب");
      return;
    }
    const csv = exportBackupCSV(students);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `students-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="min-h-screen bg-background pb-32">
      <Toaster position="top-center" richColors theme="dark" />

      {/* Green header */}
      <header
        className="px-5 py-5"
        style={{
          background: "var(--brand-header)",
          color: "var(--brand-header-foreground)",
        }}
      >
        <h1 className="text-2xl font-extrabold">📚 طلاب القرآن 📚</h1>
      </header>

      {/* Search */}
      <div className="px-4 pt-5">
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="🔍 ابحث عن طالب..."
          className="h-14 rounded-2xl border-border/70 bg-card text-base"
        />
      </div>

      {/* Stats card */}
      <section className="mx-4 mt-4 rounded-3xl p-5" style={{ background: "var(--brand-stats)" }}>
        <h2 className="text-lg font-bold text-primary">📊 إحصائيات عامة</h2>
        <div className="mt-4 grid grid-cols-3 text-center">
          <StatCol icon="👤" value={stats.count} label="الطلاب" />
          <StatCol icon="📖" value={stats.totalPages} label="الصفحات" />
          <StatCol icon="📈" value={stats.totalHizb} label="الأحزاب" />
        </div>
        {stats.best && (
          <div className="mt-4 text-center text-base font-semibold text-foreground/90">
            الأفضل: {stats.best.fullName} 🏆
          </div>
        )}
        <div className="mt-4 flex justify-center">
          <Button
            variant="ghost"
            onClick={handleExport}
            className="h-9 gap-2 text-xs text-foreground/80 hover:text-foreground"
          >
            <Download className="h-3.5 w-3.5" />
            تصدير CSV
          </Button>
        </div>
      </section>

      {/* List title */}
      <h3 className="px-4 pt-6 pb-3 text-lg font-bold">📋 قائمة الطلاب</h3>

      <main className="space-y-3 px-4">
        {!ready ? null : filtered.length === 0 ? (
          <EmptyState onAdd={openAdd} hasQuery={!!query} />
        ) : (
          filtered.map((s) => (
            <StudentRow
              key={s.id}
              student={s}
              onDelete={() => {
                remove(s.id);
                toast.success("تم حذف الطالب");
              }}
              onEdit={() => openEdit(s)}
            />
          ))
        )}
      </main>

      {/* FAB */}
      <button
        onClick={openAdd}
        aria-label="إضافة طالب"
        className="fixed bottom-6 left-6 z-30 flex h-16 w-16 items-center justify-center rounded-2xl shadow-[var(--shadow-elegant)] transition active:scale-95"
        style={{
          background: "var(--brand-fab)",
          color: "var(--brand-fab-foreground)",
        }}
      >
        <Plus className="h-8 w-8" strokeWidth={3} />
      </button>

      {/* Add/Edit dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent dir="rtl" className="max-h-[90vh] overflow-y-auto sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-right">
              {editing ? "تعديل بيانات الطالب" : "إضافة طالب جديد"}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-3 py-2">
            <Field label="الاسم الكامل *">
              <Input
                value={form.fullName}
                onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                placeholder="محمود حميس"
              />
            </Field>
            <Field label="رقم الهاتف">
              <Input
                type="tel"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="05xxxxxxxx"
                dir="ltr"
              />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="الصفحات">
                <Input
                  type="number"
                  min="0"
                  max="604"
                  value={form.pages}
                  onChange={(e) => setForm({ ...form, pages: e.target.value })}
                />
              </Field>
              <Field label="الأحزاب">
                <Input
                  type="number"
                  min="0"
                  max="60"
                  value={form.hizb}
                  onChange={(e) => setForm({ ...form, hizb: e.target.value })}
                />
              </Field>
            </div>
            <Field label="السور المحفوظة (افصل بفاصلة)">
              <Textarea
                rows={2}
                value={form.memorizedSurahs}
                onChange={(e) => setForm({ ...form, memorizedSurahs: e.target.value })}
                placeholder="الفاتحة، البقرة"
              />
            </Field>
            <Field label="السور المتوقعة">
              <Textarea
                rows={2}
                value={form.expectedSurahs}
                onChange={(e) => setForm({ ...form, expectedSurahs: e.target.value })}
                placeholder="آل عمران"
              />
            </Field>
            <Field label="ملاحظات">
              <Textarea
                rows={2}
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
              />
            </Field>
          </div>
          <DialogFooter className="gap-2 sm:gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              إلغاء
            </Button>
            <Button onClick={submit}>{editing ? "حفظ" : "إضافة"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-1.5">
      <Label className="text-sm">{label}</Label>
      {children}
    </div>
  );
}

function StatCol({ icon, value, label }: { icon: string; value: number; label: string }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="text-xl text-primary">{icon}</div>
      <div className="text-2xl font-extrabold tabular-nums text-foreground">{value}</div>
      <div className="text-xs text-foreground/70">{label}</div>
    </div>
  );
}

function StudentRow({
  student,
  onDelete,
  onEdit,
}: {
  student: Student;
  onDelete: () => void;
  onEdit: () => void;
}) {
  const pct = Math.round(progressOf(student) * 100);
  return (
    <Link
      to="/student/$id"
      params={{ id: student.id }}
      className="block rounded-2xl bg-card p-4 transition active:scale-[0.99]"
      style={{ boxShadow: "var(--shadow-card)" }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="text-right">
          <div className="text-sm font-semibold text-primary">صفحة {student.pages}</div>
          <div className="text-sm font-semibold" style={{ color: "var(--brand-fab)" }}>
            حزب {student.hizb}
          </div>
        </div>
        <div className="min-w-0 flex-1 text-left">
          <h4 className="truncate text-lg font-bold text-foreground">{student.fullName}</h4>
          <div className="mt-1 text-xs text-muted-foreground">
            📅 {formatDate(student.createdAt)}
          </div>
        </div>
      </div>

      <Progress value={pct} className="mt-3 h-2 bg-muted" />

      <div className="mt-3 flex items-center justify-between">
        <div className="text-xs font-semibold text-primary">الحفظ: {pct}%</div>
        <AlertDialog>
          <AlertDialogTrigger asChild onClick={(e) => e.stopPropagation()}>
            <button
              onClick={(e) => e.preventDefault()}
              className="flex items-center gap-1 text-sm font-medium text-destructive"
            >
              <Trash2 className="h-4 w-4" />
              حذف
            </button>
          </AlertDialogTrigger>
          <AlertDialogContent dir="rtl" onClick={(e) => e.stopPropagation()}>
            <AlertDialogHeader>
              <AlertDialogTitle className="text-right">حذف الطالب؟</AlertDialogTitle>
              <AlertDialogDescription className="text-right">
                سيتم حذف بيانات «{student.fullName}» نهائياً.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="gap-2">
              <AlertDialogCancel>إلغاء</AlertDialogCancel>
              <AlertDialogAction
                onClick={(e) => {
                  e.preventDefault();
                  onDelete();
                }}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                حذف
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      <button
        onClick={(e) => {
          e.preventDefault();
          onEdit();
        }}
        className="mt-2 text-xs text-muted-foreground underline-offset-2 hover:underline"
      >
        تعديل
      </button>
    </Link>
  );
}

function EmptyState({ onAdd, hasQuery }: { onAdd: () => void; hasQuery: boolean }) {
  return (
    <div className="rounded-2xl border border-dashed border-border bg-card/50 p-10 text-center">
      <div className="text-4xl">📖</div>
      <p className="mt-3 text-sm text-muted-foreground">
        {hasQuery ? "لا توجد نتائج" : "ابدأ بإضافة أول طالب"}
      </p>
      {!hasQuery && (
        <Button onClick={onAdd} className="mt-4 gap-2">
          <Plus className="h-4 w-4" />
          إضافة طالب
        </Button>
      )}
    </div>
  );
}
