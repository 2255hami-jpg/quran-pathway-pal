export type BadgeDef = {
  id: string;
  emoji: string;
  title: string;
  description: string;
  color: string;
};

export const BADGES: BadgeDef[] = [
  {
    id: "best-memorizer",
    emoji: "🏅",
    title: "أفضل حفظ",
    description: "تجاوز 300 صفحة",
    color: "linear-gradient(135deg,#D4AF37,#b8862b)",
  },
  {
    id: "half-quran",
    emoji: "📖",
    title: "نصف القرآن",
    description: "حفظ 15 حزباً أو أكثر",
    color: "linear-gradient(135deg,#1B5E20,#2E7D32)",
  },
  {
    id: "full-quran",
    emoji: "🌙",
    title: "ختم القرآن",
    description: "حفظ كامل المصحف",
    color: "linear-gradient(135deg,#0f3d18,#1B5E20)",
  },
  {
    id: "punctual",
    emoji: "⏰",
    title: "المنتظم",
    description: "حضور بدون غياب",
    color: "linear-gradient(135deg,#1B5E20,#5d4037)",
  },
  {
    id: "rising",
    emoji: "📈",
    title: "تقدم ملحوظ",
    description: "تحسن واضح في الحفظ",
    color: "linear-gradient(135deg,#2E7D32,#66bb6a)",
  },
  {
    id: "mutun-master",
    emoji: "📜",
    title: "حافظ المتون",
    description: "إتقان المتون العلمية",
    color: "linear-gradient(135deg,#8a6d1a,#D4AF37)",
  },
  {
    id: "hadith-master",
    emoji: "📚",
    title: "حافظ الأحاديث",
    description: "حفظ أحاديث نبوية",
    color: "linear-gradient(135deg,#5d4037,#8a6d1a)",
  },
  {
    id: "loyal",
    emoji: "💎",
    title: "الوفاء",
    description: "مواظبة على الحضور",
    color: "linear-gradient(135deg,#1565c0,#1B5E20)",
  },
  {
    id: "tajweed",
    emoji: "🎙️",
    title: "متقن التلاوة",
    description: "إتقان أحكام التجويد",
    color: "linear-gradient(135deg,#0f3d18,#2E7D32)",
  },
  {
    id: "excellence",
    emoji: "⭐",
    title: "الامتياز",
    description: "تميز في الأداء",
    color: "linear-gradient(135deg,#b8862b,#D4AF37)",
  },
];
