import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Search, MessageSquare, X, RotateCcw } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useThreads } from "@/store/threadStore";
import { useDebounce } from "@/hooks/useDebounce";
import { useSort } from "@/hooks/useSort";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { VoteControl } from "@/components/shared/VoteControl";
import { SortTabs } from "@/components/shared/SortTabs";
import { ThreadSidebar } from "./ThreadSidebar";
import { CreateThread } from "./CreateThread";
import { CATEGORIES, CATEGORY_CONFIG, APP_CONFIG } from "@/lib/constants";
import type { Category, Thread, ThreadSort, VoteDirection } from "@/types";

/* ---------- Helpers ---------- */
function relativeTime(isoDate: string): string {
  const diff = Date.now() - new Date(isoDate).getTime();
  const minutes = Math.floor(diff / 60_000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

/* ---------- Animation variants ---------- */
const listVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06, delayChildren: 0.05 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring" as const, bounce: 0.2, duration: 0.5 },
  },
  exit: { opacity: 0, y: -10, transition: { duration: 0.2 } },
};

/* ---------- Thread Card ---------- */
function ThreadCard({ thread }: { thread: Thread }) {
  const navigate = useNavigate();
  const { vote, votes } = useThreads();
  const catConfig = CATEGORY_CONFIG[thread.category];

  const voteKey = `thread:${thread.id}`;
  const currentDirection: VoteDirection = votes[voteKey]?.direction ?? 0;

  function handleVote(direction: VoteDirection) {
    vote("thread", thread.id, direction);
  }

  return (
    <motion.div
      variants={cardVariants}
      layout
      className="card-solid card-glow rounded-xl p-4 cursor-pointer border-l-[3px]"
      style={{
        // --card-glow is consumed by .dark .card-glow in index.css
        borderLeftColor: catConfig?.color ?? "transparent",
        ["--card-glow" as string]: catConfig?.color ?? "transparent",
      }}
      whileHover={{ y: -1 }}
      onClick={() => navigate(`/preview/${thread.id}`)}
    >
      <div className="flex gap-3">
        {/* Vote control — left side */}
        <div className="shrink-0 pt-0.5" onClick={(e) => e.stopPropagation()}>
          <VoteControl
            score={thread.score}
            currentDirection={currentDirection}
            onVote={handleVote}
            orientation="vertical"
          />
        </div>

        {/* Content */}
        <div className="min-w-0 flex-1">
          {/* Top row: category badge + timestamp */}
          <div className="flex items-center justify-between mb-1.5">
            <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
              {catConfig?.label ?? thread.category}
            </Badge>
            <span className="text-[10px] text-muted-foreground">
              {relativeTime(thread.createdAt)}
            </span>
          </div>

          {/* Title */}
          <h3 className="text-sm font-semibold font-[family-name:var(--font-display)] text-foreground leading-snug mb-1 line-clamp-2">
            {thread.title}
          </h3>

          {/* Body preview — truncated */}
          <p className="text-xs leading-relaxed line-clamp-2 mb-2 text-muted-foreground">
            {thread.body}
          </p>

          {/* Bottom row: author + reply count */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Avatar className="size-5">
                <AvatarFallback className="text-[9px] bg-muted text-muted-foreground">
                  {getInitials(thread.author.displayName)}
                </AvatarFallback>
              </Avatar>
              <span className="text-[11px] text-muted-foreground">
                {thread.author.displayName}
              </span>
            </div>

            <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
              <MessageSquare className="size-3" />
              <span>{thread.replyCount}</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/* ---------- Main component ---------- */
export function ThreadList() {
  const { threads } = useThreads();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<Category | null>(null);
  const [sortMode, setSortMode] = useLocalStorage<ThreadSort>(
    "redrep-sort",
    "hot",
  );
  const debouncedSearch = useDebounce(searchQuery, APP_CONFIG.searchDebounce);

  /* Filter threads */
  const filtered = useMemo(() => {
    let result = threads;

    if (activeCategory) {
      result = result.filter((t) => t.category === activeCategory);
    }

    if (debouncedSearch.trim()) {
      const q = debouncedSearch.toLowerCase();
      result = result.filter(
        (t) =>
          t.title.toLowerCase().includes(q) || t.body.toLowerCase().includes(q),
      );
    }

    return result;
  }, [threads, activeCategory, debouncedSearch]);

  /* Sort filtered threads */
  const sorted = useSort(filtered, sortMode);

  const isFiltered = !!activeCategory || !!debouncedSearch.trim();

  return (
    <>
      {/* Sub-header: sort + search — same width as the thread
          column below (no negative margins). Uses .liquid-glass
          so stars show through in dark mode via frosted blur. */}
      <div className="py-3 px-4 liquid-glass glass-framed rounded-xl mb-4">
        <div className="flex flex-wrap items-center gap-3 mb-2">
          <SortTabs value={sortMode} onChange={setSortMode} />
          {/* Search bar */}
          <div className="relative flex-1 min-w-[180px]">
            <Search className="absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            <Input
              placeholder="Search threads…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 h-8 text-xs"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 rounded text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              >
                <X className="size-3" />
              </button>
            )}
          </div>
        </div>
        {/* Category filter pills */}
        <div className="flex gap-1.5 overflow-x-auto pb-0.5 scrollbar-hide">
          <Badge
            variant={activeCategory === null ? "default" : "secondary"}
            className="cursor-pointer transition-colors shrink-0 text-[10px]"
            onClick={() => setActiveCategory(null)}
          >
            All
          </Badge>
          {CATEGORIES.map((cat) => {
            const cfg = CATEGORY_CONFIG[cat];
            const isActive = activeCategory === cat;
            return (
              <Badge
                key={cat}
                variant={isActive ? "default" : "secondary"}
                className="cursor-pointer transition-colors shrink-0 text-[10px]"
                onClick={() => setActiveCategory(isActive ? null : cat)}
              >
                {cfg.label}
              </Badge>
            );
          })}
        </div>
      </div>

      {/* Two-column grid: thread list + sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Main column */}
        <div className="lg:col-span-8 space-y-4">
          {/* Result count + clear filters */}
          {isFiltered && (
            <div className="flex items-center gap-3">
              <p className="text-xs text-muted-foreground">
                Showing {sorted.length} of {threads.length} threads
              </p>
              <button
                onClick={() => {
                  setSearchQuery("");
                  setActiveCategory(null);
                }}
                className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              >
                <RotateCcw className="size-3" />
                Clear filters
              </button>
            </div>
          )}

          {/* Thread list */}
          <AnimatePresence mode="popLayout">
            {sorted.length > 0 ? (
              <motion.div
                key="thread-list"
                className="space-y-3"
                variants={listVariants}
                initial="hidden"
                animate="visible"
              >
                {sorted.map((thread) => (
                  <ThreadCard key={thread.id} thread={thread} />
                ))}
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center py-16 text-center"
              >
                <div className="rounded-full bg-muted p-4 mb-4">
                  <Search className="size-6 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold font-[family-name:var(--font-display)] text-foreground mb-1">
                  No threads found
                </h3>
                <p className="text-sm text-muted-foreground max-w-xs">
                  {isFiltered
                    ? "Try adjusting your search or filters."
                    : "Be the first to ask a question!"}
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* "New Question" button */}
          <div className="flex justify-end">
            <CreateThread />
          </div>
        </div>

        {/* Sidebar — desktop only */}
        <div className="hidden lg:block lg:col-span-4">
          <div className="sticky top-36">
            <ThreadSidebar
              activeCategory={activeCategory}
              onCategoryClick={setActiveCategory}
            />
          </div>
        </div>
      </div>
    </>
  );
}
