import { useRef, useState, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Activity, Bell, Scale, Shield, HeartPulse, Play } from 'lucide-react';

/* ─── Types ─── */
interface IncidentPhase {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  substeps: string[];
  metrics: { reqPerSec: number; errorRate: number; p99Latency: number };
  color: string;
  logLine: string;
}

/* ─── Phase data ─── */
const PHASES: IncidentPhase[] = [
  {
    id: 'normal',
    title: 'Нормален',
    description:
      'Всички показатели са зелени. Стабилен трафик, нисък брой грешки, бързи отговори. Системата е здрава и обслужва заявките ефективно.',
    icon: HeartPulse,
    substeps: [
      'Темпо на заявки: ~100 заявки/с',
      'Грешки: 0.1% (нормално)',
      'p99 закъснение: 50ms',
      '3 здрави пода работят',
    ],
    metrics: { reqPerSec: 100, errorRate: 0.1, p99Latency: 50 },
    color: 'oklch(0.75 0.20 160)',
    logLine: '[12:00:01] INFO  Темпо: 102 заявки/с — нормално',
  },
  {
    id: 'spike',
    title: 'Открит спик',
    description:
      'Трафикът нараства неочаквано — 5× нормалното натоварване за секунди. Закъснението започва да расте, докато подовете достигат им капацитета.',
    icon: Activity,
    substeps: [
      'Темпо на заявки скоква до 500 заявки/с',
      'Използване на CPU > 85%',
      'p99 закъснение расте: 200ms',
      'Грешките нарастват: 0.8%',
    ],
    metrics: { reqPerSec: 500, errorRate: 0.8, p99Latency: 200 },
    color: 'oklch(0.75 0.18 70)',
    logLine: '[12:00:03] WARN  Темпо: 487 заявки/с — над прага',
  },
  {
    id: 'alert',
    title: 'Предупреждение изстреляно',
    description:
      'p99 закъснението надхвърля SLO границата от 500ms. Предупреждението достига дежурния инженер чрез PagerDuty за секунди.',
    icon: Bell,
    substeps: [
      'p99 закъснение: 812ms > 500ms SLO',
      'Грешки: 2.5% — деградирано',
      'Предупреждение → PagerDuty → Slack',
      'Дежурният инженер е уведомен за 8с',
    ],
    metrics: { reqPerSec: 480, errorRate: 2.5, p99Latency: 812 },
    color: 'oklch(0.65 0.22 25)',
    logLine: '[12:00:04] ALERT p99 закъснение: 812ms > 500ms лимит',
  },
  {
    id: 'scale',
    title: 'Автоматично мащабиране',
    description:
      'Kubernetes HPA усеща високо CPU и стартира 2 нови пода. Load balancer започва да разпределя трафика между всички копия.',
    icon: Scale,
    substeps: [
      'HPA: CPU > 80% за 30с',
      'Стартиране на 2 нови пода (3 → 5)',
      'Подовете готови за ~12с',
      'Натоварването разпределено между 5 копия',
    ],
    metrics: { reqPerSec: 350, errorRate: 1.2, p99Latency: 400 },
    color: 'oklch(0.68 0.16 230)',
    logLine: '[12:00:05] INFO  Автомащабиране: стартирам 2 нови контейнера',
  },
  {
    id: 'recovery',
    title: 'Възстановяване',
    description:
      'Трафикът се нормализира, новите подове поемат натоварването. Всички показатели се връщат в зелено — системата се възстанови само, без човешка намеса.',
    icon: Shield,
    substeps: [
      'Темпо: 156 заявки/с — нормализирано',
      'Грешките се върнаха до 0.1%',
      'p99 закъснение: 60ms (в SLO)',
      'Нулев престой — потребителите не усещат',
    ],
    metrics: { reqPerSec: 156, errorRate: 0.1, p99Latency: 60 },
    color: 'oklch(0.75 0.20 160)',
    logLine: '[12:00:08] INFO  Темпо: 156 заявки/с — нормализирано',
  },
];

const PHASE_MS = 1600;
const PHASE_GAP = 400;

/* ─── SVG colors ─── */
const ACCENT_GLOW = 'oklch(0.55 0.20 270)';
const GREEN = 'oklch(0.75 0.20 160)';
const YELLOW = 'oklch(0.75 0.18 70)';
const RED = 'oklch(0.65 0.22 25)';
const BLUE = 'oklch(0.68 0.16 230)';
const SURFACE = 'oklch(0.14 0.02 260)';
const BORDER = 'oklch(0.55 0.15 270 / 0.5)';
const GRID = 'oklch(0.25 0.02 260)';

/* Metric ranges for chart scaling */
const MAX_REQ = 600;
const MAX_ERR = 3.0;
const MAX_LAT = 1000;

/* ─── Component ─── */
export function MonitoringSection() {
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

  /* Auto-play all phases once */
  useEffect(() => {
    if (!hasEntered || hasAutoPlayed.current) return;
    hasAutoPlayed.current = true;
    const autoTimeouts: ReturnType<typeof setTimeout>[] = [];
    let delay = 600;
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

  /* Get the current phase's metrics (or defaults) */
  const currentPhase = activePhase >= 0 ? PHASES[activePhase] : null;
  const phaseColor = currentPhase?.color ?? GREEN;

  /* ─── Bar chart data (req/s) ─── */
  const BAR_W = 16;
  const BAR_MAX_H = 55;
  const BAR_BASE_Y = 92; //48
  const barX = (i: number) => 20 + i * 28;

  /* ─── Gauge data (error rate) ─── */
  const GAUGE_CX = 240;
  const GAUGE_CY = 88;
  const GAUGE_R = 34;

  /* ─── Line chart data (p99 latency) ─── */
  const LINE_BASE_Y = 96;
  const LINE_MAX_H = 60;
  const lineX = (i: number) => 342 + i * 28;

  return (
    <section ref={setRef} className="section-spacing mx-auto max-w-6xl px-6">
      {/* Header */}
      <motion.div
        className="mb-8 text-center"
        initial={{ opacity: 0, y: 16 }}
        animate={headerAnim}
        transition={{ duration: 0.5 }}
      >
        <h2 className="mb-3">Мониторинг и наблюдаемост</h2>
        <p className="mx-auto max-w-xl text-muted-foreground">
          Да знаеш за проблема преди потребителите ти — как RedRep
          открива инцидентите и се възстановява сам за секунди.
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
            Кликни фаза от долу, за да видиш как се развива инцидент в реално време.
          </p>
        </motion.div>
      )}

      {/* ─── Full-width SVG dashboard ─── */}
      <div className="w-full">
        <div className="relative w-full" style={{ aspectRatio: '480/180' }}>
          <svg
            viewBox="0 0 480 180"
            fill="none"
            preserveAspectRatio="xMidYMin meet"
            className="absolute inset-0 w-full h-full"
            aria-hidden="true"
          >
            <defs>
              <filter id="mg"><feDropShadow dx="0" dy="0" stdDeviation="3" floodColor={ACCENT_GLOW} floodOpacity="0.5" /></filter>
              <filter id="mg-g"><feDropShadow dx="0" dy="0" stdDeviation="3" floodColor={GREEN} floodOpacity="0.6" /></filter>
              <filter id="mg-y"><feDropShadow dx="0" dy="0" stdDeviation="3" floodColor={YELLOW} floodOpacity="0.6" /></filter>
              <filter id="mg-r"><feDropShadow dx="0" dy="0" stdDeviation="3" floodColor={RED} floodOpacity="0.6" /></filter>
              <filter id="mg-b"><feDropShadow dx="0" dy="0" stdDeviation="3" floodColor={BLUE} floodOpacity="0.6" /></filter>
            </defs>

            {/* ═══════════════════════════════════════
                CHART 1 — REQUESTS/SEC BAR CHART (x: 10–155)
                ═══════════════════════════════════════ */}
            <g>
              {/* Title */}
              <motion.text x="80" y="14" textAnchor="middle" fontSize="6" fontFamily="var(--font-mono)" fontWeight="700" fill={GREEN}
                initial={{ opacity: 0 }} animate={hasEntered ? { opacity: 1 } : {}} transition={{ delay: 0.15 }}
                style={{ filter: 'url(#mg-g)' }}
              >заявки/сек</motion.text>

              {/* Chart frame */}
              <rect x="14" y="20" width="138" height="82" rx="4" fill={SURFACE} stroke={BORDER} strokeWidth="0.6" />

              {/* Grid lines */}
              {[0.25, 0.5, 0.75, 1].map(f => (
                <line key={f} x1="16" y1={BAR_BASE_Y - f * BAR_MAX_H} x2="150" y2={BAR_BASE_Y - f * BAR_MAX_H}
                  stroke={GRID} strokeWidth="0.3" strokeDasharray="2 2" />
              ))}

              {/* Y-axis labels */}
              <text x="16" y={BAR_BASE_Y - BAR_MAX_H - 1} fontSize="3" fontFamily="var(--font-mono)" fill="oklch(0.50 0.02 260)">600</text>
              <text x="16" y={BAR_BASE_Y - BAR_MAX_H * 0.5 - 1} fontSize="3" fontFamily="var(--font-mono)" fill="oklch(0.50 0.02 260)">300</text>
              <text x="16" y={BAR_BASE_Y - 1} fontSize="3" fontFamily="var(--font-mono)" fill="oklch(0.50 0.02 260)">0</text>

              {/* Bars — grow upward from baseline using transform */}
              {PHASES.map((phase, i) => {
                const h = (phase.metrics.reqPerSec / MAX_REQ) * BAR_MAX_H;
                const x = barX(i);
                const color = phase.color;
                return (
                  <g key={phase.id}>
                    <motion.rect
                      x={x} y={BAR_BASE_Y - h} width={BAR_W} height={h}
                      rx="2" fill={color} fillOpacity="0.35" stroke={color} strokeWidth="0.8"
                      initial={{ scaleY: 0 }}
                      animate={vis(i) ? { scaleY: 1 } : { scaleY: 0 }}
                      transition={{ delay: 0.2, duration: 0.5, ease: 'easeOut' }}
                      style={{
                        transformOrigin: `${x + BAR_W / 2}px ${BAR_BASE_Y}px`,
                        filter: i === activePhase ? `url(#mg)` : undefined,
                      }}
                    />
                    {/* Value label above bar */}
                    <motion.text x={x + BAR_W / 2} y={BAR_BASE_Y - h - 3} textAnchor="middle"
                      fontSize="3.8" fontFamily="var(--font-mono)" fontWeight="600" fill={color}
                      initial={{ opacity: 0 }} animate={vis(i) ? { opacity: 1 } : {}} transition={{ delay: 0.55 }}
                    >{phase.metrics.reqPerSec}</motion.text>
                  </g>
                );
              })}

              {/* Phase labels below bars */}
              {['N', 'S', 'A', 'R', '✓'].map((label, i) => (
                <text key={label} x={barX(i) + BAR_W / 2} y={BAR_BASE_Y + 7} textAnchor="middle"
                  fontSize="3.5" fontFamily="var(--font-mono)" fill="oklch(0.50 0.02 260)">{label}</text>
              ))}

              {/* Current value readout — updates each phase */}
              <g>
                <rect x="30" y="106" width="100" height="14" rx="3" fill="oklch(0.12 0.02 260 / 0.8)" stroke={phaseColor} strokeWidth="0.6" />
                <text x="80" y="115.5" textAnchor="middle" fontSize="5" fontFamily="var(--font-mono)" fontWeight="700"
                  fill={phaseColor}
                >
                  {currentPhase ? `${currentPhase.metrics.reqPerSec} req/s` : '100 req/s'}
                </text>
              </g>
            </g>

            {/* ═══════════════════════════════════════
                CHART 2 — ERROR RATE GAUGE (x: 165–315)
                ═══════════════════════════════════════ */}
            <g>
              <motion.text x="240" y="14" textAnchor="middle" fontSize="6" fontFamily="var(--font-mono)" fontWeight="700" fill={YELLOW}
                initial={{ opacity: 0 }} animate={hasEntered ? { opacity: 1 } : {}} transition={{ delay: 0.2 }}
                style={{ filter: 'url(#mg-y)' }}
              >грешки</motion.text>

              {/* Chart frame */}
              <rect x="165" y="20" width="150" height="82" rx="4" fill={SURFACE} stroke={BORDER} strokeWidth="0.6" />

              {/* Semicircle gauge arc */}
              <path
                d={`M${GAUGE_CX - GAUGE_R},${GAUGE_CY} A${GAUGE_R},${GAUGE_R} 0 0,1 ${GAUGE_CX + GAUGE_R},${GAUGE_CY}`}
                fill="none" stroke={GRID} strokeWidth="6" strokeLinecap="round"
              />

              {/* Colored arc segments: green (0-1%), yellow (1-2%), red (2-3%) */}
              <path
                d={`M${GAUGE_CX - GAUGE_R},${GAUGE_CY} A${GAUGE_R},${GAUGE_R} 0 0,1 ${GAUGE_CX - GAUGE_R * Math.cos(Math.PI * 2 / 3)},${GAUGE_CY - GAUGE_R * Math.sin(Math.PI * 2 / 3)}`}
                fill="none" stroke={GREEN} strokeWidth="5" strokeLinecap="round" opacity="0.3"
              />
              <path
                d={`M${GAUGE_CX - GAUGE_R * Math.cos(Math.PI * 2 / 3)},${GAUGE_CY - GAUGE_R * Math.sin(Math.PI * 2 / 3)} A${GAUGE_R},${GAUGE_R} 0 0,1 ${GAUGE_CX + GAUGE_R * Math.cos(Math.PI / 3)},${GAUGE_CY - GAUGE_R * Math.sin(Math.PI / 3)}`}
                fill="none" stroke={YELLOW} strokeWidth="5" strokeLinecap="round" opacity="0.3"
              />
              <path
                d={`M${GAUGE_CX + GAUGE_R * Math.cos(Math.PI / 3)},${GAUGE_CY - GAUGE_R * Math.sin(Math.PI / 3)} A${GAUGE_R},${GAUGE_R} 0 0,1 ${GAUGE_CX + GAUGE_R},${GAUGE_CY}`}
                fill="none" stroke={RED} strokeWidth="5" strokeLinecap="round" opacity="0.3"
              />

              {/* Needle — rotates within semicircle, arrow tip glides along arc */}
              {(() => {
                const errRate = currentPhase ? currentPhase.metrics.errorRate : 0;
                const rotation = -90 + (errRate / MAX_ERR) * 180;
                const needleLen = GAUGE_R - 3;
                return (
                  <motion.g
                    style={{ transformOrigin: `${GAUGE_CX}px ${GAUGE_CY}px` }}
                    animate={{ rotate: rotation }}
                    transition={{ type: 'spring', stiffness: 80, damping: 15 }}
                  >
                    {/* Hidden shaft — just for structure, the visible part is the arrow */}
                    <line x1={GAUGE_CX} y1={GAUGE_CY} x2={GAUGE_CX} y2={GAUGE_CY - needleLen}
                      stroke="none"
                    />
                    {/* Visible arrow line */}
                    <line x1={GAUGE_CX} y1={GAUGE_CY + 2} x2={GAUGE_CX} y2={GAUGE_CY - needleLen + 5}
                      stroke={phaseColor} strokeWidth="1.4" strokeLinecap="round"
                      style={{ filter: 'url(#mg)' }}
                    />
                    {/* Arrowhead triangle at tip */}
                    <polygon
                      points={`${GAUGE_CX - 2.5},${GAUGE_CY - needleLen + 9} ${GAUGE_CX},${GAUGE_CY - needleLen + 2} ${GAUGE_CX + 2.5},${GAUGE_CY - needleLen + 9}`}
                      fill={phaseColor}
                      style={{ filter: 'url(#mg)' }}
                    />
                  </motion.g>
                );
              })()}

              {/* Gauge labels */}
              <text x={GAUGE_CX - GAUGE_R - 4} y={GAUGE_CY + 5} textAnchor="end" fontSize="3" fontFamily="var(--font-mono)" fill="oklch(0.50 0.02 260)">0%</text>
              <text x={GAUGE_CX} y={GAUGE_CY - GAUGE_R - 4} textAnchor="middle" fontSize="3" fontFamily="var(--font-mono)" fill="oklch(0.50 0.02 260)">1.5%</text>
              <text x={GAUGE_CX + GAUGE_R + 4} y={GAUGE_CY + 5} fontSize="3" fontFamily="var(--font-mono)" fill="oklch(0.50 0.02 260)">3%</text>

              {/* Phase markers on the arc */}
              {PHASES.map((phase, i) => {
                const angle = Math.PI - (phase.metrics.errorRate / MAX_ERR) * Math.PI;
                const cx = GAUGE_CX + (GAUGE_R + 8) * Math.cos(angle);
                const cy = GAUGE_CY - (GAUGE_R + 8) * Math.sin(angle);
                return (
                  <motion.circle key={phase.id} cx={cx} cy={cy} r="2.5"
                    fill={phase.color} fillOpacity={vis(i) ? 0.9 : 0.15}
                    stroke={phase.color} strokeWidth="0.5"
                    initial={{ scale: 0 }} animate={vis(i) ? { scale: 1 } : {}} transition={{ delay: 0.5, type: 'spring' }}
                  />
                );
              })}

              {/* Current value readout — updates each phase */}
              <g>
                <rect x="195" y="106" width="90" height="14" rx="3" fill="oklch(0.12 0.02 260 / 0.8)" stroke={phaseColor} strokeWidth="0.6" />
                <text x="240" y="115.5" textAnchor="middle" fontSize="5" fontFamily="var(--font-mono)" fontWeight="700"
                  fill={phaseColor}
                >
                  {currentPhase ? `${currentPhase.metrics.errorRate}%` : '0.1%'}
                </text>
              </g>
            </g>

            {/* ═══════════════════════════════════════
                CHART 3 — P99 LATENCY LINE CHART (x: 325–478)
                ═══════════════════════════════════════ */}
            <g>
              <motion.text x="400" y="14" textAnchor="middle" fontSize="6" fontFamily="var(--font-mono)" fontWeight="700" fill={BLUE}
                initial={{ opacity: 0 }} animate={hasEntered ? { opacity: 1 } : {}} transition={{ delay: 0.25 }}
                style={{ filter: 'url(#mg-b)' }}
              >p99 закъснение</motion.text>

              {/* Chart frame */}
              <rect x="328" y="20" width="142" height="82" rx="4" fill={SURFACE} stroke={BORDER} strokeWidth="0.6" />

              {/* Grid lines */}
              {[0.25, 0.5, 0.75, 1].map(f => (
                <line key={f} x1="328" y1={LINE_BASE_Y - f * LINE_MAX_H} x2="470" y2={LINE_BASE_Y - f * LINE_MAX_H}
                  stroke={GRID} strokeWidth="0.3" strokeDasharray="2 2" />
              ))}

              {/* Y-axis labels */}
              <text x="330" y={LINE_BASE_Y - LINE_MAX_H - 1} fontSize="3" fontFamily="var(--font-mono)" fill="oklch(0.50 0.02 260)">1s</text>
              <text x="330" y={LINE_BASE_Y - LINE_MAX_H * 0.5 - 1} fontSize="3" fontFamily="var(--font-mono)" fill="oklch(0.50 0.02 260)">500</text>
              <text x="330" y={LINE_BASE_Y - 1} fontSize="3" fontFamily="var(--font-mono)" fill="oklch(0.50 0.02 260)">0</text>

              {/* SLO threshold line at 500ms */}
              <motion.line
                x1="328" y1={LINE_BASE_Y - (500 / MAX_LAT) * LINE_MAX_H}
                x2="470" y2={LINE_BASE_Y - (500 / MAX_LAT) * LINE_MAX_H}
                stroke={RED} strokeWidth="0.5" strokeDasharray="3 2" opacity="0.6"
                initial={{ pathLength: 0 }} animate={hasEntered ? { pathLength: 1 } : {}} transition={{ delay: 0.3, duration: 0.5 }}
              />
              <text x="472" y={LINE_BASE_Y - (500 / MAX_LAT) * LINE_MAX_H + 2} fontSize="3" fontFamily="var(--font-mono)" fill={RED} opacity="0.7">SLO</text>

              {/* Polyline path — draws progressively as phases become visible */}
              {(() => {
                // Build path from only visible phases
                const visiblePoints = PHASES
                  .map((p, i) => ({ i, x: lineX(i), y: LINE_BASE_Y - (p.metrics.p99Latency / MAX_LAT) * LINE_MAX_H }))
                  .filter(p => vis(p.i));
                if (visiblePoints.length < 2) return null;
                const pathD = `M${visiblePoints.map(p => `${p.x},${p.y}`).join(' L')}`;
                return (
                  <motion.path
                    key={`line-${visiblePoints.length}`}
                    d={pathD}
                    stroke={GREEN} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 0.6, ease: 'easeOut' }}
                    style={{ filter: 'url(#mg-g)' }}
                  />
                );
              })()}

              {/* Data points */}
              {PHASES.map((phase, i) => {
                const x = lineX(i);
                const y = LINE_BASE_Y - (phase.metrics.p99Latency / MAX_LAT) * LINE_MAX_H;
                return (
                  <motion.g key={phase.id}>
                    <motion.circle cx={x} cy={y} r="3.5"
                      fill={phase.color} fillOpacity="0.2" stroke={phase.color} strokeWidth="1"
                      initial={{ scale: 0 }} animate={vis(i) ? { scale: 1 } : {}}
                      transition={{ delay: 0.4, type: 'spring', bounce: 0.4 }}
                      style={{ filter: i === activePhase ? 'url(#mg)' : undefined }}
                    />
                    {/* Value label */}
                    <motion.text x={x} y={y - 6} textAnchor="middle"
                      fontSize="3.8" fontFamily="var(--font-mono)" fontWeight="600" fill={phase.color}
                      initial={{ opacity: 0 }} animate={vis(i) ? { opacity: 1 } : {}} transition={{ delay: 0.5 }}
                    >{phase.metrics.p99Latency}</motion.text>
                  </motion.g>
                );
              })}

              {/* Phase labels */}
              {['N', 'S', 'A', 'R', '✓'].map((label, i) => (
                <text key={label} x={lineX(i)} y={LINE_BASE_Y + 7} textAnchor="middle"
                  fontSize="3.5" fontFamily="var(--font-mono)" fill="oklch(0.50 0.02 260)">{label}</text>
              ))}

              {/* Current value readout — updates each phase */}
              <g>
                <rect x="355" y="106" width="90" height="14" rx="3" fill="oklch(0.12 0.02 260 / 0.8)" stroke={phaseColor} strokeWidth="0.6" />
                <text x="400" y="115.5" textAnchor="middle" fontSize="5" fontFamily="var(--font-mono)" fontWeight="700"
                  fill={phaseColor}
                >
                  {currentPhase ? `${currentPhase.metrics.p99Latency}ms` : '50ms'}
                </text>
              </g>
            </g>

            {/* ═══════════════════════════════════════
                LOG STREAM (bottom area, y: 125–178)
                ═══════════════════════════════════════ */}
            <g>
              <rect x="14" y="126" width="452" height="50" rx="4" fill={SURFACE} stroke={BORDER} strokeWidth="0.5" />

              {/* Terminal header */}
              <line x1="14" y1="134" x2="466" y2="134" stroke={BORDER} strokeWidth="0.4" />
              <circle cx="22" cy="130" r="1.5" fill="oklch(0.65 0.22 25)" />
              <circle cx="28" cy="130" r="1.5" fill="oklch(0.75 0.18 70)" />
              <circle cx="34" cy="130" r="1.5" fill="oklch(0.70 0.18 155)" />
              <text x="48" y="132" fontSize="3.5" fontFamily="var(--font-mono)" fill="oklch(0.60 0.02 260)">логове</text>

              {/* Log lines — each visible phase adds a line */}
              {PHASES.map((phase, i) => {
                const lineY = 142 + i * 7;
                const logColor = phase.color;
                return (
                  <motion.text key={phase.id}
                    x="20" y={lineY} fontSize="3.8" fontFamily="var(--font-mono)" fill={logColor}
                    initial={{ opacity: 0, x: -10 }}
                    animate={vis(i) ? { opacity: 0.9, x: 0 } : {}}
                    transition={{ delay: 0.8, duration: 0.4, type: 'spring', bounce: 0.1 }}
                  >
                    {phase.logLine}
                  </motion.text>
                );
              })}

              {/* Blinking cursor */}
              {activePhase >= 0 && (
                <motion.rect
                  x="20" y={142 + Math.min(activePhase + 1, PHASES.length - 1) * 7 - 4}
                  width="4" height="5" rx="0.5"
                  fill={phaseColor}
                  animate={{ opacity: [1, 0, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                />
              )}
            </g>
          </svg>
        </div>
      </div>

      {/* ─── Phase cards: horizontal row below diagram ─── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 mt-0.5">
        {PHASES.map((phase, i) => {
          const Icon = phase.icon;
          const isActive = i === activePhase;
          const isDone = vis(i) && !isActive;
          return (
            <motion.div
              key={phase.id}
              initial={{ opacity: 0, y: 12 }}
              animate={hasEntered ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.15 + i * 0.06, duration: 0.4 }}
              onClick={() => handleClick(i)}
              role="button"
              tabIndex={0}
              onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') handleClick(i); }}
              className={`flex flex-col items-start gap-1.5 p-2.5 rounded-xl cursor-pointer transition-all duration-300 ${isActive && isAnimating
                ? 'liquid-glass ring-1 ring-accent/40'
                : isActive
                  ? 'liquid-glass ring-1 ring-accent/25'
                  : isDone
                    ? 'bg-accent/[0.04]'
                    : 'hover:bg-accent/[0.03]'
                }`}
            >
              <div className="flex items-center gap-1.5 w-full">
                <span className={`text-[10px] font-mono font-medium transition-colors duration-300 ${isActive ? 'text-accent' : isDone ? 'text-accent/50' : 'text-muted-foreground/50'
                  }`}>
                  {String(i + 1).padStart(2, '0')}
                </span>
                <div className={`flex size-7 items-center justify-center rounded-lg transition-colors duration-300 ${isActive
                  ? 'bg-accent/15 text-accent'
                  : isDone
                    ? 'bg-accent/8 text-accent/60'
                    : 'bg-muted text-muted-foreground'
                  }`}>
                  <Icon className="size-3.5" />
                </div>
                <h4 className={`text-xs font-semibold font-[family-name:var(--font-display)] transition-colors duration-300 ${isActive ? 'text-foreground' : isDone ? 'text-foreground/70' : 'text-foreground/50'
                  }`}>
                  {phase.title}
                </h4>
              </div>
              <p className={`text-[11px] leading-relaxed transition-colors duration-300 ${isActive || isDone ? 'text-muted-foreground' : 'text-muted-foreground/40'
                }`}>
                {phase.description}
              </p>
              <ul className={`space-y-0.5 transition-all duration-300 ${isActive || isDone ? 'opacity-100 max-h-40' : 'opacity-0 max-h-0 overflow-hidden'
                }`}>
                {phase.substeps.map(s => (
                  <li key={s} className="text-[10px] font-mono text-muted-foreground/80 flex items-start gap-1.5">
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
        <Activity className="size-4 text-accent shrink-0" />
        <p className="text-xs text-muted-foreground leading-relaxed">
          <span className="font-semibold text-foreground">Краен резултат:</span>{' '}
          Prometheus събира показатели всеки 15s, предупрежденията се задействат за секунди след спукане на SLO,
          а Kubernetes автоматично мащабира преди потребителите да усетят — трите стълба на наблюдаемостта
          (показатели, логове, трасиране) пазят RedRep да работи без престой.
        </p>
      </motion.div>
    </section>
  );
}
