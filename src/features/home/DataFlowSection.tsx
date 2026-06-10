import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import {
  PenSquare,
  Tags,
  Send,
  MessageSquare,
  CheckCircle2,
  Archive,
} from 'lucide-react';

/* ---------- Types ---------- */
interface FlowStep {
  icon: React.ElementType;
  step: number;
  title: string;
  description: string;
}

/* ---------- Flow data ---------- */
const STEPS: FlowStep[] = [
  {
    icon: PenSquare,
    step: 1,
    title: 'Създай въпрос',
    description: 'Публикувай въпрос с форматиран текст, кодови фрагменти и ясно формулиран проблем.',
  },
  {
    icon: Tags,
    step: 2,
    title: 'Категоризирай и тагвай',
    description: 'Избери категория и добави тагове за по-лесно откриване от другите.',
  },
  {
    icon: Send,
    step: 3,
    title: 'Публикувай в общността',
    description: 'Въпросът става видим за всички студенти в потока на общността.',
  },
  {
    icon: MessageSquare,
    step: 4,
    title: 'Получи отговори',
    description: 'Колегите отговарят с решения, вложени отговори и допълнителни въпроси.',
  },
  {
    icon: CheckCircle2,
    step: 5,
    title: 'Избери най-добрия отговор',
    description: 'Авторът обелязва най-полезния отговор като приет.',
  },
  {
    icon: Archive,
    step: 6,
    title: 'Архивирай и търси',
    description: 'Решените теми стават търсими знания за бъдещите студенти.',
  },
];

/* ---------- Animation variants ---------- */
const nodeVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { type: 'spring' as const, bounce: 0.3, duration: 0.5, delay: i * 0.08 },
  }),
};

/* ---------- Main component ---------- */
export function DataFlowSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.15 });

  return (
    <section ref={sectionRef} className="section-spacing mx-auto max-w-6xl px-6">
      {/* Header */}
      <div className="mb-10 text-center">
        <h2 className="mb-3">От въпрос до споделено знание</h2>
        <p className="mx-auto max-w-lg text-muted-foreground">
          Всеки въпрос следва ясен път — от създаването до
          архивирането, като знание, помагащо на следващия студент.
        </p>
      </div>

      {/* ─── Desktop: Horizontal Timeline ─── */}
      <div className="hidden sm:block">
        {/* Timeline with nodes and text stacked vertically */}
        <div className="relative flex justify-between px-4">
          {/* Animated SVG line spanning full width, centered on the icon row */}
          <svg
            className="absolute top-[34px] left-0 w-full h-2 pointer-events-none"
            viewBox="0 0 100 2"
            preserveAspectRatio="none"
            fill="none"
            aria-hidden="true"
          >
            {/* Background track */}
            <line
              x1="0"
              y1="1"
              x2="100"
              y2="1"
              stroke="currentColor"
              className="text-border"
              strokeWidth="0.4"
            />
            {/* Animated fill line — neon accent glow */}
            <motion.line
              x1="0"
              y1="1"
              x2="100"
              y2="1"
              stroke="oklch(0.60 0.22 270)"
              strokeWidth="0.6"
              initial={{ pathLength: 0 }}
              animate={isInView ? { pathLength: 1 } : { pathLength: 0 }}
              transition={{ duration: 1.5, delay: 0.2, ease: 'easeInOut' }}
              style={{ filter: 'drop-shadow(0 0 3px oklch(0.55 0.20 270 / 0.5))' }}
            />
          </svg>

          {/* Each step: icon + label + title + description stacked vertically */}
          {STEPS.map((step, i) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={step.step}
                custom={i}
                variants={nodeVariants}
                initial="hidden"
                animate={isInView ? 'visible' : 'hidden'}
                className="relative z-10 flex flex-col items-center text-center w-[15%]"
              >
                <div className="flex size-[72px] items-center justify-center rounded-full bg-accent/15 border-2 border-accent/50 text-accent transition-transform duration-300 hover:scale-110" style={{ boxShadow: '0 0 12px oklch(0.55 0.20 270 / 0.15)' }}>
                  <Icon className="size-8" />
                </div>
                <span className="mt-4 text-sm font-mono text-accent font-medium uppercase tracking-widest">
                  Етап {step.step}
                </span>
                <h4 className="text-base font-semibold font-[family-name:var(--font-display)] text-foreground mt-1.5 leading-tight">
                  {step.title}
                </h4>
                <p className="text-sm leading-relaxed text-muted-foreground mt-1.5">
                  {step.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* ─── Mobile: Vertical Timeline ─── */}
      <div className="sm:hidden relative pl-10">
        {/* Vertical line */}
        <div className="absolute left-[19px] top-0 bottom-0 w-0.5 bg-border">
          <motion.div
            className="w-full bg-accent/60 origin-top"
            initial={{ scaleY: 0 }}
            animate={isInView ? { scaleY: 1 } : {}}
            transition={{ duration: 1.2, delay: 0.2, ease: 'easeInOut' }}
          />
        </div>

        {/* Steps */}
        <div className="space-y-8">
          {STEPS.map((step, i) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, x: -10 }}
                animate={isInView ? { opacity: 1, x: 0 } : {}}
                transition={{ delay: 0.15 + i * 0.1, duration: 0.4 }}
                className="relative"
              >
                {/* Node circle on the timeline */}
                <div className="absolute -left-10 flex size-12 items-center justify-center rounded-full bg-accent/10 border-2 border-accent/40 text-accent">
                  <Icon className="size-5" />
                </div>

                {/* Content card */}
                <div className="liquid-glass rounded-xl p-4">
                  <span className="text-xs font-mono text-accent font-medium uppercase tracking-widest">
                    Етап {step.step}
                  </span>
                  <h4 className="text-base font-semibold font-[family-name:var(--font-display)] text-foreground mt-1 mb-1.5">
                    {step.title}
                  </h4>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {step.description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
