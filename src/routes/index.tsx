import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  useStudents,
  progressOf,
  formatArabicDate,
  exportBackupCSV,
  type Student,
} from "@/lib/students-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import {
  BookOpen,
  Plus,
  Search,
  Phone,
  Calendar,
  CheckCircle2,
  Trash2,
  Pencil,
  Download,
  Users,
  TrendingUp,
} from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "إدارة طلاب القرآن" },
      { name: "description", content: "تطبيق لإدارة طلاب حلقات تحفيظ القرآن الكريم" },
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
};

const emptyForm: FormState = { fullName: "", phone: "", pages: "0", hizb: "1", notes: "" };

function Index() {
  const { students, ready, add, update, remove, markReviewed } = useStudents();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Student | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);

  const filtered = useMemo(() => {
    const q = query.trim();
    if (!q) return students;
    return students.filter(
      (s) => s.fullName.includes(q) || s.phone.includes(q)
    );
  }, [students, query]);

  const stats = useMemo(() => {
    const totalPages = students.reduce((acc, s) => acc + s.pages, 0);
    const avg = students.length
      ? Math.round((students.reduce((a, s) => a + progressOf(s), 0) / students.length) * 100)
      : 0;
    return { count: students.length, totalPages, avg };
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
    });
    setOpen(true);
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
      hizb: Math.max(1, Math.min(60, parseInt(form.hizb || "1", 10) || 1)),
      notes: form.notes.trim(),
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
      toast.error("لا يوجد طلاب للتصدير");
      return;
    }
    const csv = exportBackupCSV(students);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `students-backup-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("تم تصدير النسخة الاحتياطية");
  }

  return (
    <div className="min-h-screen pb-24">
      <Toaster position="top-center" richColors />

      {/* Header */}
      <header
        className="text-primary-foreground shadow-[var(--shadow-elegant)]"
        style={{ background: "var(--gradient-primary)" }}
      >
        <div className="mx-auto max-w-5xl px-4 py-6 sm:py-8">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-white/15 p-3 backdrop-blur-sm">
              <BookOpen className="h-7 w-7" />
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold sm:text-3xl" style={{ fontFamily: "Amiri, serif" }}>
                إدارة طلاب القرآن
              </h1>
              <p className="mt-1 text-sm text-white/80">
                حلقات تحفيظ القرآن الكريم
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-6 grid grid-cols-3 gap-3">
            <StatPill icon={<Users className="h-4 w-4" />} label="الطلاب" value={String(stats.count)} />
            <StatPill icon={<BookOpen className="h-4 w-4" />} label="مجموع الصفحات" value={String(stats.totalPages)} />
            <StatPill icon={<TrendingUp className="h-4 w-4" />} label="متوسط الإتمام" value={`${stats.avg}%`} />
          </div>
        </div>
      </header>

      {/* Toolbar */}
      <div className="mx-auto max-w-5xl px-4 pt-5">
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="ابحث بالاسم أو رقم الهاتف..."
              className="h-11 pr-9 text-base"
            />
          </div>
          <Button variant="outline" onClick={handleExport} className="h-11 gap-2">
            <Download className="h-4 w-4" />
            تصدير
          </Button>
          <Button onClick={openAdd} className="h-11 gap-2">
            <Plus className="h-4 w-4" />
            طالب جديد
          </Button>
        </div>
      </div>

      {/* List */}
      <main className="mx-auto mt-5 grid max-w-5xl gap-4 px-4 sm:grid-cols-2">
        {!ready ? null : filtered.length === 0 ? (
          <EmptyState onAdd={openAdd} hasQuery={!!query} />
        ) : (
          filtered.map((s) => (
            <StudentCard
              key={s.id}
              student={s}
              onEdit={() => openEdit(s)}
              onDelete={() => {
                remove(s.id);
                toast.success("تم حذف الطالب");
              }}
              onReview={() => {
                markReviewed(s.id);
                toast.success("تم تسجيل المراجعة");
              }}
            />
          ))
        )}
      </main>

      {/* Add/Edit dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent dir="rtl" className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-right">
              {editing ? "تعديل بيانات الطالب" : "إضافة طالب جديد"}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid gap-2">
              <Label htmlFor="name">الاسم الكامل *</Label>
              <Input
                id="name"
                value={form.fullName}
                onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                placeholder="مثال: محمد عبدالله"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="phone">رقم الهاتف</Label>
              <Input
                id="phone"
                type="tel"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="05xxxxxxxx"
                dir="ltr"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-2">
                <Label htmlFor="pages">الصفحات المحفوظة</Label>
                <Input
                  id="pages"
                  type="number"
                  min="0"
                  max="604"
                  value={form.pages}
                  onChange={(e) => setForm({ ...form, pages: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="hizb">الحزب الحالي</Label>
                <Input
                  id="hizb"
                  type="number"
                  min="1"
                  max="60"
                  value={form.hizb}
                  onChange={(e) => setForm({ ...form, hizb: e.target.value })}
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="notes">ملاحظات</Label>
              <Textarea
                id="notes"
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                placeholder="نقاط القوة، الأخطاء المتكررة..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              إلغاء
            </Button>
            <Button onClick={submit}>
              {editing ? "حفظ التغييرات" : "إضافة"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function StatPill({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-white/15 px-3 py-3 backdrop-blur-sm">
      <div className="flex items-center gap-1.5 text-xs text-white/80">
        {icon}
        <span>{label}</span>
      </div>
      <div className="mt-1 text-xl font-bold tabular-nums">{value}</div>
    </div>
  );
}

function StudentCard({
  student,
  onEdit,
  onDelete,
  onReview,
}: {
  student: Student;
  onEdit: () => void;
  onDelete: () => void;
  onReview: () => void;
}) {
  const pct = Math.round(progressOf(student) * 100);
  return (
    <Card
      className="overflow-hidden border-border/60 transition hover:shadow-[var(--shadow-card)]"
      style={{ boxShadow: "var(--shadow-card)" }}
    >
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <h3 className="truncate text-lg font-bold text-foreground">{student.fullName}</h3>
            <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              <Badge variant="secondary" className="gap-1">
                <BookOpen className="h-3 w-3" />
                الحزب {student.hizb}
              </Badge>
              <Badge variant="outline">{student.pages} / 604 صفحة</Badge>
            </div>
          </div>
          <div className="flex flex-col items-center justify-center rounded-xl bg-primary/10 px-3 py-2 text-primary">
            <div className="text-xl font-bold tabular-nums">{pct}%</div>
            <div className="text-[10px]">إتمام</div>
          </div>
        </div>

        <div className="mt-3">
          <Progress value={pct} className="h-2" />
        </div>

        <dl className="mt-4 grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
          {student.phone && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Phone className="h-3.5 w-3.5 text-primary" />
              <a href={`tel:${student.phone}`} dir="ltr" className="hover:text-primary">
                {student.phone}
              </a>
            </div>
          )}
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="h-3.5 w-3.5 text-primary" />
            <span>تسجيل: {formatArabicDate(student.createdAt)}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground sm:col-span-2">
            <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
            <span>آخر مراجعة: {formatArabicDate(student.lastReviewAt)}</span>
          </div>
        </dl>

        {student.notes && (
          <p className="mt-3 rounded-lg bg-muted/60 p-2 text-xs text-muted-foreground">
            {student.notes}
          </p>
        )}

        <div className="mt-4 flex flex-wrap gap-2">
          <Button size="sm" variant="default" onClick={onReview} className="gap-1.5">
            <CheckCircle2 className="h-4 w-4" />
            سجل مراجعة
          </Button>
          <Button size="sm" variant="outline" onClick={onEdit} className="gap-1.5">
            <Pencil className="h-4 w-4" />
            تعديل
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button size="sm" variant="ghost" className="gap-1.5 text-destructive hover:text-destructive">
                <Trash2 className="h-4 w-4" />
                حذف
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent dir="rtl">
              <AlertDialogHeader>
                <AlertDialogTitle className="text-right">حذف الطالب؟</AlertDialogTitle>
                <AlertDialogDescription className="text-right">
                  سيتم حذف بيانات «{student.fullName}» نهائياً. لا يمكن التراجع.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter className="gap-2">
                <AlertDialogCancel>إلغاء</AlertDialogCancel>
                <AlertDialogAction
                  onClick={onDelete}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  حذف
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardContent>
    </Card>
  );
}

function EmptyState({ onAdd, hasQuery }: { onAdd: () => void; hasQuery: boolean }) {
  return (
    <div className="col-span-full">
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-14 text-center">
          <div className="rounded-full bg-primary/10 p-4 text-primary">
            <BookOpen className="h-8 w-8" />
          </div>
          <h3 className="mt-4 text-lg font-semibold">
            {hasQuery ? "لا توجد نتائج" : "لا يوجد طلاب بعد"}
          </h3>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">
            {hasQuery
              ? "جرّب البحث باسم أو رقم آخر."
              : "ابدأ بإضافة أول طالب في حلقتك وتابع تقدمه في حفظ كتاب الله."}
          </p>
          {!hasQuery && (
            <Button onClick={onAdd} className="mt-5 gap-2">
              <Plus className="h-4 w-4" />
              إضافة طالب
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
