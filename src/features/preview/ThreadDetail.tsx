import { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, MessageSquare, Calendar, Tag, Check } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { useThreads } from '@/store/threadStore';
import { VoteControl } from '@/components/shared/VoteControl';
import { AcceptedBadge } from './AcceptedBadge';
import { ReplyForm } from './ReplyForm';
import { CATEGORY_CONFIG } from '@/lib/constants';
import { cn } from '@/lib/utils';
import type { Reply, Thread, VoteDirection } from '@/types';

/* ---------- Helpers ---------- */
function relativeTime(isoDate: string): string {
  const diff = Date.now() - new Date(isoDate).getTime();
  const minutes = Math.floor(diff / 60_000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

/* ---------- Animation variants ---------- */
const replyVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring' as const, bounce: 0.2, duration: 0.5 },
  },
};

/* ---------- Reply Card ---------- */
function ReplyCard({
  reply,
  thread,
}: {
  reply: Reply;
  thread: Thread;
}) {
  const { vote, votes, acceptReply, currentUserId } = useThreads();
  const isAccepted = reply.id === thread.acceptedReplyId;
  const isThreadAuthor = thread.author.id === currentUserId;

  const voteKey = `reply:${reply.id}`;
  const currentDirection: VoteDirection = votes[voteKey]?.direction ?? 0;

  function handleVote(direction: VoteDirection) {
    vote('reply', reply.id, direction);
  }

  return (
    <motion.div
      variants={replyVariants}
      initial="hidden"
      animate="visible"
      className={cn(
        'card-solid rounded-xl p-4',
        isAccepted && 'border-l-4 border-l-emerald-500 bg-emerald-500/[0.03]'
      )}
      style={
        isAccepted
          ? ({ ['--card-glow' as string]: 'oklch(0.70 0.18 160)' } as React.CSSProperties)
          : undefined
      }
    >
      {/* Author row */}
      <div className="flex items-center gap-2.5 mb-3">
        <Avatar className="size-7">
          <AvatarFallback className="text-[10px] bg-muted text-muted-foreground">
            {getInitials(reply.author.displayName)}
          </AvatarFallback>
        </Avatar>
        <span className="text-sm font-medium text-foreground">
          {reply.author.displayName}
        </span>
        <span className="text-xs text-muted-foreground">
          {relativeTime(reply.createdAt)}
        </span>
        {isAccepted && <AcceptedBadge acceptedAt={reply.createdAt} />}
      </div>

      {/* Body */}
      <p className="text-sm leading-relaxed text-foreground/90 whitespace-pre-wrap mb-3">
        {reply.body}
      </p>

      {/* Bottom row: vote + accept button */}
      <div className="flex items-center justify-between">
        <VoteControl
          score={reply.score}
          currentDirection={currentDirection}
          onVote={handleVote}
          orientation="horizontal"
        />

        {isThreadAuthor && !isAccepted && (
          <button
            onClick={() => acceptReply(thread.id, reply.id)}
            className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-emerald-500 transition-colors cursor-pointer px-2 py-1 rounded-md hover:bg-emerald-500/10"
          >
            <Check className="size-3" />
            Accept as Answer
          </button>
        )}

        {isThreadAuthor && isAccepted && (
          <button
            onClick={() => acceptReply(thread.id, reply.id)}
            className="inline-flex items-center gap-1 text-xs text-emerald-500/60 hover:text-emerald-500 transition-colors cursor-pointer px-2 py-1 rounded-md hover:bg-emerald-500/10"
            title="Click to un-accept"
          >
            <Check className="size-3" />
            Accepted
          </button>
        )}
      </div>
    </motion.div>
  );
}

/* ---------- Main Component ---------- */
export function ThreadDetail() {
  const { threadId } = useParams<{ threadId: string }>();
  const navigate = useNavigate();
  const { threads, addReply, vote, votes, currentUserId } = useThreads();

  const thread = useMemo(
    () => threads.find((t) => t.id === threadId),
    [threads, threadId]
  );

  if (!thread) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="rounded-full bg-muted p-4 mb-4">
          <MessageSquare className="size-6 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold font-[family-name:var(--font-display)] text-foreground mb-1">
          Thread not found
        </h3>
        <p className="text-sm text-muted-foreground mb-4">
          This thread may have been deleted or doesn't exist.
        </p>
        <Button
          variant="outline"
          onClick={() => navigate('/preview')}
          className="cursor-pointer gap-1.5"
        >
          <ArrowLeft className="size-4" />
          Back to threads
        </Button>
      </div>
    );
  }

  const catConfig = CATEGORY_CONFIG[thread.category];
  const threadVoteKey = `thread:${thread.id}`;
  const threadDirection: VoteDirection = votes[threadVoteKey]?.direction ?? 0;

  function handleReply(body: string) {
    addReply(thread!.id, body, { id: currentUserId, displayName: 'You' });
  }

  function handleThreadVote(direction: VoteDirection) {
    vote('thread', thread!.id, direction);
  }

  return (
    <div className="space-y-8">
      {/* Back button */}
      <Button
        variant="ghost"
        onClick={() => navigate('/preview')}
        className="cursor-pointer gap-1.5 -ml-2"
      >
        <ArrowLeft className="size-4" />
        All Threads
      </Button>

      {/* Thread header */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
        className="space-y-4"
      >
        {/* Category + timestamp */}
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary" className="text-xs">
            {catConfig?.label ?? thread.category}
          </Badge>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Calendar className="size-3" />
            <span>{relativeTime(thread.createdAt)}</span>
          </div>
        </div>

        {/* Title row with vote control */}
        <div className="flex items-start gap-4">
          <div className="shrink-0 pt-1">
            <VoteControl
              score={thread.score}
              currentDirection={threadDirection}
              onVote={handleThreadVote}
              orientation="vertical"
            />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-[family-name:var(--font-display)] text-foreground leading-tight">
            {thread.title}
          </h1>
        </div>

        {/* Author + tags */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <Avatar className="size-7">
              <AvatarFallback className="text-[10px] bg-muted text-muted-foreground">
                {getInitials(thread.author.displayName)}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm text-muted-foreground">
              {thread.author.displayName}
            </span>
          </div>

          {thread.tags.length > 0 && (
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Tag className="size-3" />
              {thread.tags.map((tag) => (
                <span key={tag} className="text-xs">
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Thread body */}
        <div className="card-solid rounded-xl p-6">
          <p className="text-sm sm:text-base leading-relaxed whitespace-pre-wrap">
            {thread.body}
          </p>
        </div>
      </motion.div>

      <Separator />

      {/* Replies section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <MessageSquare className="size-4 text-muted-foreground" />
          <h2 className="text-lg font-semibold font-[family-name:var(--font-display)] text-foreground">
            {thread.replyCount} {thread.replyCount === 1 ? 'Reply' : 'Replies'}
          </h2>
        </div>

        <AnimatePresence mode="popLayout">
          {thread.replies.length > 0 ? (
            <motion.div className="space-y-3">
              {thread.replies.map((reply) => (
                <ReplyCard
                  key={reply.id}
                  reply={reply}
                  thread={thread}
                />
              ))}
            </motion.div>
          ) : (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-sm text-muted-foreground py-8 text-center"
            >
              No replies yet. Be the first to respond!
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      <Separator />

      {/* Reply form */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="card-solid rounded-xl p-6"
      >
        <ReplyForm onSubmit={handleReply} />
      </motion.div>
    </div>
  );
}
