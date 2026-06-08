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
const BODY_MIN = 20;

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
    if (!form.title.trim()) e.title = 'Title is required.';
    else if (form.title.length > TITLE_MAX)
      e.title = `Title must be ${TITLE_MAX} characters or less.`;
    if (!form.body.trim()) e.body = 'Body is required.';
    else if (form.body.trim().length < BODY_MIN)
      e.body = `Body must be at least ${BODY_MIN} characters.`;
    if (!form.category) e.category = 'Please select a category.';
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

    const mockUser = { id: 'current-user', displayName: 'You' };

    const newId = createThread({
      title: form.title.trim(),
      body: form.body.trim(),
      author: mockUser,
      category: form.category as Category,
      tags,
    });

    setOpen(false);
    setIsSubmitting(false);
    toast.success('Thread created!');

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
        <Label htmlFor="thread-title">Title</Label>
        <Input
          id="thread-title"
          placeholder="What's your question?"
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
        <Label htmlFor="thread-body">Body</Label>
        <Textarea
          id="thread-body"
          placeholder="Describe your question in detail… (min 20 characters)"
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
            {form.body.length} chars{form.body.length > 0 && form.body.length < BODY_MIN ? ` (min ${BODY_MIN})` : ''}
          </span>
        </div>
      </div>

      {/* Category */}
      <div className="space-y-1.5">
        <Label>Category</Label>
        <Select
          value={form.category || undefined}
          onValueChange={(val: string | null) => { if (val) updateField('category', val as Category); }}
          disabled={isSubmitting}
        >
          <SelectTrigger className="w-full" aria-invalid={!!errors.category}>
            <SelectValue placeholder="Select a category" />
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
        <Label htmlFor="thread-tags">Tags</Label>
        <Input
          id="thread-tags"
          placeholder="e.g. react, hooks, web-dev (comma-separated)"
          value={form.tags}
          onChange={(e) => updateField('tags', e.target.value)}
          disabled={isSubmitting}
        />
        <p className="text-xs text-muted-foreground">
          Separate tags with commas
        </p>
      </div>

      {/* Submit */}
      <Button
        type="submit"
        disabled={isSubmitting}
        className="w-full cursor-pointer gap-1.5"
      >
        <Plus className="size-4" />
        {isSubmitting ? 'Creating…' : 'Create Thread'}
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
          New Question
        </Button>

        <Sheet open={open} onOpenChange={setOpen}>
          <SheetContent side="bottom" className="max-h-[85vh] overflow-y-auto rounded-t-2xl p-6">
            <SheetHeader className="mb-4">
              <SheetTitle>Ask a Question</SheetTitle>
              <SheetDescription>
                Post your question to the community.
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
        New Question
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Ask a Question</DialogTitle>
            <DialogDescription>
              Post your question to the community.
            </DialogDescription>
          </DialogHeader>
          {formContent}
        </DialogContent>
      </Dialog>
    </>
  );
}
