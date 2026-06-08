import { useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { Monitor, Server, Database, Shield, Search } from 'lucide-react';

/* ---------- Types ---------- */
type LayerId = 'frontend' | 'api' | 'auth' | 'database' | 'search';

interface ArchNode {
  id: LayerId;
  icon: React.ElementType;
  title: string;
  tech: string;
  description: string;
  left: string;
  top: string;
}

interface Connection {
  from: LayerId;
  to: LayerId;
  d: string;
}

/* ---------- Node positions (viewBox 0 0 100 100, centered) ---------- */
const NODES: ArchNode[] = [
  {
    id: 'frontend',
    icon: Monitor,
    title: 'Frontend',
    tech: 'React SPA',
    description:
      'Single-page application with React 19, TypeScript, and Tailwind CSS v4. All rendering, routing, and interactions are client-side.',
    left: '50%',
    top: '12%',
  },
  {
    id: 'api',
    icon: Server,
    title: 'API Layer',
    tech: 'REST / GraphQL',
    description:
      'Centralized gateway for client-server communication. RESTful endpoints with optional GraphQL for flexible queries.',
    left: '25%',
    top: '46%',
  },
  {
    id: 'auth',
    icon: Shield,
    title: 'Auth Service',
    tech: 'JWT + OAuth',
    description:
      'Authentication, session management, and role-based access control using JWT tokens with OAuth providers.',
    left: '75%',
    top: '46%',
  },
  {
    id: 'database',
    icon: Database,
    title: 'Database',
    tech: 'PostgreSQL',
    description:
      'Relational store for threads, replies, users, and categories. Indexed for fast full-text search and nested queries.',
    left: '35%',
    top: '82%',
  },
  {
    id: 'search',
    icon: Search,
    title: 'Search Service',
    tech: 'Full-Text Index',
    description:
      'Dedicated full-text search over titles and bodies with filtering by category, tags, and date range.',
    left: '65%',
    top: '82%',
  },
];

/* ---------- Connection paths (viewBox 0 0 100 100) ---------- */
/* Paths connect the CENTER of each node (matching left/top % values) */
const CONNECTIONS: Connection[] = [
  { from: 'frontend', to: 'api', d: 'M50,12 C50,30 25,30 25,46' },
  { from: 'frontend', to: 'auth', d: 'M50,12 C50,30 75,30 75,46' },
  { from: 'api', to: 'database', d: 'M25,46 C25,64 35,64 35,82' },
  { from: 'api', to: 'search', d: 'M25,46 C25,68 65,68 65,82' },
  { from: 'auth', to: 'database', d: 'M75,46 C75,68 35,68 35,82' },
];

/* ---------- Helpers ---------- */
function isNodeConnected(nodeId: LayerId, activeId: LayerId | null): boolean {
  if (!activeId) return false;
  if (nodeId === activeId) return true;
  return CONNECTIONS.some(
    (c) =>
      (c.from === activeId && c.to === nodeId) ||
      (c.to === activeId && c.from === nodeId)
  );
}

/* CSS keyframe for node entry (avoids Framer Motion transform on positioned elements) */
const nodeEntryStyle = (i: number, isInView: boolean): React.CSSProperties => ({
  opacity: isInView ? 1 : 0,
  transition: `opacity 0.4s ease ${0.3 + i * 0.12}s`,
});

/* ---------- Main component ---------- */
export function ArchitectureSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.15 });
  const [activeNode, setActiveNode] = useState<LayerId | null>(null);

  return (
    <section ref={sectionRef} className="section-spacing mx-auto max-w-5xl px-6">
      {/* Header */}
      <div className="mb-10 text-center">
        <h2 className="mb-3">How It&rsquo;s Built</h2>
        <p className="mx-auto max-w-lg text-muted-foreground">
          Five layers working together — from pixel to persistence.
          Hover any layer to trace its connections.
        </p>
      </div>

      {/* Split layout: diagram left, descriptions right */}
      <div className="grid grid-cols-1 lg:grid-cols-[3fr_2.5fr] gap-8 items-start">
        {/* ─── Left: SVG diagram ─── */}
        <div className="order-1 lg:order-1">
          <div className="relative w-full" style={{ aspectRatio: '4/3', minHeight: 360 }}>
            {/* SVG connection paths */}
            <svg
              viewBox="0 0 100 100"
              fill="none"
              preserveAspectRatio="none"
              className="absolute inset-0 w-full h-full"
              aria-hidden="true"
            >
              {CONNECTIONS.map((conn, i) => {
                const highlighted =
                  activeNode !== null &&
                  (conn.from === activeNode || conn.to === activeNode);
                return (
                  <motion.path
                    key={`${conn.from}-${conn.to}`}
                    d={conn.d}
                    stroke={highlighted ? 'oklch(0.60 0.22 270)' : 'oklch(0.55 0.15 270 / 0.55)'}
                    strokeWidth={highlighted ? '1.2' : '0.8'}
                    strokeLinecap="round"
                    fill="none"
                    style={{
                      opacity: highlighted ? 1 : 0.55,
                      filter: highlighted
                        ? 'drop-shadow(0 0 6px oklch(0.55 0.22 270 / 0.6))'
                        : 'drop-shadow(0 0 2px oklch(0.55 0.15 270 / 0.2))',
                      transition: 'opacity 0.25s, stroke 0.25s',
                    }}
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={
                      isInView
                        ? { pathLength: 1, opacity: highlighted ? 1 : 0.55 }
                        : { pathLength: 0, opacity: 0 }
                    }
                    transition={{
                      pathLength: {
                        duration: 1,
                        delay: 0.4 + i * 0.15,
                        ease: 'easeInOut',
                      },
                      opacity: { duration: 0.25 },
                    }}
                  />
                );
              })}
            </svg>

            {/* Node markers — icon circles with labels */}
            {NODES.map((node, i) => {
              const Icon = node.icon;
              const isActive = node.id === activeNode;
              const isConnected = isNodeConnected(node.id, activeNode);
              return (
                <div
                  key={node.id}
                  onMouseEnter={() => setActiveNode(node.id)}
                  onMouseLeave={() => setActiveNode(null)}
                  className="absolute cursor-pointer flex flex-col items-center"
                  style={{
                    left: node.left,
                    top: node.top,
                    transform: 'translate(-50%, -50%)',
                    ...nodeEntryStyle(i, isInView),
                  }}
                >
                  <div
                    className={`flex items-center justify-center rounded-full transition-all duration-300 ${
                      isActive
                        ? 'size-16 bg-accent/20 border-2 border-accent shadow-lg shadow-accent/20'
                        : isConnected
                          ? 'size-14 bg-accent/10 border-2 border-accent/40'
                          : 'size-[52px] bg-accent/8 border-2 border-accent/25 hover:bg-accent/15 hover:size-14'
                    }`}
                  >
                    <Icon
                      className={`transition-all duration-300 ${
                        isActive
                          ? 'size-7 text-accent'
                          : isConnected
                            ? 'size-6 text-accent'
                            : 'size-6 text-accent/70'
                      }`}
                    />
                  </div>
                  <span
                    className={`mt-2 text-sm font-medium font-[family-name:var(--font-display)] whitespace-nowrap transition-colors duration-300 ${
                      isActive
                        ? 'text-accent font-semibold'
                        : isConnected
                          ? 'text-foreground'
                          : 'text-muted-foreground'
                    }`}
                  >
                    {node.title}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* ─── Right: Layer descriptions ─── */}
        <div className="space-y-4 order-2 lg:order-2">
          {NODES.map((node) => {
            const Icon = node.icon;
            const isActive = node.id === activeNode;
            const isConnected = isNodeConnected(node.id, activeNode);
            return (
              <div
                key={node.id}
                onMouseEnter={() => setActiveNode(node.id)}
                onMouseLeave={() => setActiveNode(null)}
                className={`flex items-start gap-3 p-3 rounded-xl cursor-default transition-all duration-300 ${
                  isActive
                    ? 'liquid-glass ring-1 ring-accent/40'
                    : isConnected
                      ? 'bg-accent/[0.03]'
                      : 'hover:bg-accent/[0.02]'
                }`}
              >
                <div
                  className={`flex size-10 shrink-0 items-center justify-center rounded-lg transition-colors duration-300 ${
                    isActive || isConnected
                      ? 'bg-accent/15 text-accent'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  <Icon className="size-5" />
                </div>
                <div>
                  <div className="flex items-baseline gap-2">
                    <h4 className="text-base font-semibold font-[family-name:var(--font-display)] text-foreground">
                      {node.title}
                    </h4>
                    <span className="text-xs font-mono text-muted-foreground">
                      {node.tech}
                    </span>
                  </div>
                  <p className="text-sm leading-relaxed text-muted-foreground mt-1">
                    {node.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      {isInView && (
        <motion.p
          className="mt-8 text-center text-xs text-muted-foreground/50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.4 }}
        >
          Hover any layer to highlight its connections
        </motion.p>
      )}
    </section>
  );
}
