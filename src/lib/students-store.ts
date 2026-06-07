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
  entryDate?: string;
  presentationDate?: string;
  memorizedSurahs: string[];
  expectedSurahs: string[];
};

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
  useEffect(() => {
    const found = load().find((s) => s.id === id) || null;
    setStudent(found);
    setReady(true);
    const onStorage = () => setStudent(load().find((s) => s.id === id) || null);
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [id]);
  return { student, ready, refresh: () => setStudent(load().find((s) => s.id === id) || null) };
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
