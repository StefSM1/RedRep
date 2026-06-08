import { APP_CONFIG } from '@/lib/constants';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

const TECH_STACK = ['React', 'TypeScript', 'Vite', 'Tailwind v4', 'shadcn/ui', 'Framer Motion'] as const;

export function Footer() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto max-w-5xl px-6 py-8">
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
          {/* Project info */}
          <div className="text-center sm:text-left">
            <p className="text-sm text-muted-foreground">
              <span className="font-semibold text-foreground font-[family-name:var(--font-display)]">
                {APP_CONFIG.name}
              </span>
              {' '}&copy; {new Date().getFullYear()}
            </p>
          </div>

          {/* Tech stack badges */}
          <div className="flex flex-wrap justify-center gap-1.5">
            {TECH_STACK.map((tech) => (
              <Badge key={tech} variant="secondary" className="text-xs font-normal">
                {tech}
              </Badge>
            ))}
          </div>
        </div>

        <Separator className="my-4" />

        <p className="text-center text-xs text-muted-foreground/60">
          Built as a university project &middot; UI/UX focused academic Q&A platform
        </p>
      </div>
    </footer>
  );
}
