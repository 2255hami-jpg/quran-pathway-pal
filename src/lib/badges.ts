import type { Student } from "./students-store";

export type Badge = {
  id: string;
  emoji: string;
  title: string;
  description: string;
  color: string; // gradient
  earned: boolean;
};

export function computeBadges(s: Student): Badge[] {
  const att = s.attendance || [];
  const present = att.filter((a) => a.status === "present").length;
  const absent = att.filter((a) => a.status === "absent").length;
  const totalAtt = att.length;
  const punctual = totalAtt >= 5 && absent === 0;
  const history = s.progressHistory || [];
  const lastTwo = history.slice(-2);
  const monthlyGain =
    lastTwo.length === 2 ? lastTwo[1].pages - lastTwo[0].pages : 0;

  return [
    {
      id: "best-memorizer",
      emoji: "🏅",
      title: "أفضل حفظ",
      description: "تجاوز 300 صفحة",
      color: "linear-gradient(135deg,#D4AF37,#b8862b)",
      earned: s.pages >= 300,
    },
    {
      id: "half-quran",
      emoji: "📖",
      title: "نصف القرآن",
      description: "حفظ 15 حزباً أو أكثر",
      color: "linear-gradient(135deg,#1B5E20,#2E7D32)",
      earned: s.hizb >= 15,
    },
    {
      id: "full-quran",
      emoji: "🌙",
      title: "ختم القرآن",
      description: "حفظ كامل المصحف",
      color: "linear-gradient(135deg,#0f3d18,#1B5E20)",
      earned: s.pages >= 600,
    },
    {
      id: "punctual",
      emoji: "⏰",
      title: "المنتظم",
      description: "حضور بدون غياب",
      color: "linear-gradient(135deg,#1B5E20,#5d4037)",
      earned: punctual,
    },
    {
      id: "rising",
      emoji: "📈",
      title: "تقدم ملحوظ",
      description: "تحسن 20 صفحة هذا الشهر",
      color: "linear-gradient(135deg,#2E7D32,#66bb6a)",
      earned: monthlyGain >= 20,
    },
    {
      id: "mutun-master",
      emoji: "📜",
      title: "حافظ المتون",
      description: "حفظ متن أو أكثر",
      color: "linear-gradient(135deg,#8a6d1a,#D4AF37)",
      earned: (s.memorizedMutun || []).length > 0,
    },
    {
      id: "hadith-master",
      emoji: "📚",
      title: "حافظ الأحاديث",
      description: "حفظ أحاديث نبوية",
      color: "linear-gradient(135deg,#5d4037,#8a6d1a)",
      earned: (s.memorizedHadith || []).length > 0,
    },
    {
      id: "loyal",
      emoji: "💎",
      title: "الوفاء",
      description: "10 جلسات حضور أو أكثر",
      color: "linear-gradient(135deg,#1565c0,#1B5E20)",
      earned: present >= 10,
    },
  ];
}
