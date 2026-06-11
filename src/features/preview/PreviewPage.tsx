import { useParams } from 'react-router-dom';
import { ThreadList } from './ThreadList';
import { ThreadDetail } from './ThreadDetail';
import { useThreads } from '@/store/threadStore';
import { Badge } from '@/components/ui/badge';

export function PreviewPage() {
  const { threadId } = useParams<{ threadId: string }>();
  const isDetailView = !!threadId;
  const { threads } = useThreads();

  return (
    <section className="mx-auto max-w-5xl px-6 py-8">
      {!isDetailView && (
        <div className="flex items-center gap-2 mb-4">
          <h2 className="text-lg font-semibold font-[family-name:var(--font-display)] text-foreground">
            RedRep Форум
          </h2>
          <Badge variant="secondary" className="text-[10px]">
            {threads.length} теми
          </Badge>
        </div>
      )}

      {isDetailView ? <ThreadDetail /> : <ThreadList />}
    </section>
  );
}
