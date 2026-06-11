import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useThreads } from '@/store/threadStore';
import { CATEGORIES, CATEGORY_CONFIG } from '@/lib/constants';
import type { Category } from '@/types';

/* ---------- Constants ---------- */
const TITLE_MAX = 200;

/* ---------- Form state ---------- */
interface FormData {
  title: string;
  body: string;
  category: Category | '';
  tags: string;
}

interface FormErrors {
  title?: string;
  body?: string;
  category?: string;
}

const INITIAL: FormData = { title: '', body: '', category: '', tags: '' };

/* ---------- Responsive hook ---------- */
function useIsMobile(breakpoint = 640) {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${breakpoint - 1}px)`);
    setIsMobile(mql.matches);
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }, [breakpoint]);
  return isMobile;
}

/* ---------- Component ---------- */
export function CreateThread() {
  const navigate = useNavigate();
  const { createThread } = useThreads();
  const isMobile = useIsMobile();

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<FormData>(INITIAL);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset form when dialog closes
  useEffect(() => {
    if (!open) {
      setForm(INITIAL);
      setErrors({});
    }
  }, [open]);

  function validate(): FormErrors {
    const e: FormErrors = {};
    if (!form.title.trim()) e.title = 'Заглавието е задължително.';
    else if (form.title.length > TITLE_MAX)
      e.title = `Заглавието трябва да е до ${TITLE_MAX} символа.`;
    if (!form.body.trim()) e.body = 'Съдържанието е задължително.';
    if (!form.category) e.category = 'Моля, избери категория.';
    return e;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);

    // Simulate async (200ms)
    await new Promise((r) => setTimeout(r, 200));

    const tags = form.tags
      .split(',')
      .map((t) => t.trim().toLowerCase().replace(/^#/, ''))
      .filter(Boolean);

    const mockUser = { id: 'current-user', displayName: 'Ти' };

    const newId = createThread({
      title: form.title.trim(),
      body: form.body.trim(),
      author: mockUser,
      category: form.category as Category,
      tags,
    });

    setOpen(false);
    setIsSubmitting(false);
    toast.success('Темата е създадена!');

    // Navigate directly to the new thread
    navigate(`/preview/${newId}`);
  }

  function updateField<K extends keyof FormData>(key: K, value: FormData[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    // Clear error on change
    if (errors[key as keyof FormErrors]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[key as keyof FormErrors];
        return next;
      });
    }
  }

  /* ---------- Form content (shared between Dialog & Sheet) ---------- */
  const formContent = (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Title */}
      <div className="space-y-1.5">
        <Label htmlFor="thread-title">Заглавие</Label>
        <Input
          id="thread-title"
          placeholder="Какъв е въпросът ти?"
          value={form.title}
          onChange={(e) => updateField('title', e.target.value)}
          disabled={isSubmitting}
          aria-invalid={!!errors.title}
          maxLength={TITLE_MAX}
        />
        <div className="flex justify-between text-xs">
          {errors.title ? (
            <span className="text-destructive">{errors.title}</span>
          ) : (
            <span />
          )}
          <span className="text-muted-foreground">
            {form.title.length}/{TITLE_MAX}
          </span>
        </div>
      </div>

      {/* Body */}
      <div className="space-y-1.5">
        <Label htmlFor="thread-body">Съдържание</Label>
        <Textarea
          id="thread-body"
          placeholder="Опиши въпроса си подробно…"
          value={form.body}
          onChange={(e) => updateField('body', e.target.value)}
          disabled={isSubmitting}
          aria-invalid={!!errors.body}
          className="min-h-[120px] resize-y"
        />
        <div className="flex justify-between text-xs">
          {errors.body ? (
            <span className="text-destructive">{errors.body}</span>
          ) : (
            <span />
          )}
          <span className="text-muted-foreground">
            {form.body.length} символа
          </span>
        </div>
      </div>

      {/* Category */}
      <div className="space-y-1.5">
        <Label>Категория</Label>
        <Select
          value={form.category || undefined}
          onValueChange={(val: string | null) => { if (val) updateField('category', val as Category); }}
          disabled={isSubmitting}
        >
          <SelectTrigger className="w-full" aria-invalid={!!errors.category}>
            <SelectValue placeholder="Избери категория" />
          </SelectTrigger>
          <SelectContent>
            {CATEGORIES.map((cat) => {
              const cfg = CATEGORY_CONFIG[cat];
              return (
                <SelectItem key={cat} value={cat}>
                  {cfg.label}
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
        {errors.category && (
          <p className="text-xs text-destructive">{errors.category}</p>
        )}
      </div>

      {/* Tags */}
      <div className="space-y-1.5">
        <Label htmlFor="thread-tags">Тагове</Label>
        <Input
          id="thread-tags"
          placeholder="напр. react, hooks, web-dev (разделени със запетая)"
          value={form.tags}
          onChange={(e) => updateField('tags', e.target.value)}
          disabled={isSubmitting}
        />
        <p className="text-xs text-muted-foreground">
          Разделяй таговете със запетаи
        </p>
      </div>

      {/* Submit */}
      <Button
        type="submit"
        disabled={isSubmitting}
        className="w-full cursor-pointer gap-1.5"
      >
        <Plus className="size-4" />
        {isSubmitting ? 'Създаване…' : 'Създай тема'}
      </Button>
    </form>
  );

  /* ---------- Render ---------- */
  if (isMobile) {
    return (
      <>
        <Button
          onClick={() => setOpen(true)}
          className="cursor-pointer gap-1.5"
        >
          <Plus className="size-4" />
          Нов въпрос
        </Button>

        <Sheet open={open} onOpenChange={setOpen}>
          <SheetContent side="bottom" className="max-h-[85vh] overflow-y-auto rounded-t-2xl p-6">
            <SheetHeader className="mb-4">
              <SheetTitle>Задай въпрос</SheetTitle>
              <SheetDescription>
                Публикувай въпроса си пред общността.
              </SheetDescription>
            </SheetHeader>
            {formContent}
          </SheetContent>
        </Sheet>
      </>
    );
  }

  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        className="cursor-pointer gap-1.5"
      >
        <Plus className="size-4" />
        Нов въпрос
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Задай въпрос</DialogTitle>
            <DialogDescription>
              Публикувай въпроса си пред общността.
            </DialogDescription>
          </DialogHeader>
          {formContent}
        </DialogContent>
      </Dialog>
    </>
  );
}
