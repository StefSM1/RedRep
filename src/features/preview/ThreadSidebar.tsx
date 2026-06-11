import { useNavigate } from 'react-router-dom';
import { Flame, ArrowUp, MessageSquare } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useThreads } from '@/store/threadStore';
import { sortThreads } from '@/hooks/useSort';
import { CATEGORIES, CATEGORY_CONFIG } from '@/lib/constants';
import type { Category } from '@/types';

interface ThreadSidebarProps {
  activeCategory: Category | null;
  onCategoryClick: (cat: Category | null) => void;
}

export function ThreadSidebar({ activeCategory, onCategoryClick }: ThreadSidebarProps) {
  const navigate = useNavigate();
  const { threads } = useThreads();

  // Top 3 trending threads (sorted by hot)
  const trending = sortThreads(threads, 'hot').slice(0, 3);

  // Category counts
  const categoryCounts = CATEGORIES.reduce<Record<string, number>>((acc, cat) => {
    acc[cat] = threads.filter((t) => t.category === cat).length;
    return acc;
  }, {});

  return (
    <aside className="space-y-6">
      {/* Trending Today */}
      <div className="card-solid rounded-xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <Flame className="size-4 text-accent" />
          <h3 className="text-sm font-semibold font-[family-name:var(--font-display)] text-foreground">
            Популярни днес
          </h3>
        </div>

        <div className="space-y-2.5">
          {trending.map((thread, i) => (
            <button
              key={thread.id}
              onClick={() => navigate(`/preview/${thread.id}`)}
              className="w-full text-left group cursor-pointer"
            >
              <div className="flex items-start gap-2">
                <span className="text-xs font-mono text-muted-foreground/50 mt-0.5 shrink-0">
                  {i + 1}
                </span>
                <div className="min-w-0">
                  <p className="text-xs font-medium text-foreground leading-snug line-clamp-2 group-hover:text-accent transition-colors">
                    {thread.title}
                  </p>
                  <div className="flex items-center gap-2 mt-1 text-[10px] text-muted-foreground">
                    <span className="inline-flex items-center gap-0.5">
                      <ArrowUp className="size-2.5" />
                      {thread.score}
                    </span>
                    <span className="inline-flex items-center gap-0.5">
                      <MessageSquare className="size-2.5" />
                      {thread.replyCount}
                    </span>
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Active Categories */}
      <div className="card-solid rounded-xl p-4">
        <h3 className="text-sm font-semibold font-[family-name:var(--font-display)] text-foreground mb-3">
          Категории
        </h3>

        <div className="flex flex-wrap gap-1.5">
          {CATEGORIES.map((cat) => {
            const cfg = CATEGORY_CONFIG[cat];
            const isActive = activeCategory === cat;
            return (
              <Badge
                key={cat}
                variant={isActive ? 'default' : 'secondary'}
                className="cursor-pointer transition-colors text-[10px] gap-1"
                onClick={() => onCategoryClick(isActive ? null : cat)}
              >
                {cfg.label}
                <span className="opacity-60">
                  {categoryCounts[cat] ?? 0}
                </span>
              </Badge>
            );
          })}
        </div>
      </div>
    </aside>
  );
}
