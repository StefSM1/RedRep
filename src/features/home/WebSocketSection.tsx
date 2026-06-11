import { useRef, useState, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Radio, Wifi, Zap, Play, ArrowRight, RefreshCw } from 'lucide-react';

/* ─── Types ─── */
interface ComparisonPhase {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  substeps: string[];
}

/* ─── Phase data ─── */
const PHASES: ComparisonPhase[] = [
  {
    id: 'polling',
    title: 'HTTP Polling',
    description:
      'Клиентът постоянно пита: „Има ли нещо ново?“ всеки няколко секунди. Повечето отговори са празни — хабьосва трафик и добавя закъснения.',
    icon: RefreshCw,
    substeps: [
      'GET /notifications всеки 3s.',
      'Сървър: „няма нови данни“ (×5)',
      'Сървър: „нов отговор!“ — 15s по-късно',
      '~30 заявки/мин, 2–5s средно закъснение',
    ],
  },
  {
    id: 'upgrade',
    title: 'Преминаване към WebSocket',
    description:
      'Една HTTP заявка с Upgrade заглавка превключва връзката към постоянен, двупосочен WebSocket канал.',
    icon: ArrowRight,
    substeps: [
      'GET /ws — Upgrade: websocket',
      'Сървърът приема: 101 Switching',
      'Връзката остава отворена постоянно',
      'Двупосочен: и двете страни могат да изпращат',
    ],
  },
  {
    id: 'live',
    title: 'Живо изпращане',
    description:
      'Сървърът изпраща данни мигновеностно. Без запитване, без закъснения — закъснение под 100ms за всяко събитие.',
    icon: Zap,
    substeps: [
      'Потребител A публикува отговор',
      'Сървърът изпраща към всички свързани потребители',
      'Потребители B и C виждат в < 100ms',
      'Heartbeat ping/pong пази връзката жива',
    ],
  },
  {
    id: 'reconnect',
    title: 'Автоматично възстановяване',
    description:
      'Връзката може да се прекъсне — WiFi прекъсва, тунели се затварят. Клиентът опитва повторно с нарастващо закъснение, за да избягне претоварването на сървъра.',
    icon: Wifi,
    substeps: [
      'Изгубена връзка → откриване чрез ping',
      'Повтор след 1s, след 2s, 4s 8s',
      'Максимално закъснение 30s',
      'Безпроблемно подновяване — потребителят няма още',
    ],
  },
];

const PHASE_MS = 1600;
const PHASE_GAP = 400;

/* ─── SVG color constants ─── */
const ACCENT_GLOW = 'oklch(0.55 0.20 270)';
const G1 = 'oklch(0.65 0.22 25)';    // red (polling/waste)
const G2 = 'oklch(0.75 0.18 70)';    // amber (upgrade)
const G3 = 'oklch(0.75 0.20 160)';   // green (live/success)
const G4 = 'oklch(0.68 0.16 230)';   // blue (reconnect)
const SURFACE = 'oklch(0.14 0.02 260)';
const BORDER = 'oklch(0.55 0.15 270 / 0.5)';

/* ─── Component ─── */
export function WebSocketSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const [hasEntered, setHasEntered] = useState(false);
  const [activePhase, setActivePhase] = useState(-1);
  const [isAnimating, setIsAnimating] = useState(false);
  const [visiblePhases, setVisiblePhases] = useState<number[]>([]);
  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const prevPhaseRef = useRef(-1);
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

  /* Auto-play all phases once when section enters viewport */
  useEffect(() => {
    if (!hasEntered || hasAutoPlayed.current) return;
    hasAutoPlayed.current = true;

    const autoTimeouts: ReturnType<typeof setTimeout>[] = [];
    let delay = 600; // initial pause after entering view

    for (let i = 0; i < PHASES.length; i++) {
      autoTimeouts.push(setTimeout(() => setActivePhase(i), delay));
      delay += PHASE_MS + PHASE_GAP;
    }

    return () => autoTimeouts.forEach(clearTimeout);
  }, [hasEntered]);

  const clearAll = useCallback(() => {
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];
  }, []);

  /* Animation sequencing */
  useEffect(() => {
    if (activePhase < 0) return;
    clearAll();
    const prev = prevPhaseRef.current;
    let start: number;

    if (prev >= 0 && activePhase > prev) {
      start = prev + 1;
      setVisiblePhases(Array.from({ length: prev + 1 }, (_, i) => i));
    } else {
      start = 0;
      setVisiblePhases([]);
    }

    prevPhaseRef.current = activePhase;
    setIsAnimating(true);
    let elapsed = 0;

    for (let p = start; p <= activePhase; p++) {
      const idx = p;
      timeoutsRef.current.push(setTimeout(() => {
        setVisiblePhases(prev2 => [...prev2, idx]);
      }, elapsed));
      elapsed += PHASE_MS;
      if (p < activePhase) elapsed += PHASE_GAP;
      else timeoutsRef.current.push(setTimeout(() => setIsAnimating(false), elapsed));
    }
    return clearAll;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activePhase]);

  const handleClick = useCallback((i: number) => {
    if (i === activePhase && !isAnimating) {
      prevPhaseRef.current = i - 1;
      setVisiblePhases(Array.from({ length: i }, (_, k) => k));
      setActivePhase(-1);
      setTimeout(() => setActivePhase(i), 50);
    } else {
      setActivePhase(i);
    }
  }, [activePhase, isAnimating]);

  const headerAnim = hasEntered ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 };
  const vis = (i: number) => visiblePhases.includes(i);

  /* ─── Polling timeline dots (6 polls, 5 empty + 1 success) ─── */
  const POLL_COUNT = 6;

  return (
    <section ref={setRef} className="section-spacing mx-auto max-w-6xl px-6">
      {/* Header */}
      <motion.div
        className="mb-8 text-center"
        initial={{ opacity: 0, y: 16 }}
        animate={headerAnim}
        transition={{ duration: 0.5 }}
      >
        <h2 className="mb-3">Връзки в реално време</h2>
        <p className="mx-auto max-w-xl text-muted-foreground">
          Получавай известие в момента, в който някой отговари на въпроса ти — ето защо
          WebSockets печелат поллинга за жива комуникация.
        </p>
      </motion.div>

      {/* Prompt */}
      {activePhase < 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={hasEntered ? { opacity: 1 } : {}}
          transition={{ delay: 0.3 }}
          className="flex items-center gap-2 p-3 rounded-xl bg-accent/[0.04] border border-accent/15 border-dashed mb-6 max-w-md mx-auto"
        >
          <Play className="size-4 text-accent shrink-0" />
          <p className="text-sm text-muted-foreground">
            Кликни етап от долу, за да видиш как работят съобщенията в реално време.
          </p>
        </motion.div>
      )}

      {/* ─── Full-width SVG diagram ─── */}
      <div className="w-full">
        <div className="relative w-full" style={{ aspectRatio: '480/200' }}>
          <svg
            viewBox="0 0 480 200"
            fill="none"
            preserveAspectRatio="xMidYMin meet"
            className="absolute inset-0 w-full h-full"
            aria-hidden="true"
          >
            <defs>
              <filter id="wg"><feDropShadow dx="0" dy="0" stdDeviation="3" floodColor={ACCENT_GLOW} floodOpacity="0.5" /></filter>
              <filter id="wg1"><feDropShadow dx="0" dy="0" stdDeviation="3" floodColor={G1} floodOpacity="0.6" /></filter>
              <filter id="wg2"><feDropShadow dx="0" dy="0" stdDeviation="3" floodColor={G2} floodOpacity="0.6" /></filter>
              <filter id="wg3"><feDropShadow dx="0" dy="0" stdDeviation="3" floodColor={G3} floodOpacity="0.6" /></filter>
              <filter id="wg4"><feDropShadow dx="0" dy="0" stdDeviation="3" floodColor={G4} floodOpacity="0.6" /></filter>
            </defs>

            {/* ═══════════════════════════════════════════
                PHASE 1 — POLLING (x: 10–118)
                ═══════════════════════════════════════════ */}
            <g>
              <motion.text x="64" y="16" textAnchor="middle" fontSize="7" fontFamily="var(--font-mono)" fontWeight="700" fill={G1}
                initial={{ opacity: 0 }} animate={hasEntered ? { opacity: 1 } : {}} transition={{ delay: 0.15 }}
                style={{ filter: 'url(#wg1)' }}
              >POLLING</motion.text>

              {/* Client icon */}
              <motion.g
                initial={{ opacity: 0 }} animate={hasEntered ? { opacity: 1 } : {}} transition={{ delay: 0.2 }}
              >
                <rect x="16" y="30" width="28" height="22" rx="3" fill={SURFACE} stroke={BORDER} strokeWidth="0.8" />
                <text x="30" y="44" textAnchor="middle" fontSize="4" fontFamily="var(--font-mono)" fill="oklch(0.70 0.02 260)">Клиент</text>
              </motion.g>

              {/* Server icon */}
              <motion.g
                initial={{ opacity: 0 }} animate={hasEntered ? { opacity: 1 } : {}} transition={{ delay: 0.25 }}
              >
                <rect x="84" y="30" width="28" height="22" rx="3" fill={SURFACE} stroke={BORDER} strokeWidth="0.8" />
                <text x="98" y="44" textAnchor="middle" fontSize="4" fontFamily="var(--font-mono)" fill="oklch(0.70 0.02 260)">Сървър</text>
              </motion.g>

              {/* Poll arrows: 6 request-response cycles */}
              {Array.from({ length: POLL_COUNT }, (_, pi) => {
                const py = 64 + pi * 14;
                const isSuccess = pi === POLL_COUNT - 1;
                const color = isSuccess ? G3 : G1;
                const label = isSuccess ? 'new!' : 'empty';
                const delayBase = 0.3 + pi * 0.25;

                return (
                  <motion.g key={`poll-${pi}`}>
                    {/* Request arrow: client → server */}
                    <motion.line
                      x1="44" y1={py} x2="84" y2={py}
                      stroke={G1} strokeWidth="0.8" strokeLinecap="round" strokeDasharray="2 1"
                      initial={{ pathLength: 0, opacity: 0 }}
                      animate={vis(0) ? { pathLength: 1, opacity: 0.7 } : {}}
                      transition={{ delay: delayBase, duration: 0.3 }}
                      style={{ filter: 'url(#wg1)' }}
                    />
                    {/* Request label */}
                    <motion.text x="64" y={py - 2} textAnchor="middle" fontSize="3" fontFamily="var(--font-mono)" fill={G1}
                      initial={{ opacity: 0 }} animate={vis(0) ? { opacity: 0.6 } : {}} transition={{ delay: delayBase + 0.15 }}
                    >GET?</motion.text>

                    {/* Response arrow: server → client */}
                    <motion.line
                      x1="84" y1={py + 5} x2="44" y2={py + 5}
                      stroke={color} strokeWidth="0.8" strokeLinecap="round"
                      initial={{ pathLength: 0, opacity: 0 }}
                      animate={vis(0) ? { pathLength: 1, opacity: 0.7 } : {}}
                      transition={{ delay: delayBase + 0.15, duration: 0.3 }}
                      style={{ filter: isSuccess ? 'url(#wg3)' : 'url(#wg1)' }}
                    />
                    {/* Response label */}
                    <motion.text x="64" y={py + 9} textAnchor="middle" fontSize="3" fontFamily="var(--font-mono)" fill={color}
                      initial={{ opacity: 0 }} animate={vis(0) ? { opacity: 0.8 } : {}} transition={{ delay: delayBase + 0.3 }}
                    >{label}</motion.text>

                    {/* X mark for empty, check for success */}
                    {isSuccess ? (
                      <motion.text x="100" y={py + 9} fontSize="5" fill={G3} fontWeight="700"
                        initial={{ opacity: 0, scale: 0 }} animate={vis(0) ? { opacity: 1, scale: 1 } : {}}
                        transition={{ delay: delayBase + 0.4, type: 'spring', bounce: 0.5 }}
                      >✓</motion.text>
                    ) : (
                      <motion.text x="100" y={py + 9} fontSize="5" fill={G1} fontWeight="700"
                        initial={{ opacity: 0 }} animate={vis(0) ? { opacity: 0.5 } : {}} transition={{ delay: delayBase + 0.4 }}
                      >✗</motion.text>
                    )}
                  </motion.g>
                );
              })}

              {/* Wasted bandwidth label */}
              <motion.g
                initial={{ opacity: 0 }} animate={vis(0) ? { opacity: 1 } : {}} transition={{ delay: 1.6 }}
              >
                <rect x="22" y="148" width="84" height="12" rx="3" fill="oklch(0.30 0.12 25 / 0.3)" stroke={G1} strokeWidth="0.6" />
                <text x="64" y="156.5" textAnchor="middle" fontSize="4" fontFamily="var(--font-mono)" fontWeight="600" fill={G1}>~30 req/min</text>
              </motion.g>

              <motion.text x="64" y="170" textAnchor="middle" fontSize="3.5" fontFamily="var(--font-mono)" fill={G1}
                initial={{ opacity: 0 }} animate={vis(0) ? { opacity: 0.6 } : {}} transition={{ delay: 1.8 }}
              >wasteful polling ✗</motion.text>
            </g>

            {/* ═══════════════════════════════════════════
                PHASE 2 — UPGRADE (x: 130–238)
                ═══════════════════════════════════════════ */}
            <g>
              <motion.text x="184" y="16" textAnchor="middle" fontSize="7" fontFamily="var(--font-mono)" fontWeight="700" fill={G2}
                initial={{ opacity: 0 }} animate={hasEntered ? { opacity: 1 } : {}} transition={{ delay: 0.2 }}
                style={{ filter: 'url(#wg2)' }}
              >UPGRADE</motion.text>

              {/* Client */}
              <motion.g
                initial={{ opacity: 0 }} animate={hasEntered ? { opacity: 1 } : {}} transition={{ delay: 0.25 }}
              >
                <rect x="138" y="30" width="28" height="22" rx="3" fill={SURFACE} stroke={BORDER} strokeWidth="0.8" />
                <text x="152" y="44" textAnchor="middle" fontSize="4" fontFamily="var(--font-mono)" fill="oklch(0.70 0.02 260)">Клиент</text>
              </motion.g>

              {/* Server */}
              <motion.g
                initial={{ opacity: 0 }} animate={hasEntered ? { opacity: 1 } : {}} transition={{ delay: 0.3 }}
              >
                <rect x="202" y="30" width="28" height="22" rx="3" fill={SURFACE} stroke={BORDER} strokeWidth="0.8" />
                <text x="216" y="44" textAnchor="middle" fontSize="4" fontFamily="var(--font-mono)" fill="oklch(0.70 0.02 260)">Сървър</text>
              </motion.g>

              {/* Step 1: HTTP Upgrade request */}
              <motion.g
                initial={{ opacity: 0 }} animate={vis(1) ? { opacity: 1 } : {}} transition={{ delay: 0.2, duration: 0.4 }}
              >
                <motion.line
                  x1="166" y1="62" x2="202" y2="62"
                  stroke={G2} strokeWidth="1" strokeLinecap="round"
                  initial={{ pathLength: 0 }} animate={vis(1) ? { pathLength: 1 } : {}} transition={{ delay: 0.3, duration: 0.5 }}
                  style={{ filter: 'url(#wg2)' }}
                />
                <text x="184" y="59" textAnchor="middle" fontSize="3.2" fontFamily="var(--font-mono)" fill={G2}>Upgrade: websocket</text>
                {/* Arrowhead */}
                <motion.polygon points="200,59 202,62 200,65"
                  fill={G2}
                  initial={{ opacity: 0 }} animate={vis(1) ? { opacity: 1 } : {}} transition={{ delay: 0.7 }}
                />
              </motion.g>

              {/* Step 2: 101 Switching */}
              <motion.g
                initial={{ opacity: 0 }} animate={vis(1) ? { opacity: 1 } : {}} transition={{ delay: 0.7, duration: 0.4 }}
              >
                <motion.line
                  x1="202" y1="74" x2="166" y2="74"
                  stroke={G3} strokeWidth="1" strokeLinecap="round"
                  initial={{ pathLength: 0 }} animate={vis(1) ? { pathLength: 1 } : {}} transition={{ delay: 0.8, duration: 0.5 }}
                  style={{ filter: 'url(#wg3)' }}
                />
                <text x="184" y="71" textAnchor="middle" fontSize="3.2" fontFamily="var(--font-mono)" fill={G3}>101 Switching</text>
                <motion.polygon points="168,71 166,74 168,77"
                  fill={G3}
                  initial={{ opacity: 0 }} animate={vis(1) ? { opacity: 1 } : {}} transition={{ delay: 1.2 }}
                />
              </motion.g>

              {/* Step 3: Persistent connection — bidirectional arrows */}
              <motion.g
                initial={{ opacity: 0 }} animate={vis(1) ? { opacity: 1 } : {}} transition={{ delay: 1.0 }}
              >
                {/* Bidirectional channel bar */}
                <rect x="158" y="88" width="52" height="14" rx="3" fill="oklch(0.22 0.06 160 / 0.4)" stroke={G3} strokeWidth="0.8"
                  style={{ filter: 'url(#wg3)' }}
                />
                <text x="184" y="97" textAnchor="middle" fontSize="3.8" fontFamily="var(--font-mono)" fontWeight="600" fill="oklch(0.92 0.01 260)">двупосочен</text>

                {/* Animated flow dots */}
                <motion.circle r="1.5" fill={G3}
                  animate={vis(1) ? { cx: [162, 206], opacity: [0, 1, 1, 0] } : {}}
                  transition={{ delay: 1.2, duration: 1.2, repeat: Infinity, repeatDelay: 0.8 }}
                  cy="92"
                />
                <motion.circle r="1.5" fill={G2}
                  animate={vis(1) ? { cx: [206, 162], opacity: [0, 1, 1, 0] } : {}}
                  transition={{ delay: 1.5, duration: 1.2, repeat: Infinity, repeatDelay: 0.8 }}
                  cy="98"
                />
              </motion.g>

              {/* Stat badges */}
              <motion.g
                initial={{ opacity: 0 }} animate={vis(1) ? { opacity: 1 } : {}} transition={{ delay: 1.3 }}
              >
                <rect x="140" y="112" width="38" height="12" rx="3" fill="oklch(0.18 0.04 70 / 0.4)" stroke={G2} strokeWidth="0.5" />
                <text x="159" y="120" textAnchor="middle" fontSize="3.5" fontFamily="var(--font-mono)" fill={G2}>1 conn</text>

                <rect x="184" y="112" width="44" height="12" rx="3" fill="oklch(0.18 0.04 160 / 0.4)" stroke={G3} strokeWidth="0.5" />
                <text x="206" y="120" textAnchor="middle" fontSize="3.5" fontFamily="var(--font-mono)" fill={G3}>&lt;100ms</text>
              </motion.g>

              <motion.text x="184" y="140" textAnchor="middle" fontSize="4" fontFamily="var(--font-mono)" fontWeight="600" fill={G2}
                initial={{ opacity: 0 }} animate={vis(1) ? { opacity: 0.8 } : {}} transition={{ delay: 1.5 }}
                style={{ filter: 'url(#wg2)' }}
              >persistent channel ✓</motion.text>
            </g>

            {/* ═══════════════════════════════════════════
                PHASE 3 — LIVE PUSH (x: 250–368)
                ═══════════════════════════════════════════ */}
            <g>
              <motion.text x="310" y="16" textAnchor="middle" fontSize="7" fontFamily="var(--font-mono)" fontWeight="700" fill={G3}
                initial={{ opacity: 0 }} animate={hasEntered ? { opacity: 1 } : {}} transition={{ delay: 0.25 }}
                style={{ filter: 'url(#wg3)' }}
              >LIVE PUSH</motion.text>

              {/* Server hub in center */}
              <motion.g
                initial={{ opacity: 0, scale: 0.5 }}
                animate={vis(2) ? { opacity: 1, scale: 1 } : {}}
                transition={{ delay: 0.2, duration: 0.5, type: 'spring', bounce: 0.3 }}
                style={{ transformOrigin: '310px 52px' }}
              >
                <rect x="290" y="34" width="40" height="28" rx="4" fill={SURFACE} stroke={G3} strokeWidth="0.9"
                  style={{ filter: 'url(#wg3)' }} />
                <text x="310" y="50" textAnchor="middle" fontSize="4.5" fontFamily="var(--font-mono)" fontWeight="600" fill={G3}>Сървър</text>
                <text x="310" y="57" textAnchor="middle" fontSize="3" fontFamily="var(--font-mono)" fill="oklch(0.60 0.02 260)">hub</text>
              </motion.g>

              {/* User A (left) — posts a reply */}
              <motion.g
                initial={{ opacity: 0, x: -8 }}
                animate={vis(2) ? { opacity: 1, x: 0 } : {}}
                transition={{ delay: 0.4, duration: 0.4 }}
              >
                <circle cx="262" cy="86" r="10" fill={SURFACE} stroke={G3} strokeWidth="0.8" />
                <text x="262" y="89" textAnchor="middle" fontSize="4.5" fontFamily="var(--font-mono)" fontWeight="600" fill={G3}>A</text>
                <text x="262" y="102" textAnchor="middle" fontSize="3.2" fontFamily="var(--font-mono)" fill={G3}>пише</text>
              </motion.g>

              {/* Arrow from User A → Server */}
              <motion.path
                d="M272,82 C285,72 295,62 298,56"
                stroke={G3} strokeWidth="1" strokeLinecap="round" fill="none"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={vis(2) ? { pathLength: 1, opacity: 0.8 } : {}}
                transition={{ delay: 0.7, duration: 0.5 }}
                style={{ filter: 'url(#wg3)' }}
              />
              {/* Traveling dot */}
              {vis(2) && (
                <motion.circle r="2" fill={G3}
                  initial={{ offsetDistance: '0%', opacity: 0 }}
                  animate={{ offsetDistance: '100%', opacity: [0, 1, 1, 0] }}
                  transition={{ delay: 0.8, duration: 0.6, times: [0, 0.15, 0.85, 1] }}
                  style={{ offsetPath: 'path("M272,82 C285,72 295,62 298,56")', filter: 'url(#wg3)' }}
                />
              )}

              {/* Push arrows: Server → User B and User C */}
              {/* User B (right) */}
              <motion.g
                initial={{ opacity: 0, x: 8 }}
                animate={vis(2) ? { opacity: 1, x: 0 } : {}}
                transition={{ delay: 0.5, duration: 0.4 }}
              >
                <circle cx="358" cy="86" r="10" fill={SURFACE} stroke={BORDER} strokeWidth="0.8" />
                <text x="358" y="89" textAnchor="middle" fontSize="4.5" fontFamily="var(--font-mono)" fontWeight="600" fill="oklch(0.70 0.02 260)">B</text>
              </motion.g>

              {/* User C (bottom-right) */}
              <motion.g
                initial={{ opacity: 0, y: 8 }}
                animate={vis(2) ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.6, duration: 0.4 }}
              >
                <circle cx="340" cy="120" r="10" fill={SURFACE} stroke={BORDER} strokeWidth="0.8" />
                <text x="340" y="123" textAnchor="middle" fontSize="4.5" fontFamily="var(--font-mono)" fontWeight="600" fill="oklch(0.70 0.02 260)">C</text>
              </motion.g>

              {/* Server → B push */}
              <motion.path
                d="M322,56 C335,62 348,72 354,80"
                stroke={G3} strokeWidth="1.2" strokeLinecap="round" fill="none"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={vis(2) ? { pathLength: 1, opacity: 0.8 } : {}}
                transition={{ delay: 1.1, duration: 0.5 }}
                style={{ filter: 'url(#wg3)' }}
              />
              {vis(2) && (
                <motion.circle r="2.5" fill={G3}
                  initial={{ offsetDistance: '0%', opacity: 0 }}
                  animate={{ offsetDistance: '100%', opacity: [0, 1, 1, 0] }}
                  transition={{ delay: 1.2, duration: 0.5, times: [0, 0.15, 0.85, 1] }}
                  style={{ offsetPath: 'path("M322,56 C335,62 348,72 354,80")', filter: 'url(#wg3)' }}
                />
              )}

              {/* Server → C push */}
              <motion.path
                d="M316,62 C322,80 330,100 336,112"
                stroke={G3} strokeWidth="1.2" strokeLinecap="round" fill="none"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={vis(2) ? { pathLength: 1, opacity: 0.8 } : {}}
                transition={{ delay: 1.1, duration: 0.6 }}
                style={{ filter: 'url(#wg3)' }}
              />
              {vis(2) && (
                <motion.circle r="2.5" fill={G3}
                  initial={{ offsetDistance: '0%', opacity: 0 }}
                  animate={{ offsetDistance: '100%', opacity: [0, 1, 1, 0] }}
                  transition={{ delay: 1.2, duration: 0.6, times: [0, 0.15, 0.85, 1] }}
                  style={{ offsetPath: 'path("M316,62 C322,80 330,100 336,112")', filter: 'url(#wg3)' }}
                />
              )}

              {/* Notification badges on B and C */}
              <motion.g
                initial={{ opacity: 0, scale: 0 }}
                animate={vis(2) ? { opacity: 1, scale: 1 } : {}}
                transition={{ delay: 1.5, duration: 0.3, type: 'spring', bounce: 0.5 }}
                style={{ transformOrigin: '366px 78px' }}
              >
                <circle cx="366" cy="78" r="4" fill={G1} stroke="oklch(0.14 0.02 260)" strokeWidth="0.8" />
                <text x="366" y="80" textAnchor="middle" fontSize="3.5" fontFamily="var(--font-mono)" fontWeight="700" fill="oklch(0.98 0.01 260)">1</text>
              </motion.g>
              <motion.g
                initial={{ opacity: 0, scale: 0 }}
                animate={vis(2) ? { opacity: 1, scale: 1 } : {}}
                transition={{ delay: 1.55, duration: 0.3, type: 'spring', bounce: 0.5 }}
                style={{ transformOrigin: '348px 112px' }}
              >
                <circle cx="348" cy="112" r="4" fill={G1} stroke="oklch(0.14 0.02 260)" strokeWidth="0.8" />
                <text x="348" y="114" textAnchor="middle" fontSize="3.5" fontFamily="var(--font-mono)" fontWeight="700" fill="oklch(0.98 0.01 260)">1</text>
              </motion.g>

              {/* User labels */}
              <motion.text x="358" y="102" textAnchor="middle" fontSize="3.2" fontFamily="var(--font-mono)" fill={G3}
                initial={{ opacity: 0 }} animate={vis(2) ? { opacity: 0.8 } : {}} transition={{ delay: 1.5 }}
              >уведомен</motion.text>
              <motion.text x="340" y="136" textAnchor="middle" fontSize="3.2" fontFamily="var(--font-mono)" fill={G3}
                initial={{ opacity: 0 }} animate={vis(2) ? { opacity: 0.8 } : {}} transition={{ delay: 1.55 }}
              >уведомен</motion.text>

              {/* Heartbeat line at bottom */}
              <motion.g
                initial={{ opacity: 0 }} animate={vis(2) ? { opacity: 1 } : {}} transition={{ delay: 1.4 }}
              >
                <rect x="264" y="148" width="92" height="14" rx="3" fill={SURFACE} stroke={G3} strokeWidth="0.6" />
                <text x="310" y="157.5" textAnchor="middle" fontSize="3.8" fontFamily="var(--font-mono)" fontWeight="600" fill={G3}>ping / pong ♡</text>
              </motion.g>

              {/* Animated heartbeat pulse */}
              {vis(2) && (
                <motion.path
                  d="M270,168 L280,168 L283,162 L286,174 L289,162 L292,174 L295,168 L350,168"
                  stroke={G3} strokeWidth="0.8" fill="none" strokeLinecap="round"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: [0, 0.8, 0.8, 0] }}
                  transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
                  style={{ filter: 'url(#wg3)' }}
                />
              )}
            </g>

            {/* ═══════════════════════════════════════════
                PHASE 4 — RECONNECT (x: 370–478)
                ═══════════════════════════════════════════ */}
            <g>
              <motion.text x="424" y="16" textAnchor="middle" fontSize="7" fontFamily="var(--font-mono)" fontWeight="700" fill={G4}
                initial={{ opacity: 0 }} animate={hasEntered ? { opacity: 1 } : {}} transition={{ delay: 0.3 }}
                style={{ filter: 'url(#wg4)' }}
              >RECONNECT</motion.text>

              {/* Connection line: solid → broken → solid */}
              <motion.g
                initial={{ opacity: 0 }} animate={vis(3) ? { opacity: 1 } : {}} transition={{ delay: 0.2 }}
              >
                {/* Healthy connection */}
                <motion.line
                  x1="388" y1="44" x2="460" y2="44"
                  stroke={G3} strokeWidth="1.2" strokeLinecap="round"
                  initial={{ pathLength: 0 }} animate={vis(3) ? { pathLength: 1 } : {}}
                  transition={{ delay: 0.3, duration: 0.4 }}
                  style={{ filter: 'url(#wg3)' }}
                />
                <text x="382" y="47" textAnchor="end" fontSize="3.5" fontFamily="var(--font-mono)" fill={G3}>●</text>
                <text x="466" y="47" fontSize="3.5" fontFamily="var(--font-mono)" fill={G3}>●</text>
              </motion.g>

              {/* Connection breaks: X mark */}
              <motion.g
                initial={{ opacity: 0 }}
                animate={vis(3) ? { opacity: [0, 0, 1, 1] } : {}}
                transition={{ delay: 0.4, duration: 2, times: [0, 0.3, 0.4, 1] }}
              >
                {/* Broken line */}
                <line x1="388" y1="60" x2="416" y2="60" stroke={G1} strokeWidth="1" strokeLinecap="round" strokeDasharray="3 2" />
                <line x1="432" y1="60" x2="460" y2="60" stroke={G1} strokeWidth="1" strokeLinecap="round" strokeDasharray="3 2" />
                {/* X break */}
                <line x1="420" y1="55" x2="428" y2="65" stroke={G1} strokeWidth="1.5" strokeLinecap="round" />
                <line x1="428" y1="55" x2="420" y2="65" stroke={G1} strokeWidth="1.5" strokeLinecap="round" />
                <text x="424" y="76" textAnchor="middle" fontSize="3.5" fontFamily="var(--font-mono)" fill={G1}>disconnect!</text>
              </motion.g>

              {/* Exponential backoff retry ladder */}
              <motion.g
                initial={{ opacity: 0 }} animate={vis(3) ? { opacity: 1 } : {}} transition={{ delay: 1.4 }}
              >
                {/* Retry steps as a staircase */}
                {[
                  { label: '1s', x: 390, y: 92, w: 18 },
                  { label: '2s', x: 412, y: 104, w: 18 },
                  { label: '4s', x: 434, y: 116, w: 18 },
                  { label: '8s', x: 456, y: 128, w: 18 },
                ].map((step, si) => (
                  <motion.g key={step.label}
                    initial={{ opacity: 0, x: -6 }}
                    animate={vis(3) ? { opacity: 1, x: 0 } : {}}
                    transition={{ delay: 1.5 + si * 0.25, duration: 0.3, type: 'spring', bounce: 0.3 }}
                  >
                    <rect x={step.x} y={step.y} width={step.w} height="10" rx="2.5"
                      fill="oklch(0.18 0.04 230 / 0.4)" stroke={G4} strokeWidth="0.6"
                      style={{ filter: 'url(#wg4)' }}
                    />
                    <text x={step.x + step.w / 2} y={step.y + 7} textAnchor="middle" fontSize="3.8" fontFamily="var(--font-mono)"
                      fontWeight="600" fill={G4}>{step.label}</text>
                  </motion.g>
                ))}

                {/* Connecting staircase lines */}
                <motion.path
                  d="M408,97 L412,104 M430,109 L434,116 M452,121 L456,128"
                  stroke={G4} strokeWidth="0.6" strokeLinecap="round" strokeDasharray="1.5 1"
                  initial={{ opacity: 0 }} animate={vis(3) ? { opacity: 0.5 } : {}}
                  transition={{ delay: 2.0 }}
                />

                {/* Arrow labels */}
                <text x="385" y="90" fontSize="3" fontFamily="var(--font-mono)" fill="oklch(0.60 0.02 260)">retry</text>
              </motion.g>

              {/* Reconnected! badge */}
              <motion.g
                initial={{ opacity: 0, scale: 0.7 }}
                animate={vis(3) ? { opacity: 1, scale: 1 } : {}}
                transition={{ delay: 2.2, duration: 0.3, type: 'spring', bounce: 0.4 }}
                style={{ transformOrigin: '424px 152px' }}
              >
                <rect x="392" y="146" width="64" height="14" rx="4" fill="oklch(0.18 0.06 160 / 0.4)" stroke={G3} strokeWidth="0.8"
                  style={{ filter: 'url(#wg3)' }}
                />
                <text x="424" y="155.5" textAnchor="middle" fontSize="4.2" fontFamily="var(--font-mono)" fontWeight="600" fill={G3}>reconnected ✓</text>
              </motion.g>

              {/* Solid line restored */}
              <motion.line
                x1="388" y1="168" x2="460" y2="168"
                stroke={G3} strokeWidth="1.2" strokeLinecap="round"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={vis(3) ? { pathLength: 1, opacity: 1 } : {}}
                transition={{ delay: 2.4, duration: 0.5 }}
                style={{ filter: 'url(#wg3)' }}
              />
              <motion.text x="424" y="178" textAnchor="middle" fontSize="3.2" fontFamily="var(--font-mono)" fill={G3}
                initial={{ opacity: 0 }} animate={vis(3) ? { opacity: 0.6 } : {}} transition={{ delay: 2.6 }}
              >seamless resume</motion.text>
            </g>
          </svg>
        </div>
      </div>

      {/* ─── Phase cards: horizontal row below diagram ─── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-0.5">
        {PHASES.map((phase, i) => {
          const Icon = phase.icon;
          const isActive = i === activePhase;
          const isDone = vis(i) && !isActive;
          return (
            <motion.div
              key={phase.id}
              initial={{ opacity: 0, y: 12 }}
              animate={hasEntered ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.15 + i * 0.08, duration: 0.4 }}
              onClick={() => handleClick(i)}
              role="button"
              tabIndex={0}
              onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') handleClick(i); }}
              className={`flex flex-col items-start gap-2 p-3 rounded-xl cursor-pointer transition-all duration-300 ${isActive && isAnimating
                ? 'liquid-glass ring-1 ring-accent/40'
                : isActive
                  ? 'liquid-glass ring-1 ring-accent/25'
                  : isDone
                    ? 'bg-accent/[0.04]'
                    : 'hover:bg-accent/[0.03]'
                }`}
            >
              <div className="flex items-center gap-2 w-full">
                <span className={`text-xs font-mono font-medium transition-colors duration-300 ${isActive ? 'text-accent' : isDone ? 'text-accent/50' : 'text-muted-foreground/50'
                  }`}>
                  {String(i + 1).padStart(2, '0')}
                </span>
                <div className={`flex size-8 items-center justify-center rounded-lg transition-colors duration-300 ${isActive
                  ? 'bg-accent/15 text-accent'
                  : isDone
                    ? 'bg-accent/8 text-accent/60'
                    : 'bg-muted text-muted-foreground'
                  }`}>
                  <Icon className="size-4" />
                </div>
                <h4 className={`text-sm font-semibold font-[family-name:var(--font-display)] transition-colors duration-300 ${isActive ? 'text-foreground' : isDone ? 'text-foreground/70' : 'text-foreground/50'
                  }`}>
                  {phase.title}
                </h4>
              </div>
              <p className={`text-xs leading-relaxed transition-colors duration-300 ${isActive || isDone ? 'text-muted-foreground' : 'text-muted-foreground/40'
                }`}>
                {phase.description}
              </p>
              <ul className={`space-y-0.5 transition-all duration-300 ${isActive || isDone ? 'opacity-100 max-h-40' : 'opacity-0 max-h-0 overflow-hidden'
                }`}>
                {phase.substeps.map(s => (
                  <li key={s} className="text-[11px] font-mono text-muted-foreground/80 flex items-start gap-1.5">
                    <span className="text-accent/70 mt-0.5">›</span>
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
              {isActive && !isAnimating && (
                <p className="text-[10px] font-mono text-accent/60 mt-0.5">кликни за повторно</p>
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
        <Radio className="size-4 text-accent shrink-0" />
        <p className="text-xs text-muted-foreground leading-relaxed">
          <span className="font-semibold text-foreground">Краен резултат:</span>{' '}
          Една постоянна връзка заменя десетки ненужни заявки.
          Всеки отговор, гласуване и известие пристигат в под 100ms — а ако връзката се прекъсне, клиентът се възстановява автоматично.
        </p>
      </motion.div>
    </section>
  );
}
