import { STATS_ITEMS } from '@/lib/constants';

export function StatsMarquee() {
  // Duplicate items for seamless loop
  const items = [...STATS_ITEMS, ...STATS_ITEMS];

  return (
    <div
      className="relative overflow-hidden border-y border-border/30 py-5"
      aria-hidden="true"
    >
      {/* Gradient fade edges */}
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-background to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-background to-transparent" />

      {/* Scrolling track */}
      <div className="animate-marquee flex w-max gap-12">
        {items.map((item, i) => (
          <div key={`${item.label}-${i}`} className="flex items-baseline gap-2 whitespace-nowrap">
            <span className="text-2xl sm:text-3xl font-bold font-[family-name:var(--font-display)] text-gradient-primary">
              {item.value}
            </span>
            <span className="text-xs sm:text-sm text-muted-foreground uppercase tracking-wider">
              {item.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
