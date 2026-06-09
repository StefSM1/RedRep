import { useRef, useState, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Package, Cloud, Server, HeartPulse, Layers, Play } from 'lucide-react';

/* ─── Types ─── */
interface DeployStage {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  substeps: string[];
}

/* ─── Stage data ─── */
const STAGES: DeployStage[] = [
  {
    id: 'build',
    title: 'Build Image',
    description:
      'A Dockerfile stacks your code on top of a Node.js runtime and a slim OS base image. Each instruction becomes a cacheable layer.',
    icon: Package,
    substeps: [
      'FROM node:20-alpine — base OS',
      'COPY package*.json & npm ci',
      'COPY source code into image',
      'Result: a portable Docker image',
    ],
  },
  {
    id: 'registry',
    title: 'Push to Registry',
    description:
      'The image is tagged, signed, and pushed to a container registry — a centralized library any server can pull from.',
    icon: Cloud,
    substeps: [
      'Tag image with version / git SHA',
      'Push to GitHub Container Registry',
      'Signed with cosign for safety',
    ],
  },
  {
    id: 'deploy',
    title: 'Deploy & Balance',
    description:
      'The orchestrator pulls the image and starts containers. A load balancer distributes traffic across healthy replicas.',
    icon: Server,
    substeps: [
      'Pull image from registry',
      'Spin up 3 container replicas',
      'Load balancer routes via round-robin',
    ],
  },
  {
    id: 'scale',
    title: 'Self-Heal & Scale',
    description:
      'Health checks ping each container. Failures are killed and replaced automatically — zero downtime.',
    icon: HeartPulse,
    substeps: [
      'HTTP health probe every 10s',
      '3 failures → terminate pod',
      'Replacement auto-starts',
    ],
  },
];

const PHASE_MS = 1600;
const PHASE_GAP = 400;

/* ─── SVG layout constants (viewBox 0 0 480 200) ─── */
const ACCENT = 'oklch(0.55 0.15 270)';
const ACCENT_GLOW = 'oklch(0.55 0.20 270)';
const G1 = 'oklch(0.75 0.18 70)';   // amber
const G2 = 'oklch(0.68 0.16 230)';  // blue
const G3 = 'oklch(0.68 0.18 155)';  // green
const G4 = 'oklch(0.65 0.18 330)';  // pink
const SURFACE = 'oklch(0.14 0.02 260)';
const BORDER = 'oklch(0.55 0.15 270 / 0.5)';

/* ─── Component ─── */
export function ContainerSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const [hasEntered, setHasEntered] = useState(false);
  const [activeStage, setActiveStage] = useState(-1);
  const [isAnimating, setIsAnimating] = useState(false);
  const [visibleStages, setVisibleStages] = useState<number[]>([]);
  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const prevStageRef = useRef(-1);
  const hasAutoPlayed = useRef(false);

  /* IntersectionObserver */
  const setRef = useCallback((node: HTMLElement | null) => {
    (sectionRef as React.MutableRefObject<HTMLElement | null>).current = node;
    if (!node) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setHasEntered(true); obs.disconnect(); } },
      { threshold: 0.12 },
    );
    obs.observe(node);
  }, []);

  /* Auto-play all stages once when section enters viewport */
  useEffect(() => {
    if (!hasEntered || hasAutoPlayed.current) return;
    hasAutoPlayed.current = true;

    const autoTimeouts: ReturnType<typeof setTimeout>[] = [];
    let delay = 600;

    for (let i = 0; i < STAGES.length; i++) {
      autoTimeouts.push(setTimeout(() => setActiveStage(i), delay));
      delay += PHASE_MS + PHASE_GAP;
    }

    return () => autoTimeouts.forEach(clearTimeout);
  }, [hasEntered]);

  const clearAll = useCallback(() => {
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];
  }, []);

  /* Animation sequencing — same pattern as EncryptionSection */
  useEffect(() => {
    if (activeStage < 0) return;
    clearAll();
    const prev = prevStageRef.current;
    let start: number;

    if (prev >= 0 && activeStage > prev) {
      start = prev + 1;
      setVisibleStages(Array.from({ length: prev + 1 }, (_, i) => i));
    } else {
      start = 0;
      setVisibleStages([]);
    }

    prevStageRef.current = activeStage;
    setIsAnimating(true);
    let elapsed = 0;

    for (let s = start; s <= activeStage; s++) {
      const idx = s;
      timeoutsRef.current.push(setTimeout(() => {
        setVisibleStages(p => [...p, idx]);
      }, elapsed));
      elapsed += PHASE_MS;
      if (s < activeStage) elapsed += PHASE_GAP;
      else timeoutsRef.current.push(setTimeout(() => setIsAnimating(false), elapsed));
    }
    return clearAll;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeStage]);

  const handleClick = useCallback((i: number) => {
    if (i === activeStage && !isAnimating) {
      /* Replay same stage: reset then re-trigger */
      prevStageRef.current = i - 1;
      setVisibleStages(Array.from({ length: i }, (_, k) => k));
      setActiveStage(-1);
      setTimeout(() => setActiveStage(i), 50);
    } else {
      setActiveStage(i);
    }
  }, [activeStage, isAnimating]);

  const headerAnim = hasEntered ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 };
  const vis = (i: number) => visibleStages.includes(i);

  return (
    <section ref={setRef} className="section-spacing mx-auto max-w-6xl px-6">
      {/* Header */}
      <motion.div
        className="mb-8 text-center"
        initial={{ opacity: 0, y: 16 }}
        animate={headerAnim}
        transition={{ duration: 0.5 }}
      >
        <h2 className="mb-3">Scaling with Containers</h2>
        <p className="mx-auto max-w-xl text-muted-foreground">
          From one laptop to thousands of users — how RedRep stays fast
          with Docker and container orchestration.
        </p>
      </motion.div>

      {/* Prompt */}
      {activeStage < 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={hasEntered ? { opacity: 1 } : {}}
          transition={{ delay: 0.3 }}
          className="flex items-center gap-2 p-3 rounded-xl bg-accent/[0.04] border border-accent/15 border-dashed mb-6 max-w-md mx-auto"
        >
          <Play className="size-4 text-accent shrink-0" />
          <p className="text-sm text-muted-foreground">
            Click a step below to watch the container pipeline in action.
          </p>
        </motion.div>
      )}

      {/* ─── Full-width SVG diagram (2× large) ─── */}
      <div className="w-full">
        <div className="relative w-full" style={{ aspectRatio: '480/155' }}>
            <svg
              viewBox="0 0 480 155"
              fill="none"
              preserveAspectRatio="xMidYMin meet"
              className="absolute inset-0 w-full h-full"
              aria-hidden="true"
            >
              <defs>
                <filter id="cg"><feDropShadow dx="0" dy="0" stdDeviation="3" floodColor={ACCENT_GLOW} floodOpacity="0.5" /></filter>
                <filter id="cg1"><feDropShadow dx="0" dy="0" stdDeviation="3" floodColor={G1} floodOpacity="0.6" /></filter>
                <filter id="cg2"><feDropShadow dx="0" dy="0" stdDeviation="3" floodColor={G2} floodOpacity="0.6" /></filter>
                <filter id="cg3"><feDropShadow dx="0" dy="0" stdDeviation="3" floodColor={G3} floodOpacity="0.6" /></filter>
                <filter id="cg4"><feDropShadow dx="0" dy="0" stdDeviation="3" floodColor={G4} floodOpacity="0.6" /></filter>
              </defs>


              {/* ═══════════════════════════════════════════
                  STAGE 1 — BUILD (x: 10–118)
                  ═══════════════════════════════════════════ */}
              <g>
                {/* Stage label */}
                <motion.text x="64" y="18" textAnchor="middle" fontSize="7" fontFamily="var(--font-mono)" fontWeight="700" fill={G1}
                  initial={{ opacity: 0 }} animate={hasEntered ? { opacity: 1 } : {}} transition={{ delay: 0.15 }}
                  style={{ filter: 'url(#cg1)' }}
                >BUILD</motion.text>

                {/* Code editor box */}
                <motion.g
                  initial={{ opacity: 0, y: 8 }}
                  animate={hasEntered ? { opacity: 1, y: 0 } : {}}
                  transition={{ delay: 0.2, duration: 0.4 }}
                >
                  <rect x="14" y="28" width="100" height="48" rx="4" fill={SURFACE} stroke={BORDER} strokeWidth="0.8" />
                  {/* Title bar */}
                  <line x1="14" y1="36" x2="114" y2="36" stroke={BORDER} strokeWidth="0.5" />
                  <circle cx="20" cy="32" r="1.5" fill="oklch(0.65 0.22 25)" />
                  <circle cx="26" cy="32" r="1.5" fill="oklch(0.75 0.18 70)" />
                  <circle cx="32" cy="32" r="1.5" fill="oklch(0.70 0.18 155)" />
                  <text x="50" y="33" fontSize="3.5" fontFamily="var(--font-mono)" fill="oklch(0.60 0.02 260)">Dockerfile</text>
                  {/* Code lines */}
                  <text x="19" y="44" fontSize="3.8" fontFamily="var(--font-mono)" fill={G1}>FROM node:20-alpine</text>
                  <text x="19" y="51" fontSize="3.8" fontFamily="var(--font-mono)" fill="oklch(0.68 0.15 155)">COPY . .</text>
                  <text x="19" y="58" fontSize="3.8" fontFamily="var(--font-mono)" fill={G2}>RUN npm ci</text>
                  <text x="19" y="65" fontSize="3.8" fontFamily="var(--font-mono)" fill="oklch(0.70 0.15 80)">EXPOSE 3000</text>
                </motion.g>

                {/* Layer stack */}
                {[
                  { label: 'OS Base', y: 114, color: 'oklch(0.35 0.05 260 / 0.7)', stroke: BORDER },
                  { label: 'Node.js', y: 100, color: 'oklch(0.35 0.08 160 / 0.6)', stroke: 'oklch(0.60 0.15 160 / 0.6)' },
                  { label: 'App', y: 86, color: 'oklch(0.40 0.10 70 / 0.5)', stroke: G1 },
                ].map((l, li) => (
                  <motion.g key={l.label}
                    initial={{ opacity: 0, y: 12 }}
                    animate={vis(0) ? { opacity: 1, y: 0 } : {}}
                    transition={{ delay: 0.4 + li * 0.35, duration: 0.4, type: 'spring', bounce: 0.3 }}
                  >
                    <rect x="22" y={l.y} width="84" height="12" rx="2.5" fill={l.color} stroke={l.stroke} strokeWidth="0.8"
                      style={{ filter: li === 2 ? 'url(#cg1)' : undefined }} />
                    <text x="64" y={l.y + 8.5} textAnchor="middle" fontSize="5" fontFamily="var(--font-mono)" fontWeight="600"
                      fill="oklch(0.92 0.01 260)">{l.label}</text>
                  </motion.g>
                ))}

                {/* "image" label */}
                <motion.text x="64" y="140" textAnchor="middle" fontSize="4.5" fontFamily="var(--font-mono)" fill={G1}
                  initial={{ opacity: 0 }} animate={vis(0) ? { opacity: 0.7 } : {}} transition={{ delay: 1.2 }}
                >docker image ✓</motion.text>
              </g>

              {/* ═══════════════════════════════════════════
                  STAGE 2 — REGISTRY (x: 130–238)
                  ═══════════════════════════════════════════ */}
              <g>
                <motion.text x="184" y="18" textAnchor="middle" fontSize="7" fontFamily="var(--font-mono)" fontWeight="700" fill={G2}
                  initial={{ opacity: 0 }} animate={hasEntered ? { opacity: 1 } : {}} transition={{ delay: 0.2 }}
                  style={{ filter: 'url(#cg2)' }}
                >REGISTRY</motion.text>

                {/* Upload arrow: curved path from build image → cloud */}
                <motion.path
                  d="M108,120 C125,120 140,90 158,78"
                  stroke={G2} strokeWidth="1.2" strokeLinecap="round" fill="none"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={vis(1) ? { pathLength: 1, opacity: 1 } : {}}
                  transition={{ delay: 0.2, duration: 0.7, ease: 'easeInOut' }}
                  style={{ filter: 'url(#cg2)' }}
                />

                {/* Traveling package dot along the curve */}
                {vis(1) && (
                  <motion.circle r="3" fill={G2}
                    initial={{ offsetDistance: '0%', opacity: 0 }}
                    animate={{ offsetDistance: '100%', opacity: [0, 1, 1, 0] }}
                    transition={{ delay: 0.3, duration: 0.8, ease: 'easeInOut', times: [0, 0.15, 0.85, 1] }}
                    style={{ offsetPath: 'path("M108,120 C125,120 140,90 158,78")', filter: 'url(#cg2)' }}
                  />
                )}

                {/* Cloud shape */}
                <motion.g
                  initial={{ opacity: 0, y: 6 }}
                  animate={vis(1) ? { opacity: 1, y: 0 } : {}}
                  transition={{ delay: 0.5, duration: 0.5, type: 'spring', bounce: 0.25 }}
                >
                  <path
                    d="M155,80 Q155,58 172,56 Q188,52 196,62 Q200,56 210,58 Q220,62 218,74 Q222,76 220,82 Q218,88 210,88 L160,88 Q152,88 152,82 Z"
                    fill="oklch(0.18 0.03 230 / 0.6)" stroke={G2} strokeWidth="0.9"
                    style={{ filter: 'url(#cg2)' }}
                  />
                  <text x="186" y="74" textAnchor="middle" fontSize="5" fontFamily="var(--font-mono)" fontWeight="600" fill="oklch(0.92 0.01 260)">ghcr.io</text>
                  <text x="186" y="82" textAnchor="middle" fontSize="3.5" fontFamily="var(--font-mono)" fill="oklch(0.70 0.02 260)">redrep:v2.1.0</text>
                </motion.g>

                {/* Version tags */}
                <motion.g
                  initial={{ opacity: 0 }}
                  animate={vis(1) ? { opacity: 1 } : {}}
                  transition={{ delay: 0.9, duration: 0.3 }}
                >
                  {['latest', 'v2.1.0', 'sha:a3f2c'].map((tag, ti) => (
                    <g key={tag}>
                      <rect x={152 + ti * 22} y="94" width="20" height="8" rx="2" fill="oklch(0.22 0.04 230 / 0.5)" stroke={G2} strokeWidth="0.5" />
                      <text x={162 + ti * 22} y="100" textAnchor="middle" fontSize="3.2" fontFamily="var(--font-mono)" fill={G2}>{tag}</text>
                    </g>
                  ))}
                </motion.g>

                {/* Signed badge */}
                <motion.g
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={vis(1) ? { opacity: 1, scale: 1 } : {}}
                  transition={{ delay: 1.1, duration: 0.3 }}
                  style={{ transformOrigin: '184px 112px' }}
                >
                  <rect x="162" y="108" width="44" height="10" rx="3" fill="oklch(0.35 0.10 160 / 0.4)" stroke="oklch(0.65 0.15 160)" strokeWidth="0.5" />
                  <text x="184" y="115.5" textAnchor="middle" fontSize="4" fontFamily="var(--font-mono)" fontWeight="600" fill="oklch(0.72 0.18 155)">✓ signed</text>
                </motion.g>

                {/* Pull arrow: cloud → deploy stage */}
                <motion.path
                  d="M218,78 C238,78 244,90 258,100"
                  stroke={G2} strokeWidth="1" strokeLinecap="round" fill="none" strokeDasharray="3 2"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={vis(1) ? { pathLength: 1, opacity: 0.7 } : {}}
                  transition={{ delay: 1.0, duration: 0.5 }}
                />
              </g>

              {/* ═══════════════════════════════════════════
                  STAGE 3 — DEPLOY (x: 250–368)
                  ═══════════════════════════════════════════ */}
              <g>
                <motion.text x="310" y="18" textAnchor="middle" fontSize="7" fontFamily="var(--font-mono)" fontWeight="700" fill={G3}
                  initial={{ opacity: 0 }} animate={hasEntered ? { opacity: 1 } : {}} transition={{ delay: 0.25 }}
                  style={{ filter: 'url(#cg3)' }}
                >DEPLOY</motion.text>

                {/* Orchestrator node */}
                <motion.g
                  initial={{ opacity: 0, y: 6 }}
                  animate={vis(2) ? { opacity: 1, y: 0 } : {}}
                  transition={{ delay: 0.2, duration: 0.4 }}
                >
                  <rect x="280" y="30" width="60" height="22" rx="4" fill={SURFACE} stroke={G3} strokeWidth="0.9" style={{ filter: 'url(#cg3)' }} />
                  <text x="310" y="44" textAnchor="middle" fontSize="4.5" fontFamily="var(--font-mono)" fontWeight="600" fill={G3}>k8s</text>
                </motion.g>

                {/* Lines from orchestrator down to containers */}
                {[0, 1, 2].map(ci => {
                  const cx = 275 + ci * 26;
                  return (
                    <motion.line key={`ol-${ci}`}
                      x1="310" y1="52" x2={cx + 10} y2="80"
                      stroke={G3} strokeWidth="0.7" strokeDasharray="2 1.5" strokeLinecap="round"
                      initial={{ pathLength: 0, opacity: 0 }}
                      animate={vis(2) ? { pathLength: 1, opacity: 0.6 } : {}}
                      transition={{ delay: 0.5 + ci * 0.2, duration: 0.3 }}
                    />
                  );
                })}

                {/* 3 Container boxes */}
                {[0, 1, 2].map(ci => {
                  const cx = 265 + ci * 30;
                  return (
                    <motion.g key={`c-${ci}`}
                      initial={{ opacity: 0, scale: 0.4 }}
                      animate={vis(2) ? { opacity: 1, scale: 1 } : {}}
                      transition={{ delay: 0.6 + ci * 0.3, duration: 0.5, type: 'spring', bounce: 0.35 }}
                      style={{ transformOrigin: `${cx + 12}px 96px` }}
                    >
                      <rect x={cx} y="80" width="24" height="32" rx="3" fill={SURFACE} stroke={G3} strokeWidth="0.9"
                        style={{ filter: 'url(#cg3)' }} />
                      {/* Container "code" lines */}
                      <line x1={cx + 4} y1="87" x2={cx + 20} y2="87" stroke="oklch(0.60 0.02 260 / 0.4)" strokeWidth="0.5" />
                      <line x1={cx + 4} y1="92" x2={cx + 16} y2="92" stroke="oklch(0.60 0.02 260 / 0.3)" strokeWidth="0.5" />
                      <line x1={cx + 4} y1="97" x2={cx + 18} y2="97" stroke="oklch(0.60 0.02 260 / 0.25)" strokeWidth="0.5" />
                      {/* Status LED */}
                      <circle cx={cx + 12} cy="105" r="2" fill={G3} />
                    </motion.g>
                  );
                })}

                {/* Load balancer bar above containers */}
                <motion.g
                  initial={{ opacity: 0, scaleX: 0 }}
                  animate={vis(2) ? { opacity: 1, scaleX: 1 } : {}}
                  transition={{ delay: 1.0, duration: 0.4 }}
                  style={{ transformOrigin: '310px 72px' }}
                >
                  <rect x="258" y="68" width="104" height="10" rx="3" fill="oklch(0.18 0.04 155 / 0.5)" stroke={G3} strokeWidth="0.7" />
                  <text x="310" y="75.5" textAnchor="middle" fontSize="4" fontFamily="var(--font-mono)" fontWeight="600" fill="oklch(0.92 0.01 260)">Load Balancer</text>
                </motion.g>

                {/* Incoming traffic arrows — originate from the registry pull path */}
                <motion.g
                  initial={{ opacity: 0 }}
                  animate={vis(2) ? { opacity: 1 } : {}}
                  transition={{ delay: 1.3, duration: 0.3 }}
                >
                  {/* Curved path from registry area down into the load balancer */}
                  <motion.path
                    d="M235,80 C242,72 250,68 258,72"
                    stroke={ACCENT} strokeWidth="1" strokeLinecap="round" fill="none" strokeDasharray="2.5 1.5"
                    initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
                    transition={{ delay: 1.3, duration: 0.5 }}
                    style={{ filter: 'url(#cg)' }}
                  />
                  <text x="238" y="64" textAnchor="middle" fontSize="3.2" fontFamily="var(--font-mono)" fill="oklch(0.60 0.02 260)">traffic</text>
                </motion.g>

                {/* Labels */}
                <motion.text x="310" y="126" textAnchor="middle" fontSize="4" fontFamily="var(--font-mono)" fill={G3}
                  initial={{ opacity: 0 }} animate={vis(2) ? { opacity: 0.7 } : {}} transition={{ delay: 1.5 }}
                >3 healthy replicas</motion.text>
              </g>

              {/* ═══════════════════════════════════════════
                  STAGE 4 — SCALE / SELF-HEAL (x: 370–478)
                  ═══════════════════════════════════════════ */}
              <g>
                <motion.text x="424" y="18" textAnchor="middle" fontSize="7" fontFamily="var(--font-mono)" fontWeight="700" fill={G4}
                  initial={{ opacity: 0 }} animate={hasEntered ? { opacity: 1 } : {}} transition={{ delay: 0.3 }}
                  style={{ filter: 'url(#cg4)' }}
                >SELF-HEAL</motion.text>

                {/* Healthy container */}
                <motion.g
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={vis(3) ? { opacity: 1, scale: 1 } : {}}
                  transition={{ delay: 0.2, duration: 0.4, type: 'spring', bounce: 0.3 }}
                  style={{ transformOrigin: '393px 60px' }}
                >
                  <rect x="380" y="40" width="26" height="36" rx="3" fill={SURFACE} stroke={G3} strokeWidth="0.9" style={{ filter: 'url(#cg3)' }} />
                  <circle cx="393" cy="68" r="2.5" fill={G3} />
                  <text x="393" y="86" textAnchor="middle" fontSize="3.5" fontFamily="var(--font-mono)" fill={G3}>healthy</text>
                </motion.g>

                {/* Failing container: green → red pulse → X */}
                <motion.g
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={vis(3) ? { opacity: [0, 1, 1, 0.35], scale: [0.5, 1, 1, 0.9] } : {}}
                  transition={{ delay: 0.4, duration: 2.4, times: [0, 0.15, 0.45, 1] }}
                  style={{ transformOrigin: '428px 60px' }}
                >
                  <motion.rect x="415" y="40" width="26" height="36" rx="3" fill={SURFACE}
                    initial={{ stroke: G3, strokeWidth: 0.9 }}
                    animate={vis(3)
                      ? { stroke: [G3, G3, 'oklch(0.65 0.22 25)', 'oklch(0.65 0.22 25)'], strokeWidth: [0.9, 0.9, 1.4, 1.4] }
                      : {}}
                    transition={{ delay: 0.4, duration: 2.4, times: [0, 0.3, 0.5, 1] }}
                  />
                  {/* Health check dots: green → red */}
                  <motion.circle cx="428" cy="68" r="2.5"
                    initial={{ fill: G3 }}
                    animate={vis(3)
                      ? { fill: [G3, G3, 'oklch(0.65 0.22 25)', 'oklch(0.65 0.22 25)'] }
                      : {}}
                    transition={{ delay: 0.4, duration: 2.4, times: [0, 0.35, 0.5, 1] }}
                  />
                  {/* X mark */}
                  <motion.g
                    initial={{ opacity: 0 }}
                    animate={vis(3) ? { opacity: [0, 0, 1, 1] } : {}}
                    transition={{ delay: 0.4, duration: 2.4, times: [0, 0.45, 0.55, 1] }}
                  >
                    <line x1="423" y1="50" x2="433" y2="62" stroke="oklch(0.65 0.22 25)" strokeWidth="1.8" strokeLinecap="round" />
                    <line x1="433" y1="50" x2="423" y2="62" stroke="oklch(0.65 0.22 25)" strokeWidth="1.8" strokeLinecap="round" />
                  </motion.g>
                  <text x="428" y="86" textAnchor="middle" fontSize="3.5" fontFamily="var(--font-mono)" fill="oklch(0.65 0.22 25)">failing</text>
                </motion.g>

                {/* Replacement container: appears after failure */}
                <motion.g
                  initial={{ opacity: 0, y: -10, scale: 0.3 }}
                  animate={vis(3)
                    ? { opacity: [0, 0, 0, 1], y: [-10, -10, -10, 0], scale: [0.3, 0.3, 0.3, 1] }
                    : {}}
                  transition={{ delay: 0.4, duration: 2.6, times: [0, 0.65, 0.78, 1], type: 'spring', bounce: 0.4 }}
                  style={{ transformOrigin: '463px 60px' }}
                >
                  <rect x="450" y="40" width="26" height="36" rx="3" fill={SURFACE} stroke={G3} strokeWidth="0.9"
                    style={{ filter: 'url(#cg3)' }} />
                  <circle cx="463" cy="68" r="2.5" fill={G3} />
                  <text x="463" y="86" textAnchor="middle" fontSize="3.5" fontFamily="var(--font-mono)" fill={G3}>replaced</text>
                </motion.g>

                {/* Health check wave lines from monitor */}
                <motion.g
                  initial={{ opacity: 0 }}
                  animate={vis(3) ? { opacity: 1 } : {}}
                  transition={{ delay: 1.6 }}
                >
                  {/* Monitor box */}
                  <rect x="388" y="100" width="72" height="28" rx="4" fill={SURFACE} stroke={G4} strokeWidth="0.8" style={{ filter: 'url(#cg4)' }} />
                  <text x="424" y="113" textAnchor="middle" fontSize="4" fontFamily="var(--font-mono)" fontWeight="600" fill={G4}>health check</text>
                  <text x="424" y="122" textAnchor="middle" fontSize="3.2" fontFamily="var(--font-mono)" fill="oklch(0.60 0.02 260)">GET /healthz</text>
                </motion.g>

                {/* Upward arrows from monitor to containers */}
                {[393, 428, 463].map((cx, ci) => (
                  <motion.line key={`hl-${ci}`}
                    x1={cx} y1="100" x2={cx} y2="78"
                    stroke={G4} strokeWidth="0.6" strokeDasharray="1.5 1" strokeLinecap="round"
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={vis(3) ? { pathLength: 1, opacity: 0.5 } : {}}
                    transition={{ delay: 1.8 + ci * 0.1, duration: 0.3 }}
                  />
                ))}

                {/* Auto-restart label */}
                <motion.text x="424" y="145" textAnchor="middle" fontSize="4.5" fontFamily="var(--font-mono)" fontWeight="600" fill={G4}
                  initial={{ opacity: 0 }}
                  animate={vis(3) ? { opacity: 1 } : {}}
                  transition={{ delay: 2.2 }}
                  style={{ filter: 'url(#cg4)' }}
                >auto-restart ✓</motion.text>
              </g>
            </svg>
          </div>
        </div>

      {/* ─── Stage cards: horizontal row below diagram ─── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-0.5">
        {STAGES.map((stage, i) => {
          const Icon = stage.icon;
          const isActive = i === activeStage;
          const isDone = vis(i) && !isActive;
          return (
            <motion.div
              key={stage.id}
              initial={{ opacity: 0, y: 12 }}
              animate={hasEntered ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.15 + i * 0.08, duration: 0.4 }}
              onClick={() => handleClick(i)}
              role="button"
              tabIndex={0}
              onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') handleClick(i); }}
              className={`flex flex-col items-start gap-2 p-3 rounded-xl cursor-pointer transition-all duration-300 ${
                isActive && isAnimating
                  ? 'liquid-glass ring-1 ring-accent/40'
                  : isActive
                    ? 'liquid-glass ring-1 ring-accent/25'
                    : isDone
                      ? 'bg-accent/[0.04]'
                      : 'hover:bg-accent/[0.03]'
              }`}
            >
              <div className="flex items-center gap-2 w-full">
                <span className={`text-xs font-mono font-medium transition-colors duration-300 ${
                  isActive ? 'text-accent' : isDone ? 'text-accent/50' : 'text-muted-foreground/50'
                }`}>
                  {String(i + 1).padStart(2, '0')}
                </span>
                <div className={`flex size-8 items-center justify-center rounded-lg transition-colors duration-300 ${
                  isActive
                    ? 'bg-accent/15 text-accent'
                    : isDone
                      ? 'bg-accent/8 text-accent/60'
                      : 'bg-muted text-muted-foreground'
                }`}>
                  <Icon className="size-4" />
                </div>
                <h4 className={`text-sm font-semibold font-[family-name:var(--font-display)] transition-colors duration-300 ${
                  isActive ? 'text-foreground' : isDone ? 'text-foreground/70' : 'text-foreground/50'
                }`}>
                  {stage.title}
                </h4>
              </div>
              <p className={`text-xs leading-relaxed transition-colors duration-300 ${
                isActive || isDone ? 'text-muted-foreground' : 'text-muted-foreground/40'
              }`}>
                {stage.description}
              </p>
              <ul className={`space-y-0.5 transition-all duration-300 ${
                isActive || isDone ? 'opacity-100 max-h-40' : 'opacity-0 max-h-0 overflow-hidden'
              }`}>
                {stage.substeps.map(s => (
                  <li key={s} className="text-[11px] font-mono text-muted-foreground/80 flex items-start gap-1.5">
                    <span className="text-accent/70 mt-0.5">›</span>
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
              {isActive && !isAnimating && (
                <p className="text-[10px] font-mono text-accent/60 mt-0.5">click to replay</p>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Summary */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={hasEntered ? { opacity: 1 } : {}}
        transition={{ delay: 0.8 }}
        className="flex items-center gap-2 p-3 rounded-xl bg-accent/[0.04] border border-accent/15 mt-6 max-w-2xl mx-auto"
      >
        <Layers className="size-4 text-accent shrink-0" />
        <p className="text-xs text-muted-foreground leading-relaxed">
          <span className="font-semibold text-foreground">End result:</span>{' '}
          A single commit is built, pushed, and deployed across multiple
          containers. If any instance fails, the orchestrator replaces it
          — your users never notice a thing.
        </p>
      </motion.div>
    </section>
  );
}
