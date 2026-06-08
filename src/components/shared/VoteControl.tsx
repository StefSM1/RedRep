import { ArrowUp, ArrowDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { VoteDirection } from '@/types';
import { cn } from '@/lib/utils';

interface VoteControlProps {
  score: number;
  currentDirection: VoteDirection;
  onVote: (direction: VoteDirection) => void;
  orientation?: 'vertical' | 'horizontal';
}

export function VoteControl({
  score,
  currentDirection,
  onVote,
  orientation = 'horizontal',
}: VoteControlProps) {
  const isVertical = orientation === 'vertical';

  return (
    <div
      className={cn(
        'flex items-center gap-1',
        isVertical ? 'flex-col' : 'flex-row'
      )}
    >
      {/* Upvote */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onVote(currentDirection === 1 ? 0 : 1);
        }}
        className={cn(
          'flex items-center justify-center rounded-md p-1 transition-colors cursor-pointer',
          'hover:bg-accent/10',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1',
          currentDirection === 1
            ? 'text-accent'
            : 'text-muted-foreground hover:text-foreground'
        )}
        aria-label="Upvote"
      >
        <ArrowUp className="size-4" />
      </button>

      {/* Score */}
      <AnimatePresence mode="popLayout">
        <motion.span
          key={score}
          initial={{ scale: 1.3, opacity: 0.5 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          transition={{ type: 'spring', bounce: 0.4, duration: 0.3 }}
          className={cn(
            'text-xs font-semibold font-[family-name:var(--font-mono)] tabular-nums min-w-[1.5rem] text-center',
            currentDirection === 1 && 'text-accent',
            currentDirection === -1 && 'text-destructive',
            currentDirection === 0 && 'text-muted-foreground'
          )}
        >
          {score}
        </motion.span>
      </AnimatePresence>

      {/* Downvote */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onVote(currentDirection === -1 ? 0 : -1);
        }}
        className={cn(
          'flex items-center justify-center rounded-md p-1 transition-colors cursor-pointer',
          'hover:bg-destructive/10',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1',
          currentDirection === -1
            ? 'text-destructive'
            : 'text-muted-foreground hover:text-foreground'
        )}
        aria-label="Downvote"
      >
        <ArrowDown className="size-4" />
      </button>
    </div>
  );
}
