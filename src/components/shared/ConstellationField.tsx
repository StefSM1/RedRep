import { useMemo } from "react";

/**
 * ConstellationField — Atmospheric decoration for the Preview route.
 *
 * Renders a fixed full-viewport SVG of hand-placed stars (in the
 * shapes of well-known northern-hemisphere constellations) with
 * faint connecting lines and a glow halo on each star. The whole
 * layer is purely decorative (pointer-events: none) and only
 * appears on Preview routes.
 *
 * Why real constellations? Random "star fields" feel generic. Real
 * shapes give the dark mode a sense of place and craft — a
 * "scholarly night sky" that matches the project's brand voice.
 *
 * The constellations are positioned to wrap across the viewport.
 * Coordinates are in viewBox space (0 0 1600 900), so the SVG
 * scales responsively while keeping star positions stable.
 */

type Star = { x: number; y: number; r: number; mag: number };
type Conn = [number, number];

/** A constellation is a set of stars + a list of line segments
 *  connecting them. Star indices in `conn` refer to positions in
 *  the `stars` array. */
type Constellation = {
  name: string;
  // Where to anchor the constellation's top-left in the field
  // (so we can scatter multiple without overlap).
  ox: number;
  oy: number;
  stars: Star[];
  conn: Conn[];
};

/* ---------- Real constellation data (manually placed) ---------- */

/** Ursa Major / the Big Dipper — most iconic, with the distinctive
 *  "scoop" + "handle" silhouette. */
const URSAMAJOR: Constellation = {
  name: "Ursa Major",
  ox: 80,
  oy: 90,
  stars: [
    { x: 0, y: 0, r: 2.2, mag: 1 }, // Alkaid (handle tip)
    { x: 70, y: 35, r: 2.0, mag: 1 },
    { x: 140, y: 50, r: 1.9, mag: 1 },
    { x: 210, y: 60, r: 2.4, mag: 1 }, // Mizar (handle-base)
    { x: 270, y: 130, r: 1.8, mag: 2 }, // bowl corner 1
    { x: 340, y: 110, r: 1.6, mag: 2 }, // bowl corner 2
    { x: 380, y: 170, r: 2.0, mag: 1 }, // Megrez
  ],
  conn: [
    [0, 1],
    [1, 2],
    [2, 3], // handle
    [3, 6], // handle-to-bowl
    [6, 5],
    [5, 4],
    [4, 3], // bowl
  ],
};

/** Orion — belt + shoulders + sword. */
const ORION: Constellation = {
  name: "Orion",
  ox: 720,
  oy: 130,
  stars: [
    { x: 0, y: 0, r: 2.0, mag: 1 }, // Betelgeuse (shoulder)
    { x: 130, y: 20, r: 1.8, mag: 1 }, // Bellatrix
    { x: 70, y: 130, r: 1.4, mag: 2 }, // Mintaka (belt)
    { x: 110, y: 140, r: 1.4, mag: 2 }, // Alnilam (belt center)
    { x: 150, y: 150, r: 1.4, mag: 2 }, // Alnitak (belt)
    { x: 40, y: 250, r: 2.2, mag: 1 }, // Saiph
    { x: 160, y: 230, r: 1.6, mag: 2 }, // Rigel
  ],
  conn: [
    [0, 1], // shoulders
    [0, 2],
    [1, 4], // shoulders to belt
    [2, 3],
    [3, 4], // belt
    [2, 5],
    [4, 6], // belt to feet
    [0, 5],
    [1, 6], // shoulders to feet
  ],
};

/** Cassiopeia — the iconic "W" shape. */
const CASSIOPEIA: Constellation = {
  name: "Cassiopeia",
  ox: 120,
  oy: 560,
  stars: [
    { x: 0, y: 30, r: 1.6, mag: 2 },
    { x: 60, y: 0, r: 1.8, mag: 1 },
    { x: 130, y: 50, r: 1.6, mag: 2 },
    { x: 200, y: 0, r: 1.8, mag: 1 },
    { x: 270, y: 35, r: 1.6, mag: 2 },
  ],
  conn: [
    [0, 1],
    [1, 2],
    [2, 3],
    [3, 4],
  ],
};

/** Cygnus — the Northern Cross. */
const CYGNUS: Constellation = {
  name: "Cygnus",
  ox: 1100,
  oy: 600,
  stars: [
    { x: 0, y: 130, r: 1.8, mag: 1 }, // tail
    { x: 60, y: 70, r: 1.5, mag: 2 },
    { x: 100, y: 30, r: 2.4, mag: 1 }, // Deneb (head)
    { x: 110, y: 100, r: 1.5, mag: 2 }, // center
    { x: 130, y: 200, r: 1.8, mag: 1 }, // Albireo (beak)
  ],
  conn: [
    [0, 1],
    [1, 2], // tail → head
    [1, 3],
    [3, 4], // head + center + beak
  ],
};

/** Leo — sickle + triangle. */
const LEO: Constellation = {
  name: "Leo",
  ox: 950,
  oy: 700,
  stars: [
    { x: 0, y: 0, r: 2.2, mag: 1 }, // Regulus
    { x: 50, y: 30, r: 1.4, mag: 2 },
    { x: 100, y: 20, r: 1.6, mag: 2 },
    { x: 140, y: -20, r: 1.4, mag: 2 },
    { x: 180, y: 50, r: 2.0, mag: 1 }, // Denebola
    { x: 220, y: 80, r: 1.6, mag: 2 },
    { x: 150, y: 110, r: 1.6, mag: 2 }, // Zosma
  ],
  conn: [
    [0, 1],
    [1, 2],
    [2, 3],
    [3, 4], // sickle
    [4, 5],
    [4, 6], // triangle
    [0, 6], // Regulus → Zosma
  ],
};

/** Lyra — small, just Vega and its parallelogram. */
const LYRA: Constellation = {
  name: "Lyra",
  ox: 530,
  oy: 80,
  stars: [
    { x: 0, y: 0, r: 2.6, mag: 1 }, // Vega
    { x: 30, y: 40, r: 1.2, mag: 2 },
    { x: 70, y: 50, r: 1.2, mag: 2 },
    { x: 60, y: 90, r: 1.2, mag: 2 },
    { x: 20, y: 80, r: 1.2, mag: 2 },
  ],
  conn: [
    [0, 1],
    [1, 2],
    [2, 3],
    [3, 4],
    [4, 0], // parallelogram
  ],
};

/** Andromeda — the chained princess, a long sweeping arc of stars.
 *  Large constellation placed in the top-right to fill the void.
 *  Mirach (β) and Alpheratz (α/ Sirrah) are the anchors. */
const ANDROMEDA: Constellation = {
  name: "Andromeda",
  ox: 1180,
  oy: 40,
  stars: [
    { x: 0, y: 80, r: 2.8, mag: 1 }, // Alpheratz (α — shared with Pegasus)
    { x: 90, y: 60, r: 2.0, mag: 1 }, // Mirach (β)
    { x: 180, y: 40, r: 1.8, mag: 1 }, // γ And
    { x: 270, y: 20, r: 1.6, mag: 2 }, // δ And
    { x: 350, y: 0, r: 2.0, mag: 1 }, // ε And (tail)
    // A faint "branch" arm — the M31 galaxy arm hint
    { x: 130, y: 120, r: 1.4, mag: 2 },
    { x: 210, y: 140, r: 1.2, mag: 3 },
  ],
  conn: [
    [0, 1],
    [1, 2],
    [2, 3],
    [3, 4], // main spine arc
    [1, 5],
    [5, 6], // branch arm
  ],
};

/** Perseus — the hero holding Medusa's head. Distinctive Y-shape
 *  with bright Mirfak at the center and Algol (the demon star)
 *  at the base. Medium-sized, placed in upper-right quadrant. */
const PERSEUS: Constellation = {
  name: "Perseus",
  ox: 1350,
  oy: 250,
  stars: [
    { x: 80, y: 0, r: 2.4, mag: 1 }, // Mirfak (α — center)
    { x: 40, y: 60, r: 1.6, mag: 2 }, // δ Per
    { x: 0, y: 120, r: 1.8, mag: 1 }, // ζ Per (left arm)
    { x: 120, y: 50, r: 1.5, mag: 2 }, // γ Per
    { x: 160, y: 110, r: 2.2, mag: 1 }, // Algol (β — demon star!)
    { x: 60, y: 160, r: 1.4, mag: 2 }, // ε Per (lower)
  ],
  conn: [
    [0, 1],
    [1, 2], // left arm (Y-branch)
    [0, 3],
    [3, 4], // right arm (Y-branch)
    [1, 5],
    [2, 5], // lower body
  ],
};

/** Aries — the ram. Small, compact, 4-star crook shape.
 *  Hamal (α Arietis) is the only bright star. Fills the
 *  mid-right gap between Perseus and Leo. */
const ARIES: Constellation = {
  name: "Aries",
  ox: 1050,
  oy: 380,
  stars: [
    { x: 0, y: 20, r: 2.2, mag: 1 }, // Hamal (α)
    { x: 60, y: 0, r: 1.8, mag: 1 }, // Sheratan (β)
    { x: 90, y: 25, r: 1.4, mag: 2 }, // γ Ari
    { x: 120, y: 50, r: 1.2, mag: 2 }, // δ Ari
  ],
  conn: [
    [0, 1],
    [1, 2],
    [2, 3], // crook
  ],
};

const CONSTELLATIONS: Constellation[] = [
  URSAMAJOR,
  ORION,
  CASSIOPEIA,
  CYGNUS,
  LEO,
  LYRA,
  ANDROMEDA,
  PERSEUS,
  ARIES,
];

/** A handful of single scattered "background" stars (no
 *  connections) to give the void some depth between constellations.
 *  Mix of dim pinpoints and a few brighter/larger ones for variety. */
const FIELD_STARS: Star[] = (() => {
  // Hand-picked positions to fill the negative space without
  // overlapping the constellations.
  return [
    // --- Existing scattered dim stars ---
    { x: 250, y: 30, r: 0.8, mag: 3 },
    { x: 420, y: 80, r: 0.6, mag: 3 },
    { x: 480, y: 250, r: 0.8, mag: 3 },
    { x: 350, y: 380, r: 0.6, mag: 3 },
    { x: 600, y: 450, r: 0.7, mag: 3 },
    { x: 800, y: 480, r: 0.6, mag: 3 },
    { x: 850, y: 320, r: 0.7, mag: 3 },
    { x: 720, y: 750, r: 0.6, mag: 3 },
    { x: 450, y: 700, r: 0.7, mag: 3 },
    { x: 60, y: 400, r: 0.6, mag: 3 },
    { x: 30, y: 800, r: 0.7, mag: 3 },
    // --- Top-right quadrant fill (was sparse) ---
    { x: 1250, y: 180, r: 0.8, mag: 3 },
    { x: 1400, y: 120, r: 0.7, mag: 3 },
    { x: 1480, y: 60, r: 0.6, mag: 3 },
    { x: 1320, y: 350, r: 0.8, mag: 3 },
    { x: 1450, y: 420, r: 0.7, mag: 3 },
    { x: 1520, y: 300, r: 0.6, mag: 3 },
    { x: 1550, y: 500, r: 0.7, mag: 3 },
    { x: 1380, y: 750, r: 0.6, mag: 3 },
    { x: 1500, y: 600, r: 0.8, mag: 3 },
    { x: 1500, y: 100, r: 0.6, mag: 3 },
    // --- A few brighter stars (mag 2) for variety ---
    { x: 1350, y: 180, r: 1.4, mag: 2 }, // bright top-right
    { x: 1500, y: 450, r: 1.2, mag: 2 }, // bright mid-right
    { x: 680, y: 520, r: 1.3, mag: 2 }, // bright center
    { x: 950, y: 50, r: 1.2, mag: 2 }, // bright top-center
    { x: 300, y: 850, r: 1.3, mag: 2 }, // bright bottom-left
    // --- A couple slightly larger feature stars ---
    { x: 1100, y: 80, r: 1.8, mag: 1 }, // large top-right accent
    { x: 580, y: 680, r: 1.6, mag: 1 }, // large bottom-center
  ];
})();

interface ConstellationFieldProps {
  /** When false, render nothing (used by RouteBackdrop to fade in/out). */
  active: boolean;
}

export function ConstellationField({ active }: ConstellationFieldProps) {
  // Pre-compute the line segments (relative to constellation ox/oy).
  const lines = useMemo(() => {
    const out: Array<{ x1: number; y1: number; x2: number; y2: number }> = [];
    for (const c of CONSTELLATIONS) {
      for (const [a, b] of c.conn) {
        out.push({
          x1: c.ox + c.stars[a].x,
          y1: c.oy + c.stars[a].y,
          x2: c.ox + c.stars[b].x,
          y2: c.oy + c.stars[b].y,
        });
      }
    }
    return out;
  }, []);

  return (
    <div
      className={`fixed inset-0 pointer-events-none z-[2] constellation-field transition-opacity duration-700 ${
        active ? "opacity-100" : "opacity-0"
      }`}
      aria-hidden="true"
    >
      <svg
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 1600 900"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          {/* Soft white glow for the stars. */}
          <radialGradient id="star-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="1" />
            <stop offset="35%" stopColor="#FFFFFF" stopOpacity="0.55" />
            <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
          </radialGradient>
          {/* A second halo (warm-amber) for the brightest stars (mag 1). */}
          <radialGradient id="star-glow-amber" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FFE9C2" stopOpacity="0.95" />
            <stop offset="35%" stopColor="#FFD0A0" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#FFD0A0" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Constellation connecting lines — clearly visible
            so the constellation shapes read at a glance. */}
        <g className="constellation-lines">
          {lines.map((l, i) => (
            <line
              key={i}
              x1={l.x1}
              y1={l.y1}
              x2={l.x2}
              y2={l.y2}
              stroke="oklch(0.90 0.02 260)"
              strokeWidth="0.7"
              strokeOpacity="0.4"
            />
          ))}
        </g>

        {/* Field stars (dim background) — brighter stars (mag 1-2)
            get a small glow halo, dim ones (mag 3) stay as pinpoints. */}
        <g className="field-stars">
          {FIELD_STARS.map((s, i) => (
            <g key={i}>
              {s.mag <= 2 && (
                <circle
                  cx={s.x}
                  cy={s.y}
                  r={s.r * 4}
                  fill={s.mag === 1 ? "url(#star-glow-amber)" : "url(#star-glow)"}
                  opacity={s.mag === 1 ? 0.45 : 0.3}
                />
              )}
              <circle
                cx={s.x}
                cy={s.y}
                r={s.r}
                fill="#FFFFFF"
                fillOpacity={s.mag === 1 ? 1 : s.mag === 2 ? 0.85 : 0.6}
              />
              {s.mag === 1 && (
                <g opacity={0.3} stroke="#FFFFFF" strokeWidth="0.3">
                  <line x1={s.x - s.r * 2.5} y1={s.y} x2={s.x + s.r * 2.5} y2={s.y} />
                  <line x1={s.x} y1={s.y - s.r * 2.5} x2={s.x} y2={s.y + s.r * 2.5} />
                </g>
              )}
            </g>
          ))}
        </g>

        {/* Constellation stars — drawn as glowing circles.
            Brightest stars (mag=1) get a bigger halo + amber tint. */}
        {CONSTELLATIONS.map((c) =>
          c.stars.map((s, i) => {
            const cx = c.ox + s.x;
            const cy = c.oy + s.y;
            const isBright = s.mag === 1;
            const haloR = isBright ? s.r * 8 : s.r * 5;
            return (
              <g key={`${c.name}-${i}`}>
                {/* Outer halo — brighter for mag-1 stars */}
                <circle
                  cx={cx}
                  cy={cy}
                  r={haloR}
                  fill={isBright ? "url(#star-glow-amber)" : "url(#star-glow)"}
                  opacity={isBright ? 0.65 : 0.45}
                />
                {/* Bright core */}
                <circle
                  cx={cx}
                  cy={cy}
                  r={s.r}
                  fill="#FFFFFF"
                  opacity={isBright ? 1 : 0.9}
                />
                {/* Cross-spike for the brightest stars — gives a
                    "glitter" feel. Longer spikes on bigger stars. */}
                {isBright && (
                  <g opacity={0.4} stroke="#FFFFFF" strokeWidth="0.5">
                    <line x1={cx - s.r * 4} y1={cy} x2={cx + s.r * 4} y2={cy} />
                    <line x1={cx} y1={cy - s.r * 4} x2={cx} y2={cy + s.r * 4} />
                  </g>
                )}
              </g>
            );
          }),
        )}
      </svg>
    </div>
  );
}
