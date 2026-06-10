import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';

/* ---------- Feature data ---------- */
interface Feature {
  title: string;
  description: string;
  span: string;
  illustration: React.FC<{ className?: string }>;
}

/* ============================================================
   SVG Illustrations — inline, theme-aware via currentColor
   ============================================================ */

/** Thread Creation: stylized document + pen + sparkle particles */
function ThreadCreationSvg({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 140 140" fill="none" className={className} aria-hidden="true">
      {/* Document body */}
      <rect x="28" y="18" width="58" height="76" rx="8"
        stroke="currentColor" strokeWidth="2.5" opacity="0.25" />
      {/* Corner fold */}
      <path d="M68 18v16a4 4 0 0 0 4 4h14" stroke="currentColor" strokeWidth="2" opacity="0.18" />
      {/* Text lines */}
      <line x1="40" y1="46" x2="74" y2="46" stroke="currentColor" strokeWidth="2" opacity="0.18" strokeLinecap="round" />
      <line x1="40" y1="56" x2="66" y2="56" stroke="currentColor" strokeWidth="2" opacity="0.14" strokeLinecap="round" />
      <line x1="40" y1="66" x2="58" y2="66" stroke="currentColor" strokeWidth="2" opacity="0.10" strokeLinecap="round" />
      {/* Pen */}
      <g className="feature-anim-bob">
        <line x1="90" y1="38" x2="74" y2="54" stroke="currentColor" strokeWidth="2.5" opacity="0.40" strokeLinecap="round" />
        <circle cx="74" cy="54" r="2" fill="currentColor" opacity="0.40" />
      </g>
      {/* Sparkles */}
      <path d="M98 30l2-5 2 5 5 2-5 2-2 5-2-5-5-2z" fill="currentColor" opacity="0.30" className="feature-anim-pulse" />
      <path d="M104 54l1.5-3.5 1.5 3.5 3.5 1.5-3.5 1.5-1.5 3.5-1.5-3.5-3.5-1.5z" fill="currentColor" opacity="0.20" className="feature-anim-pulse" style={{ animationDelay: '1s' }} />
      <path d="M94 68l1-2.5 1 2.5 2.5 1-2.5 1-1 2.5-1-2.5-2.5-1z" fill="currentColor" opacity="0.15" className="feature-anim-pulse" style={{ animationDelay: '2s' }} />
    </svg>
  );
}

/** Nested Replies: branching tree with connected nodes */
function NestedRepliesSvg({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 140 140" fill="none" className={className} aria-hidden="true">
      {/* Root node */}
      <circle cx="28" cy="28" r="8" stroke="currentColor" strokeWidth="2.5" opacity="0.30" />
      <circle cx="28" cy="28" r="3" fill="currentColor" opacity="0.30" />
      {/* Branch 1 */}
      <path d="M36 28h22" stroke="currentColor" strokeWidth="2" opacity="0.20" strokeLinecap="round" />
      <circle cx="68" cy="28" r="6" stroke="currentColor" strokeWidth="2" opacity="0.25" className="feature-anim-bob" />
      <circle cx="68" cy="28" r="2.5" fill="currentColor" opacity="0.25" />
      {/* Sub-branch 1a */}
      <path d="M36 34v18a6 6 0 0 0 6 6h16" stroke="currentColor" strokeWidth="1.5" opacity="0.15" strokeLinecap="round" />
      <circle cx="68" cy="58" r="5" stroke="currentColor" strokeWidth="1.5" opacity="0.20" className="feature-anim-bob" style={{ animationDelay: '0.4s' }} />
      <circle cx="68" cy="58" r="2" fill="currentColor" opacity="0.20" />
      {/* Sub-branch 1a-deep */}
      <path d="M73 58h18" stroke="currentColor" strokeWidth="1.5" opacity="0.12" strokeLinecap="round" />
      <circle cx="98" cy="58" r="4" stroke="currentColor" strokeWidth="1.5" opacity="0.15" />
      {/* Sub-branch 1b */}
      <path d="M68 34v12a5 5 0 0 0 5 5h15" stroke="currentColor" strokeWidth="1.5" opacity="0.13" strokeLinecap="round" />
      <circle cx="98" cy="51" r="4" stroke="currentColor" strokeWidth="1.5" opacity="0.15" className="feature-anim-bob" style={{ animationDelay: '0.8s' }} />
      {/* Branch 2 */}
      <path d="M36 34v52a6 6 0 0 0 6 6h16" stroke="currentColor" strokeWidth="1.5" opacity="0.12" strokeLinecap="round" />
      <circle cx="68" cy="92" r="6" stroke="currentColor" strokeWidth="2" opacity="0.18" />
      <circle cx="68" cy="92" r="2.5" fill="currentColor" opacity="0.18" />
      <path d="M74 92h16" stroke="currentColor" strokeWidth="1.5" opacity="0.10" strokeLinecap="round" />
      <circle cx="98" cy="92" r="4" stroke="currentColor" strokeWidth="1.5" opacity="0.12" />
    </svg>
  );
}

/** Smart Search: magnifying glass with filter layers inside */
function SmartSearchSvg({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 140 140" fill="none" className={className} aria-hidden="true">
      {/* Magnifying glass */}
      <circle cx="60" cy="58" r="30" stroke="currentColor" strokeWidth="2.5" opacity="0.25" />
      <line x1="82" y1="80" x2="112" y2="110" stroke="currentColor" strokeWidth="3.5" opacity="0.30" strokeLinecap="round" />
      {/* Filter bars inside lens */}
      <g className="feature-anim-bob">
        <rect x="44" y="46" width="28" height="4" rx="2" fill="currentColor" opacity="0.18" />
        <rect x="44" y="55" width="20" height="4" rx="2" fill="currentColor" opacity="0.14" />
        <rect x="44" y="64" width="24" height="4" rx="2" fill="currentColor" opacity="0.10" />
      </g>
      {/* Highlight dot */}
      <circle cx="50" cy="42" r="4" fill="currentColor" opacity="0.08" className="feature-anim-pulse" />
    </svg>
  );
}

/** User Reputation: shield/badge with rising bars */
function UserReputationSvg({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 140 140" fill="none" className={className} aria-hidden="true">
      {/* Shield */}
      <path d="M70 14l38 16v28c0 22-16 40-38 48-22-8-38-26-38-48V30z"
        stroke="currentColor" strokeWidth="2.5" opacity="0.22" />
      {/* Rising bars */}
      <rect x="50" y="70" width="8" height="16" rx="2" fill="currentColor" opacity="0.12" />
      <rect x="64" y="58" width="8" height="28" rx="2" fill="currentColor" opacity="0.18" className="feature-anim-grow" />
      <rect x="78" y="46" width="8" height="40" rx="2" fill="currentColor" opacity="0.25" className="feature-anim-grow" style={{ animationDelay: '0.3s' }} />
      {/* Star */}
      <path d="M70 28l3.5 7 7.5 1-5.5 5.2 1.3 7.5L70 45l-6.8 3.7 1.3-7.5L59 36l7.5-1z"
        fill="currentColor" opacity="0.22" className="feature-anim-pulse" />
    </svg>
  );
}

/** Real-time Updates: concentric pulse rings from center */
function RealtimeUpdatesSvg({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 140 140" fill="none" className={className} aria-hidden="true">
      {/* Center dot */}
      <circle cx="70" cy="70" r="6" fill="currentColor" opacity="0.35" />
      {/* Pulse rings */}
      <circle cx="70" cy="70" r="18" stroke="currentColor" strokeWidth="2" opacity="0.22" className="feature-anim-ring" />
      <circle cx="70" cy="70" r="32" stroke="currentColor" strokeWidth="1.5" opacity="0.14" className="feature-anim-ring" style={{ animationDelay: '0.6s' }} />
      <circle cx="70" cy="70" r="46" stroke="currentColor" strokeWidth="1.2" opacity="0.08" className="feature-anim-ring" style={{ animationDelay: '1.2s' }} />
      {/* Activity dots on rings */}
      <circle cx="88" cy="62" r="3" fill="currentColor" opacity="0.28" className="feature-anim-pulse" />
      <circle cx="52" cy="82" r="2.5" fill="currentColor" opacity="0.20" className="feature-anim-pulse" style={{ animationDelay: '1s' }} />
      <circle cx="96" cy="78" r="2" fill="currentColor" opacity="0.15" className="feature-anim-pulse" style={{ animationDelay: '1.8s' }} />
    </svg>
  );
}

/** Community Moderation: interlocking people forming a protective circle */
function CommunityModSvg({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 140 140" fill="none" className={className} aria-hidden="true">
      {/* Dashed protective ring */}
      <circle cx="70" cy="70" r="42" stroke="currentColor" strokeWidth="1.5" opacity="0.10" strokeDasharray="6 4" />
      {/* Person — top */}
      <g className="feature-anim-bob">
        <circle cx="70" cy="32" r="6" stroke="currentColor" strokeWidth="2" opacity="0.25" />
        <path d="M60 48a10 10 0 0 1 20 0" stroke="currentColor" strokeWidth="2" opacity="0.20" strokeLinecap="round" />
      </g>
      {/* Person — right */}
      <g className="feature-anim-bob" style={{ animationDelay: '0.5s' }}>
        <circle cx="104" cy="68" r="6" stroke="currentColor" strokeWidth="2" opacity="0.25" />
        <path d="M94 84a10 10 0 0 1 20 0" stroke="currentColor" strokeWidth="2" opacity="0.20" strokeLinecap="round" />
      </g>
      {/* Person — bottom */}
      <g className="feature-anim-bob" style={{ animationDelay: '1s' }}>
        <circle cx="70" cy="104" r="6" stroke="currentColor" strokeWidth="2" opacity="0.25" />
        <path d="M60 120a10 10 0 0 1 20 0" stroke="currentColor" strokeWidth="2" opacity="0.20" strokeLinecap="round" />
      </g>
      {/* Person — left */}
      <g className="feature-anim-bob" style={{ animationDelay: '1.5s' }}>
        <circle cx="36" cy="68" r="6" stroke="currentColor" strokeWidth="2" opacity="0.25" />
        <path d="M26 84a10 10 0 0 1 20 0" stroke="currentColor" strokeWidth="2" opacity="0.20" strokeLinecap="round" />
      </g>
      {/* Connecting arcs */}
      <path d="M80 36a40 40 0 0 1 20 28" stroke="currentColor" strokeWidth="1.5" opacity="0.10" strokeLinecap="round" />
      <path d="M100 78a40 40 0 0 1-20 28" stroke="currentColor" strokeWidth="1.5" opacity="0.10" strokeLinecap="round" />
      <path d="M60 100a40 40 0 0 1-20-28" stroke="currentColor" strokeWidth="1.5" opacity="0.10" strokeLinecap="round" />
      <path d="M40 58a40 40 0 0 1 20-28" stroke="currentColor" strokeWidth="1.5" opacity="0.10" strokeLinecap="round" />
      {/* Shield checkmark in center */}
      <path d="M64 70l4 4 8-8" stroke="currentColor" strokeWidth="2.5" opacity="0.28" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* ---------- Feature definitions ---------- */
const FEATURES: Feature[] = [
  {
    title: 'Създаване на тема',
    description:
      'Публикувай въпрос с форматиран текст, категории и тагове. Прецизният въпрос привлича ясни и полезни отговори.',
    span: '',
    illustration: ThreadCreationSvg,
  },
  {
    title: 'Умно търсене',
    description:
      'Търсене по цял текст в заглавия и съдържанието. Филтрирай по категория, ключова дума или дата, за да намериш точно каквото търсиш.',
    span: '',
    illustration: SmartSearchSvg,
  },
  {
    title: 'Вложени отговори',
    description:
      'Обсъжданията се разклонява на клонове, като всеки може да отговаря директно на друг коментар.',
    span: '',
    illustration: NestedRepliesSvg,
  },
  {
    title: 'Актуализации в реално време',
    description:
      'Маркери за нова активност в обсъжданията. Виж нови отговори и популярни дискусии в момента, в който се появяват.',
    span: '',
    illustration: RealtimeUpdatesSvg,
  },
  {
    title: 'Репутация на потребителя',
    description:
      'Геймифицирана система за доверие. Печели точки репутация чрез полезни отговори и качествени приноси към общността.',
    span: '',
    illustration: UserReputationSvg,
  },
  {
    title: 'Модерация от общността',
    description:
      'Контролът върху съдържанието е в ръцете на потребителите. Поддържай добри отговори, сигнализирай неподходящо съдържание и пази за хеалта на общността.',
    span: '',
    illustration: CommunityModSvg,
  },
];

/* ---------- Animation variants ---------- */
const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring' as const, bounce: 0.25, duration: 0.6 },
  },
};

/* ---------- Feature Card ---------- */
function FeatureCard({ feature }: { feature: Feature }) {
  const Illustration = feature.illustration;

  return (
    <motion.div
      variants={cardVariants}
      whileHover={{ scale: 1.015 }}
      className="group relative overflow-hidden rounded-2xl p-6 liquid-glass cursor-default feature-card-hover"
    >
      {/* Accent gradient overlay on hover */}
      <div className="absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100 pointer-events-none feature-card-glow" />

      <div className="relative flex flex-col sm:flex-row items-center gap-5">
        {/* Text zone */}
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-semibold font-[family-name:var(--font-display)] text-foreground leading-tight mb-1.5">
            {feature.title}
          </h3>
          <p className="text-sm leading-relaxed text-muted-foreground">
            {feature.description}
          </p>
        </div>

        {/* Illustration zone */}
        <div className="w-full sm:w-auto sm:flex-1 flex justify-center">
          <Illustration className="w-28 h-28 sm:w-32 sm:h-32 text-accent" />
        </div>
      </div>
    </motion.div>
  );
}

/* ---------- Main component ---------- */
export function FeatureShowcase() {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.15 });

  return (
    <section
      id="features"
      ref={sectionRef}
      className="section-spacing mx-auto max-w-5xl px-6"
    >
      {/* Editorial section header */}
      <div className="mb-12 text-center">
        <h2 className="mb-3">Какво прави RedRep различен?</h2>
        <p className="mx-auto max-w-lg text-muted-foreground">
          Създаден специално за академични общности — всяка функция е
          дизайнирана така, че да превръща въпросите в знания.
        </p>
      </div>

      {/* Bento grid */}
      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 gap-4"
        variants={containerVariants}
        initial="hidden"
        animate={isInView ? 'visible' : 'hidden'}
      >
        {FEATURES.map((feature) => (
          <FeatureCard key={feature.title} feature={feature} />
        ))}
      </motion.div>
    </section>
  );
}
