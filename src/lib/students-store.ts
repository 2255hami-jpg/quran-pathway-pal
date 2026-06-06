import { useEffect, useState, useCallback } from "react";

export type Student = {
  id: string;
  fullName: string;
  phone: string;
  pages: number;
  totalPages: number;
  hizb: number;
  notes: string;
  createdAt: string;
  lastReviewAt: string;
};

const KEY = "quran_students_v1";

function load(): Student[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Student[]) : [];
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

export function formatArabicDate(iso: string) {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleDateString("ar-EG", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
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
