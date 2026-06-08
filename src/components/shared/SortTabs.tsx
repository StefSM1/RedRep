import { Flame, Clock, TrendingUp } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { ThreadSort } from '@/types';

interface SortTabsProps {
  value: ThreadSort;
  onChange: (mode: ThreadSort) => void;
}

const SORT_OPTIONS: { value: ThreadSort; label: string; icon: React.ElementType }[] = [
  { value: 'hot', label: 'Hot', icon: Flame },
  { value: 'new', label: 'New', icon: Clock },
  { value: 'top', label: 'Top', icon: TrendingUp },
];

export function SortTabs({ value, onChange }: SortTabsProps) {
  return (
    <Tabs
      value={value}
      onValueChange={(val: string | number | null) => {
        if (val && typeof val === 'string') onChange(val as ThreadSort);
      }}
    >
      <TabsList variant="default" className="h-9">
        {SORT_OPTIONS.map((opt) => {
          const Icon = opt.icon;
          return (
            <TabsTrigger
              key={opt.value}
              value={opt.value}
              className="gap-1.5 text-xs cursor-pointer"
            >
              <Icon className="size-3.5" />
              {opt.label}
            </TabsTrigger>
          );
        })}
      </TabsList>
    </Tabs>
  );
}
