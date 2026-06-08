import { motion } from 'framer-motion';
import { ArrowUp, ArrowDown, MessageSquare, BadgeCheck } from 'lucide-react';

/* ---------- Mock thread data ---------- */
const MOCK_THREADS = [
  {
    id: '1',
    title: 'How do you approach studying for a cumulative final?',
    category: 'Exam Prep',
    categoryColor: 'oklch(0.55 0.22 25)',
    score: 32,
    replies: 2,
    author: 'Alice Chen',
    initials: 'AC',
    hasAccepted: true,
  },
  {
    id: '2',
    title: 'Best resources for learning React hooks?',
    category: 'Homework',
    categoryColor: 'oklch(0.75 0.18 70)',
    score: 21,
    replies: 1,
    author: 'Marcus R.',
    initials: 'MR',
    hasAccepted: true,
  },
  {
    id: '3',
    title: 'Tips for technical interviews at startups?',
    category: 'Career',
    categoryColor: 'oklch(0.60 0.18 330)',
    score: 45,
    replies: 2,
    author: 'Jake T.',
    initials: 'JT',
    hasAccepted: false,
  },
];

/* ---------- Mock card ---------- */
function MockThreadCard({
  thread,
  index,
}: {
  thread: (typeof MOCK_THREADS)[number];
  index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 + index * 0.2, duration: 0.5 }}
      className="rounded-lg border border-border/40 bg-card/80 p-3"
    >
      <div className="flex gap-2.5">
        {/* Vote column */}
        <div className="flex flex-col items-center gap-0.5 pt-0.5">
          <ArrowUp className="size-3 text-muted-foreground/50" />
          <span className="text-[10px] font-semibold font-[family-name:var(--font-mono)] text-foreground">
            {thread.score}
          </span>
          <ArrowDown className="size-3 text-muted-foreground/50" />
        </div>

        {/* Content */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 mb-1">
            <span
              className="rounded px-1.5 py-0.5 text-[8px] font-medium text-foreground/80"
              style={{ backgroundColor: `${thread.categoryColor}20` }}
            >
              {thread.category}
            </span>
          </div>

          <p className="text-[11px] font-semibold text-foreground leading-snug line-clamp-1">
            {thread.title}
          </p>

          <div className="mt-1.5 flex items-center gap-2 text-[9px] text-muted-foreground">
            <div className="flex items-center gap-1">
              <div className="flex size-4 items-center justify-center rounded-full bg-muted">
                <span className="text-[7px] font-bold">{thread.initials}</span>
              </div>
              <span>{thread.author}</span>
            </div>
            <div className="flex items-center gap-0.5">
              <MessageSquare className="size-2.5" />
              <span>{thread.replies}</span>
            </div>
            {thread.hasAccepted && (
              <div className="flex items-center gap-0.5 text-emerald-500">
                <BadgeCheck className="size-2.5" />
                <span className="text-[8px] font-medium">Best Answer</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/* ---------- Main component ---------- */
const frameVariants = {
  hidden: { opacity: 0, x: 60, scale: 0.95 },
  visible: {
    opacity: 1,
    x: 0,
    scale: 1,
    transition: {
      type: 'spring' as const,
      bounce: 0.25,
      duration: 0.8,
      delay: 0.3,
    },
  },
};

export function HeroPreview() {
  return (
    <motion.div
      variants={frameVariants}
      initial="hidden"
      animate="visible"
      className="relative w-full max-w-sm mx-auto"
    >
      {/* Browser frame */}
        <div className="rounded-2xl border border-border/30 bg-card/60 backdrop-blur-sm shadow-2xl overflow-hidden">
          {/* Title bar */}
          <div className="flex items-center gap-1.5 px-3 py-2 border-b border-border/20 bg-muted/30">
            <div className="flex gap-1">
              <div className="size-2 rounded-full bg-red-400/60" />
              <div className="size-2 rounded-full bg-yellow-400/60" />
              <div className="size-2 rounded-full bg-green-400/60" />
            </div>
            <div className="flex-1 text-center">
              <span className="text-[9px] text-muted-foreground font-mono">
                redrep.app/preview
              </span>
            </div>
          </div>

          {/* Content area */}
          <div className="p-3 space-y-2">
            {/* Mini header */}
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-semibold font-[family-name:var(--font-display)] text-foreground">
                RedRep Forum
              </span>
              <div className="flex gap-1">
                {['Hot', 'New', 'Top'].map((tab) => (
                  <span
                    key={tab}
                    className={`text-[8px] px-1.5 py-0.5 rounded ${
                      tab === 'Hot'
                        ? 'bg-accent/20 text-accent font-medium'
                        : 'text-muted-foreground/50'
                    }`}
                  >
                    {tab}
                  </span>
                ))}
              </div>
            </div>

            {/* Mock thread cards */}
            {MOCK_THREADS.map((thread, i) => (
              <MockThreadCard key={thread.id} thread={thread} index={i} />
            ))}
          </div>
        </div>
    </motion.div>
  );
}
