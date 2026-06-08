import { useState } from 'react';
import { motion } from 'framer-motion';
import { Send } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

/* ---------- Constants ---------- */
const MIN_LENGTH = 10;
const MAX_LENGTH = 2000;

/* ---------- Component ---------- */
interface ReplyFormProps {
  onSubmit: (body: string) => void;
}

export function ReplyForm({ onSubmit }: ReplyFormProps) {
  const [body, setBody] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const charCount = body.length;
  const isValid = charCount >= MIN_LENGTH && charCount <= MAX_LENGTH;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isValid) return;

    setIsSubmitting(true);

    // Simulate async submission (200ms)
    await new Promise((r) => setTimeout(r, 200));

    onSubmit(body.trim());
    setBody('');
    setIsSubmitting(false);
    toast.success('Reply posted!');
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <label
        htmlFor="reply-body"
        className="block text-sm font-medium text-foreground"
      >
        Your Reply
      </label>

      <Textarea
        id="reply-body"
        placeholder="Share your thoughts… (min 10 characters)"
        value={body}
        onChange={(e) => setBody(e.target.value)}
        disabled={isSubmitting}
        className="min-h-[120px] resize-y"
        aria-invalid={!isValid && charCount > 0}
      />

      {/* Bottom row: character count + submit */}
      <div className="flex items-center justify-between">
        <motion.span
          className="text-xs"
          animate={{
            color:
              charCount > MAX_LENGTH
                ? 'oklch(0.55 0.22 25)'
                : charCount >= MIN_LENGTH
                  ? 'oklch(0.65 0.15 160)'
                  : undefined,
          }}
        >
          {charCount} / {MAX_LENGTH}
          {charCount > 0 && charCount < MIN_LENGTH && (
            <span className="text-destructive ml-1.5">
              (min {MIN_LENGTH} characters)
            </span>
          )}
        </motion.span>

        <Button
          type="submit"
          disabled={!isValid || isSubmitting}
          className="cursor-pointer gap-1.5"
        >
          <Send className="size-4" />
          {isSubmitting ? 'Posting…' : 'Post Reply'}
        </Button>
      </div>
    </form>
  );
}
