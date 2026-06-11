import { useState } from 'react';
import { motion } from 'framer-motion';
import { Send } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

/* ---------- Constants ---------- */
const MAX_LENGTH = 2000;

/* ---------- Component ---------- */
interface ReplyFormProps {
  onSubmit: (body: string) => void;
}

export function ReplyForm({ onSubmit }: ReplyFormProps) {
  const [body, setBody] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const charCount = body.length;
  const isValid = body.trim().length > 0 && charCount <= MAX_LENGTH;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isValid) return;

    setIsSubmitting(true);

    // Simulate async submission (200ms)
    await new Promise((r) => setTimeout(r, 200));

    onSubmit(body.trim());
    setBody('');
    setIsSubmitting(false);
    toast.success('Отговорът е публикуван!');
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <label
        htmlFor="reply-body"
        className="block text-sm font-medium text-foreground"
      >
        Твоят отговор
      </label>

      <Textarea
        id="reply-body"
        placeholder="Напиши отговора си тук…"
        value={body}
        onChange={(e) => setBody(e.target.value)}
        disabled={isSubmitting}
        className="min-h-[120px] resize-y"
        aria-invalid={charCount > MAX_LENGTH}
      />

      {/* Bottom row: character count + submit */}
      <div className="flex items-center justify-between">
        <motion.span
          className="text-xs"
          animate={{
            color:
              charCount > MAX_LENGTH
                ? 'oklch(0.55 0.22 25)'
                : charCount > 0
                  ? 'oklch(0.65 0.15 160)'
                  : undefined,
          }}
        >
          {charCount} / {MAX_LENGTH}
        </motion.span>

        <Button
          type="submit"
          disabled={!isValid || isSubmitting}
          className="cursor-pointer gap-1.5"
        >
          <Send className="size-4" />
          {isSubmitting ? 'Публикуване…' : 'Публикувай'}
        </Button>
      </div>
    </form>
  );
}
