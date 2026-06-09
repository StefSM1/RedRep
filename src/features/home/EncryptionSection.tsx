import { useRef, useState, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Lock, Hand, FileKey, ArrowRight, Play } from 'lucide-react';

/* ---------- Types ---------- */
type Actor = 'client' | 'server';

interface HandshakePhase {
  id: string;
  label: string;
  description: string;
  from: Actor;
  to: Actor;
  color: string;
  icon: React.ElementType;
  technicalDetail: string;
}

/* ---------- Phase data ---------- */
const PHASES: HandshakePhase[] = [
  {
    id: 'client-hello',
    label: 'Client Hello',
    description: 'Browser sends supported cipher suites and a random number to the server.',
    from: 'client',
    to: 'server',
    color: 'oklch(0.70 0.18 30)',
    icon: Hand,
    technicalDetail: 'Supported ciphers, TLS version, and client random nonce',
  },
  {
    id: 'cert',
    label: 'Server Certificate',
    description: 'Server responds with its SSL certificate signed by a trusted CA — browser verifies the chain.',
    from: 'server',
    to: 'client',
    color: 'oklch(0.70 0.14 80)',
    icon: FileKey,
    technicalDetail: 'X.509 certificate chain with public key',
  },
  {
    id: 'key-exchange',
    label: 'Key Exchange',
    description: 'Both sides compute a shared secret using ECDHE — even if intercepted, the secret cannot be derived.',
    from: 'client',
    to: 'server',
    color: 'oklch(0.75 0.18 70)',
    icon: FileKey,
    technicalDetail: 'Elliptic Curve Diffie-Hellman key derivation',
  },
  {
    id: 'encrypted',
    label: 'Encrypted Tunnel',
    description: 'All data now uses AES-256-GCM symmetric encryption with the shared secret — fast and secure.',
    from: 'server',
    to: 'client',
    color: 'oklch(0.75 0.20 160)',
    icon: Lock,
    technicalDetail: 'AES-256-GCM symmetric encryption active',
  },
];

/* ---------- SVG layout ---------- */
const CLIENT_X = 10;
const SERVER_X = 110;
const BASELINE_Y = 40;

/* Each phase gets its own lane, well-spaced to avoid overlap.
   Forward paths (client→server) above baseline,
   reverse paths (server→client) below. */
const LANES = [
  { y: 12, dir: 'above' as const },
  { y: 55, dir: 'below' as const },
  { y: 25, dir: 'above' as const },
  { y: 68, dir: 'below' as const },
];

function circleFrames(fromX: number, toX: number, laneY: number) {
  return {
    cx: [fromX, fromX, toX, toX, toX],
    cy: [BASELINE_Y, laneY, laneY, BASELINE_Y, BASELINE_Y],
    opacity: [0, 1, 1, 1, 0],
  };
}

/* Three line segments for the rectangular path.
   Each segment animates with the SAME keyframe timing as the dot,
   so the line draws exactly where the dot has been. */
function lineSegments(fromX: number, toX: number, laneY: number) {
  return [
    { // Seg 1: vertical from baseline to lane
      x1: fromX, y1: BASELINE_Y, x2: fromX, y2: laneY,
      x1a: [fromX, fromX, fromX, fromX, fromX],
      y1a: [BASELINE_Y, BASELINE_Y, BASELINE_Y, BASELINE_Y, BASELINE_Y],
      x2a: [fromX, fromX, fromX, fromX, fromX],
      y2a: [BASELINE_Y, laneY, laneY, laneY, laneY],
    },
    { // Seg 2: horizontal across
      x1: fromX, y1: laneY, x2: toX, y2: laneY,
      x1a: [fromX, fromX, fromX, fromX, fromX],
      y1a: [laneY, laneY, laneY, laneY, laneY],
      x2a: [fromX, fromX, toX, toX, toX],
      y2a: [laneY, laneY, laneY, laneY, laneY],
    },
    { // Seg 3: vertical from lane to baseline
      x1: toX, y1: laneY, x2: toX, y2: BASELINE_Y,
      x1a: [toX, toX, toX, toX, toX],
      y1a: [laneY, laneY, laneY, laneY, laneY],
      x2a: [toX, toX, toX, toX, toX],
      y2a: [laneY, laneY, laneY, BASELINE_Y, BASELINE_Y],
    },
  ];
}

const PHASE_ANIM_MS = 1200;
const PHASE_GAP_MS = 400;

/* ---------- Main component ---------- */
export function EncryptionSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const [hasEntered, setHasEntered] = useState(false);

  /* Step-by-step navigation state */
  const [currentPhase, setCurrentPhase] = useState(-1);
  const [isAnimating, setIsAnimating] = useState(false);
  const [visiblePhases, setVisiblePhases] = useState<number[]>([]);
  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const prevPhaseRef = useRef(-1);

  /* IntersectionObserver for initial entrance */
  const setRef = useCallback((node: HTMLElement | null) => {
    (sectionRef as React.MutableRefObject<HTMLElement | null>).current = node;
    if (!node) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setHasEntered(true); observer.disconnect(); } },
      { threshold: 0.15 }
    );
    observer.observe(node);
  }, []);

  /* Clear all pending animation timeouts */
  const clearAllTimeouts = useCallback(() => {
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];
  }, []);

  /*
   * Core animation effect — runs ONLY when currentPhase changes.
   * Uses prevPhaseRef to determine play direction:
   *   - Forward by 1: play only the new phase
   *   - Forward skip / backward / replay: restart from 0, play to currentPhase
   */
  useEffect(() => {
    if (currentPhase < 0) return;

    clearAllTimeouts();

    const prev = prevPhaseRef.current;
    let playStart: number;

    if (prev >= 0 && currentPhase > prev) {
      /* Moving forward (next or skip): keep prior phases, animate from prev+1 */
      playStart = prev + 1;
      setVisiblePhases(Array.from({ length: prev + 1 }, (_, i) => i));
    } else {
      /* First click, backward, or replay: clear all, restart from beginning */
      playStart = 0;
      setVisiblePhases([]);
    }

    prevPhaseRef.current = currentPhase;
    setIsAnimating(true);

    /* Sequential phase animation chain */
    let elapsed = 0;

    for (let p = playStart; p <= currentPhase; p++) {
      /* Make this phase visible at this point in the timeline */
      const phaseIdx = p;
      const startId = setTimeout(() => {
        setVisiblePhases((prev2) => [...prev2, phaseIdx]);
      }, elapsed);
      timeoutsRef.current.push(startId);

      elapsed += PHASE_ANIM_MS;

      if (p < currentPhase) {
        /* Gap before next phase */
        elapsed += PHASE_GAP_MS;
      } else {
        /* Last phase done: stop animating */
        const doneId = setTimeout(() => {
          setIsAnimating(false);
        }, elapsed);
        timeoutsRef.current.push(doneId);
      }
    }

    return () => clearAllTimeouts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPhase]);

  /* Handle clicking a phase card */
  const handlePhaseClick = useCallback(
    (index: number) => {
      /* Ignore if already on this phase, or currently animating to it */
      if (index === currentPhase) return;
      setCurrentPhase(index);
    },
    [currentPhase]
  );

  /* Header animates on scroll */
  const headerAnimate = hasEntered ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 };

  return (
    <section ref={setRef} className="section-spacing mx-auto max-w-6xl px-6">
      {/* Header */}
      <motion.div
        className="mb-10 text-center"
        initial={{ opacity: 0, y: 16 }}
        animate={headerAnimate}
        transition={{ duration: 0.5 }}
      >
        <h2 className="mb-3">The Request Journey</h2>
        <p className="mx-auto max-w-lg text-muted-foreground">
          Every question you post travels encrypted — here&rsquo;s how the
          TLS handshake protects your data across the public internet.
        </p>
      </motion.div>

      {/* Split layout */}
      <div className="grid grid-cols-1 lg:grid-cols-[3fr_2.5fr] gap-8 items-start">

        {/* ─── Left: SVG diagram ─── */}
        <div className="order-1">
          <div className="relative w-full" style={{ aspectRatio: '15/10', minHeight: 340 }}>
            <svg
              viewBox="0 0 120 78"
              fill="none"
              preserveAspectRatio="xMidYMid meet"
              className="absolute inset-0 w-full h-full"
              aria-hidden="true"
            >
              {/* ── Baseline: dashed "public internet" line ── */}
              <motion.path
                d={`M${CLIENT_X + 6},${BASELINE_Y} L${SERVER_X - 6},${BASELINE_Y}`}
                stroke="oklch(0.55 0.15 270 / 0.25)"
                strokeWidth="0.5"
                strokeDasharray="2 1.5"
                strokeLinecap="round"
                fill="none"
                initial={{ pathLength: 0 }}
                animate={hasEntered ? { pathLength: 1 } : {}}
                transition={{ duration: 0.5, delay: 0.1 }}
                style={{ filter: 'drop-shadow(0 0 2px oklch(0.55 0.15 270 / 0.12))' }}
              />
              <motion.text
                x={60} y={BASELINE_Y + 4}
                textAnchor="middle"
                fontSize="2.3"
                fill="oklch(0.55 0.15 270 / 0.4)"
                fontFamily="var(--font-mono)"
                initial={{ opacity: 0 }}
                animate={hasEntered ? { opacity: 1 } : {}}
                transition={{ delay: 0.25 }}
              >
                public internet
              </motion.text>

              {/* ── Encrypted tunnel overlay (green, after phase 4) ── */}
              <motion.path
                d={`M${CLIENT_X + 6},${BASELINE_Y} L${SERVER_X - 6},${BASELINE_Y}`}
                stroke="oklch(0.75 0.20 160 / 0.4)"
                strokeWidth="2.5"
                strokeLinecap="round"
                fill="none"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={
                  visiblePhases.includes(3)
                    ? { pathLength: 1, opacity: 0.3 }
                    : { pathLength: 0, opacity: 0 }
                }
                transition={{ duration: 0.6 }}
                style={{ filter: 'drop-shadow(0 0 4px oklch(0.75 0.20 160 / 0.4))' }}
              />

              {/* ── Phase paths + animated dots ── */}
              {PHASES.map((phase, i) => {
                const lane = LANES[i];
                const isForward = phase.from === 'client';
                const fromX = isForward ? CLIENT_X + 6 : SERVER_X - 6;
                const toX = isForward ? SERVER_X - 6 : CLIENT_X + 6;
                const frames = circleFrames(fromX, toX, lane.y);
                const segs = lineSegments(fromX, toX, lane.y);

                const isVisible = visiblePhases.includes(i);
                const isActive = i === currentPhase;
                const pathOpacity = isVisible ? (isActive ? 0.9 : 0.4) : 0;

                return (
                  <g key={phase.id}>
                    {/* Trail: 3 line segments synced with dot keyframes */}
                    {isVisible && segs.map((seg, si) => (
                      <motion.line
                        key={`seg-${phase.id}-${si}`}
                        x1={seg.x1} y1={seg.y1} x2={seg.x2} y2={seg.y2}
                        stroke={phase.color}
                        strokeWidth={isActive ? '1.2' : '0.8'}
                        strokeLinecap="round"
                        style={{
                          opacity: pathOpacity,
                          filter: `drop-shadow(0 0 3px ${phase.color})`,
                          transition: 'opacity 0.4s, stroke-width 0.3s',
                        }}
                        initial={{
                          x1: seg.x1a[0], y1: seg.y1a[0],
                          x2: seg.x2a[0], y2: seg.y2a[0],
                        }}
                        animate={{
                          x1: seg.x1a, y1: seg.y1a,
                          x2: seg.x2a, y2: seg.y2a,
                        }}
                        transition={{
                          duration: PHASE_ANIM_MS / 1000,
                          ease: 'easeInOut',
                        }}
                      />
                    ))}
                    {/* Traveling dot */}
                    {isVisible && (
                      <motion.circle
                        key={`dot-${phase.id}-${i}`}
                        r="1.5"
                        fill={phase.color}
                        initial={frames}
                        animate={frames}
                        transition={{
                          duration: PHASE_ANIM_MS / 1000,
                          ease: 'easeInOut',
                        }}
                        style={{ filter: `drop-shadow(0 0 3px ${phase.color})` }}
                      />
                    )}
                    {/* Phase label */}
                    <motion.text
                      x={(fromX + toX) / 2}
                      y={lane.dir === 'above' ? lane.y - 3 : lane.y + 5}
                      textAnchor="middle"
                      fontSize="2.8"
                      fill={phase.color}
                      fontFamily="var(--font-mono)"
                      fontWeight="600"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: isVisible ? 1 : 0 }}
                      transition={{ duration: 0.3, delay: isVisible ? 0.4 : 0 }}
                      style={{ filter: `drop-shadow(0 0 2px ${phase.color})` }}
                    >
                      {phase.label}
                    </motion.text>
                  </g>
                );
              })}

              {/* ── Lock icon (open → closed, appears during phase 4) ── */}
              <g>
                {/* Open lock */}
                <motion.g
                  initial={{ opacity: 0 }}
                  animate={hasEntered ? { opacity: 1 } : {}}
                  transition={{ delay: 0.3 }}
                  style={{ opacity: visiblePhases.includes(3) ? 0 : 1 }}
                >
                  <rect x={57} y={BASELINE_Y - 5} width="6" height="5" rx="0.8" fill="none" stroke="oklch(0.70 0.18 30)" strokeWidth="0.6" />
                  <path d={`M58.5,${BASELINE_Y - 5} L58.5,${BASELINE_Y - 8} A1.5,1.5 0 0 1 61.5,${BASELINE_Y - 8} L61.5,${BASELINE_Y - 6.5}`} fill="none" stroke="oklch(0.70 0.18 30)" strokeWidth="0.6" strokeLinecap="round" />
                </motion.g>
                {/* Closed lock */}
                <motion.g
                  initial={{ opacity: 0 }}
                  animate={visiblePhases.includes(3) ? { opacity: 1 } : { opacity: 0 }}
                  transition={{ duration: 0.4 }}
                  style={{ filter: 'drop-shadow(0 0 3px oklch(0.75 0.20 160 / 0.6))' }}
                >
                  <rect x={57} y={BASELINE_Y - 5} width="6" height="5" rx="0.8" fill="oklch(0.75 0.20 160 / 0.15)" stroke="oklch(0.75 0.20 160)" strokeWidth="0.6" />
                  <path d={`M58.5,${BASELINE_Y - 5} L58.5,${BASELINE_Y - 8} A1.5,1.5 0 0 1 61.5,${BASELINE_Y - 8} L61.5,${BASELINE_Y - 5}`} fill="none" stroke="oklch(0.75 0.20 160)" strokeWidth="0.6" strokeLinecap="round" />
                </motion.g>
              </g>

              {/* ── Browser node (SVG monitor icon) ── */}
              <motion.g
                initial={{ opacity: 0 }}
                animate={hasEntered ? { opacity: 1 } : {}}
                transition={{ delay: 0.1 }}
              >
                <circle cx={CLIENT_X} cy={BASELINE_Y} r="5.5" fill="oklch(0.15 0.02 260)" stroke="oklch(0.55 0.15 270 / 0.6)" strokeWidth="0.6" style={{ filter: 'drop-shadow(0 0 3px oklch(0.55 0.15 270 / 0.25))' }} />
                {/* Monitor screen */}
                <rect x={CLIENT_X - 3} y={BASELINE_Y - 2.5} width="6" height="4" rx="0.5" fill="none" stroke="oklch(0.75 0.18 270)" strokeWidth="0.5" />
                {/* Monitor stand */}
                <line x1={CLIENT_X} y1={BASELINE_Y + 1.5} x2={CLIENT_X} y2={BASELINE_Y + 3} stroke="oklch(0.75 0.18 270)" strokeWidth="0.5" />
                <line x1={CLIENT_X - 1.5} y1={BASELINE_Y + 3} x2={CLIENT_X + 1.5} y2={BASELINE_Y + 3} stroke="oklch(0.75 0.18 270)" strokeWidth="0.5" strokeLinecap="round" />
                <text x={CLIENT_X} y={BASELINE_Y + 11} textAnchor="middle" fontSize="3" fill="oklch(0.75 0.18 270)" fontFamily="var(--font-display)" fontWeight="600">Browser</text>
              </motion.g>

              {/* ── Server node (SVG server rack icon) ── */}
              <motion.g
                initial={{ opacity: 0 }}
                animate={hasEntered ? { opacity: 1 } : {}}
                transition={{ delay: 0.15 }}
              >
                <circle cx={SERVER_X} cy={BASELINE_Y} r="5.5" fill="oklch(0.15 0.02 260)" stroke="oklch(0.55 0.15 270 / 0.6)" strokeWidth="0.6" style={{ filter: 'drop-shadow(0 0 3px oklch(0.55 0.15 270 / 0.25))' }} />
                {/* Server chassis */}
                <rect x={SERVER_X - 3} y={BASELINE_Y - 3.5} width="6" height="7" rx="0.5" fill="none" stroke="oklch(0.75 0.18 270)" strokeWidth="0.5" />
                {/* Drive bay dividers */}
                <line x1={SERVER_X - 3} y1={BASELINE_Y - 1} x2={SERVER_X + 3} y2={BASELINE_Y - 1} stroke="oklch(0.75 0.18 270)" strokeWidth="0.35" />
                <line x1={SERVER_X - 3} y1={BASELINE_Y + 1.5} x2={SERVER_X + 3} y2={BASELINE_Y + 1.5} stroke="oklch(0.75 0.18 270)" strokeWidth="0.35" />
                {/* Status LEDs */}
                <circle cx={SERVER_X + 1.5} cy={BASELINE_Y - 2.2} r="0.5" fill="oklch(0.75 0.20 160)" />
                <circle cx={SERVER_X + 1.5} cy={BASELINE_Y + 0.3} r="0.5" fill="oklch(0.75 0.20 160)" />
                <circle cx={SERVER_X + 1.5} cy={BASELINE_Y + 2.7} r="0.5" fill="oklch(0.75 0.20 160)" />
                <text x={SERVER_X} y={BASELINE_Y + 11} textAnchor="middle" fontSize="3" fill="oklch(0.75 0.18 270)" fontFamily="var(--font-display)" fontWeight="600">Server</text>
              </motion.g>
            </svg>
          </div>
        </div>

        {/* ─── Right: Phase cards ─── */}
        <div className="space-y-4 order-2">
          {/* Prompt before first click */}
          {currentPhase < 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={hasEntered ? { opacity: 1 } : {}}
              transition={{ delay: 0.3 }}
              className="flex items-center gap-2 p-3 rounded-xl bg-accent/[0.04] border border-accent/15 border-dashed"
            >
              <Play className="size-4 text-accent shrink-0" />
              <p className="text-sm text-muted-foreground">
                Click a step below to start the TLS handshake animation.
              </p>
            </motion.div>
          )}

          {PHASES.map((phase, i) => {
            const Icon = phase.icon;
            const isActive = i === currentPhase;
            const isCompleted = visiblePhases.includes(i) && !isActive;

            return (
              <motion.div
                key={phase.id}
                initial={{ opacity: 0, y: 12 }}
                animate={hasEntered ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.15 + i * 0.08, duration: 0.4 }}
                onClick={() => handlePhaseClick(i)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handlePhaseClick(i); }}
                className={`flex items-start gap-3 p-3 rounded-xl cursor-pointer transition-all duration-300 ${
                  isActive && isAnimating
                    ? 'liquid-glass ring-1 ring-accent/40'
                    : isActive
                      ? 'liquid-glass ring-1 ring-accent/25'
                      : isCompleted
                        ? 'bg-accent/[0.04]'
                        : 'hover:bg-accent/[0.03]'
                }`}
              >
                {/* Step number + icon */}
                <div className="flex flex-col items-center gap-1 shrink-0">
                  <span className={`text-xs font-mono font-medium transition-colors duration-300 ${
                    isActive ? 'text-accent' : isCompleted ? 'text-accent/50' : 'text-muted-foreground/50'
                  }`}>
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <div className={`flex size-10 items-center justify-center rounded-lg transition-colors duration-300 ${
                    isActive
                      ? 'bg-accent/15 text-accent'
                      : isCompleted
                        ? 'bg-accent/8 text-accent/60'
                        : 'bg-muted text-muted-foreground'
                  }`}>
                    <Icon className="size-5" />
                  </div>
                </div>

                {/* Content */}
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className={`text-base font-semibold font-[family-name:var(--font-display)] transition-colors duration-300 ${
                      isActive ? 'text-foreground' : isCompleted ? 'text-foreground/70' : 'text-foreground/50'
                    }`}>
                      {phase.label}
                    </h4>
                    <ArrowRight className={`size-3.5 transition-colors duration-300 ${
                      isActive ? 'text-accent' : 'text-muted-foreground/30'
                    }`} />
                    <span className={`text-xs font-mono transition-colors duration-300 ${
                      isActive ? 'text-muted-foreground' : 'text-muted-foreground/40'
                    }`}>
                      {phase.from === 'client' ? 'Browser → Server' : 'Server → Browser'}
                    </span>
                  </div>
                  <p className={`text-sm leading-relaxed mt-1 transition-colors duration-300 ${
                    isActive || isCompleted ? 'text-muted-foreground' : 'text-muted-foreground/40'
                  }`}>
                    {phase.description}
                  </p>
                  <p className={`text-xs font-mono mt-1.5 transition-all duration-300 ${
                    isActive
                      ? 'text-accent/80 opacity-100 max-h-10'
                      : 'opacity-0 max-h-0 overflow-hidden'
                  }`}>
                    {phase.technicalDetail}
                  </p>
                </div>
              </motion.div>
            );
          })}

          {/* Summary badge — always visible, with MITM note */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={hasEntered ? { opacity: 1 } : {}}
            transition={{ delay: 0.6 }}
            className="flex items-center gap-2 p-3 rounded-xl bg-accent/[0.04] border border-accent/15"
          >
            <Lock className="size-4 text-accent shrink-0" />
            <p className="text-xs text-muted-foreground leading-relaxed">
              <span className="font-semibold text-foreground">End result:</span>{' '}
              All data is encrypted with AES-256-GCM. A man-in-the-middle attacker
              who intercepts the handshake sees only ciphertext — without the shared
              secret, decryption is computationally infeasible.
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
