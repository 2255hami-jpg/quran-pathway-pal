import { useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { SURAHS } from "@/lib/quran-surahs";
import { Check, BookOpen } from "lucide-react";

export function SurahPicker({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string[];
  onChange: (next: string[]) => void;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<string[]>(value);

  function openDialog() {
    setSelected(value);
    setQuery("");
    setOpen(true);
  }

  const filtered = useMemo(() => {
    const q = query.trim();
    if (!q) return SURAHS;
    return SURAHS.filter((s) => s.name.includes(q) || String(s.number).includes(q));
  }, [query]);

  function toggle(name: string) {
    setSelected((prev) =>
      prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name]
    );
  }

  function confirm() {
    // الحفاظ على ترتيب السور حسب رقمها
    const ordered = SURAHS.filter((s) => selected.includes(s.name)).map((s) => s.name);
    onChange(ordered);
    setOpen(false);
  }

  return (
    <>
      <button
        type="button"
        onClick={openDialog}
        className="flex w-full items-center justify-between gap-2 rounded-md border border-input bg-card px-3 py-2 text-right text-sm transition hover:border-primary"
      >
        <BookOpen className="h-4 w-4 text-primary" />
        <span className="flex-1 truncate text-right">
          {value.length ? `${value.length} سورة محفوظة` : `اختر ${label}`}
        </span>
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent dir="rtl" className="flex max-h-[85vh] flex-col sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-right">{label}</DialogTitle>
          </DialogHeader>

          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="🔍 ابحث عن سورة..."
            className="h-11"
          />

          <div className="text-xs text-muted-foreground">
            تم اختيار {selected.length} سورة من 114
          </div>

          <div className="-mx-2 flex-1 overflow-y-auto px-2">
            <ul className="divide-y divide-border/60">
              {filtered.map((s) => {
                const checked = selected.includes(s.name);
                return (
                  <li key={s.number}>
                    <button
                      type="button"
                      onClick={() => toggle(s.name)}
                      className="flex w-full items-center gap-3 py-2.5 text-right"
                    >
                      <Checkbox checked={checked} className="pointer-events-none" />
                      <span className="flex-1 text-base">{s.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {s.pages} ص
                      </span>
                      <span className="w-7 text-left text-xs font-semibold text-primary">
                        {s.number}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>

          <DialogFooter className="gap-2 sm:gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              إلغاء
            </Button>
            <Button onClick={confirm} className="gap-1">
              <Check className="h-4 w-4" />
              تأكيد ({selected.length})
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
