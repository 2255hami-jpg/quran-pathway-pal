import { useEffect, useState, useCallback } from "react";

export type AttendanceStatus = "present" | "absent" | "excused";
export type AttendanceEntry = { date: string; status: AttendanceStatus; note?: string };

export type ProgressPoint = { month: string; pages: number };

export type Student = {
  id: string;
  fullName: string;
  phone: string;
  email?: string;
  pages: number;
  totalPages: number;
  hizb: number;
  notes: string;
  createdAt: string;
  lastReviewAt: string;
  entryDate?: string;
  presentationDate?: string;
  memorizedSurahs: string[];
  expectedSurahs: string[];
  memorizedMutun: string[];
  memorizedHadith: string[];
  tajweedRules: string[];
  attendance: AttendanceEntry[];
  progressHistory: ProgressPoint[];
};

function currentMonth() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function upsertProgress(history: ProgressPoint[] | undefined, pages: number): ProgressPoint[] {
  const m = currentMonth();
  const list = (history || []).filter((p) => p.month !== m);
  list.push({ month: m, pages });
  list.sort((a, b) => (a.month < b.month ? -1 : 1));
  return list;
}

const KEY = "quran_students_v1";

function load(): Student[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const list = JSON.parse(raw) as Student[];
    return list.map((s) => ({
      ...s,
      memorizedSurahs: s.memorizedSurahs ?? [],
      expectedSurahs: s.expectedSurahs ?? [],
      memorizedMutun: s.memorizedMutun ?? [],
      memorizedHadith: s.memorizedHadith ?? [],
      tajweedRules: s.tajweedRules ?? [],
      attendance: s.attendance ?? [],
    }));
  } catch {
    return [];
  }
}

function save(list: Student[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(list));
}

export function progressOf(s: Student) {
  const total = s.totalPages || 604;
  return Math.max(0, Math.min(1, s.pages / total));
}

export function useStudents() {
  const [students, setStudents] = useState<Student[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setStudents(load());
    setReady(true);
  }, []);

  const persist = useCallback((next: Student[]) => {
    setStudents(next);
    save(next);
  }, []);

  const add = useCallback(
    (data: Omit<Student, "id" | "createdAt" | "lastReviewAt"> & { lastReviewAt?: string }) => {
      const now = new Date().toISOString();
    const s: Student = {
      ...data,
      memorizedSurahs: data.memorizedSurahs ?? [],
      expectedSurahs: data.expectedSurahs ?? [],
      memorizedMutun: data.memorizedMutun ?? [],
      memorizedHadith: data.memorizedHadith ?? [],
      tajweedRules: data.tajweedRules ?? [],
      attendance: data.attendance ?? [],
      entryDate: data.entryDate || now,
      presentationDate: data.presentationDate || "",
      id: crypto.randomUUID(),
      createdAt: now,
      lastReviewAt: data.lastReviewAt || now,
    };
      persist([s, ...load()]);
      return s;
    },
    [persist]
  );

  const update = useCallback(
    (id: string, patch: Partial<Student>) => {
      const next = load().map((s) => (s.id === id ? { ...s, ...patch } : s));
      persist(next);
    },
    [persist]
  );

  const remove = useCallback(
    (id: string) => {
      persist(load().filter((s) => s.id !== id));
    },
    [persist]
  );

  const markReviewed = useCallback(
    (id: string) => {
      update(id, { lastReviewAt: new Date().toISOString() });
    },
    [update]
  );

  return { students, ready, add, update, remove, markReviewed };
}

export function useStudent(id: string) {
  const [student, setStudent] = useState<Student | null>(null);
  const [ready, setReady] = useState(false);
  const refresh = useCallback(() => {
    setStudent(load().find((s) => s.id === id) || null);
  }, [id]);
  useEffect(() => {
    refresh();
    setReady(true);
    const onStorage = () => refresh();
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [id, refresh]);

  const setAttendance = useCallback(
    (date: string, status: AttendanceStatus) => {
      const list = load();
      const next = list.map((s) => {
        if (s.id !== id) return s;
        const att = (s.attendance || []).filter((a) => a.date !== date);
        att.push({ date, status });
        att.sort((a, b) => (a.date < b.date ? 1 : -1));
        return { ...s, attendance: att };
      });
      save(next);
      refresh();
    },
    [id, refresh]
  );

  const removeAttendance = useCallback(
    (date: string) => {
      const list = load();
      const next = list.map((s) =>
        s.id === id ? { ...s, attendance: (s.attendance || []).filter((a) => a.date !== date) } : s
      );
      save(next);
      refresh();
    },
    [id, refresh]
  );

  return { student, ready, refresh, setAttendance, removeAttendance };
}

export function formatDate(iso: string) {
  if (!iso) return "—";
  try {
    const d = new Date(iso);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  } catch {
    return iso;
  }
}

export function exportBackupCSV(list: Student[]) {
  const header = "الاسم,الهاتف,الصفحات,الحزب,تاريخ التسجيل,آخر مراجعة,ملاحظات";
  const rows = list.map((s) =>
    [s.fullName, s.phone, s.pages, s.hizb, s.createdAt, s.lastReviewAt, (s.notes || "").replace(/\n/g, " ")]
      .map((v) => `"${String(v).replace(/"/g, '""')}"`)
      .join(",")
  );
  return "\ufeff" + [header, ...rows].join("\n");
}
