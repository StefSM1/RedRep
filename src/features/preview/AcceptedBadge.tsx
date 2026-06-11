import { BadgeCheck } from 'lucide-react';

interface AcceptedBadgeProps {
  acceptedAt?: string;
}

export function AcceptedBadge({ acceptedAt: _acceptedAt }: AcceptedBadgeProps) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2 py-0.5 text-xs font-medium text-accepted">
      <BadgeCheck className="size-3.5 text-emerald-500" />
      Най-добър отговор
    </span>
  );
}
