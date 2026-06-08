import { Outlet } from "react-router-dom";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";
import { RouteBackdrop } from "@/components/shared/RouteBackdrop";

export function AppShell() {
  return (
    <div className="app-noise relative flex min-h-screen flex-col bg-background text-foreground transition-colors duration-300 dark-app-bg light-app-bg">
      {/* ── Dark mode: multi-point glow system (idea A) ──
          5 smaller, strategically placed "pools of light" replacing
          the 2 huge color-flood orbs. Each glow sits behind a key
          page section for atmospheric depth. */}
      <div
        className="fixed inset-0 pointer-events-none overflow-hidden z-0"
        aria-hidden="true"
      >
        {/* 1. Warm amber glow — top-left*/}
        <div
          className="absolute dark-bg-decor"
          style={{
            opacity: 0,
            top: "-5%",
            left: "-20%",
            width: "50vw",
            height: "50vw",
            borderRadius: "50%",
            background:
              "radial-gradient(circle, oklch(0.72 0.16 70 / 0.40) 0%, oklch(0.60 0.12 70 / 0.15) 40%, transparent 60%)",
            filter: "blur(40px)",
          }}
        />
        {/* 2. Cool indigo glow — center-right, behind architecture */}
        <div
          className="absolute dark-bg-decor"
          style={{
            opacity: 0,
            top: "10%",
            right: "-5%",
            width: "30vw",
            height: "30vw",
            borderRadius: "50%",
            background:
              "radial-gradient(circle, oklch(0.55 0.20 270 / 0.35) 0%, oklch(0.45 0.15 270 / 0.12) 40%, transparent 75%)",
            filter: "blur(50px)",
          }}
        />
        {/* 3. Soft warm rose — lower-right, behind data flow */}
        <div
          className="absolute dark-bg-decor"
          style={{
            opacity: 0,
            top: "65%",
            right: "5%",
            width: "25vw",
            height: "25vw",
            borderRadius: "50%",
            background:
              "radial-gradient(circle, oklch(0.60 0.18 25 / 0.28) 0%, oklch(0.50 0.12 25 / 0.10) 40%, transparent 40%)",
            filter: "blur(40px)",
          }}
        />
        {/* 5. Deep purple accent — bottom-left, ambient fill */}
        <div
          className="absolute dark-bg-decor"
          style={{
            opacity: 0,
            bottom: "-5%",
            left: "10%",
            width: "25vw",
            height: "25vw",
            borderRadius: "50%",
            background:
              "radial-gradient(circle, oklch(0.50 0.18 300 / 0.25) 0%, oklch(0.40 0.12 300 / 0.08) 40%, transparent 70%)",
            filter: "blur(50px)",
          }}
        />
      </div>
      {/* ── Light mode: organic leaf/vine patterns + warm glow ── */}
      <div
        className="fixed inset-0 pointer-events-none overflow-hidden z-0"
        aria-hidden="true"
      >
        {/* Warm amber glow — top-right */}
        <div
          className="absolute light-bg-decor"
          style={{
            top: "-10%",
            right: "-5%",
            width: "40vw",
            height: "40vw",
            borderRadius: "50%",
            background:
              "radial-gradient(circle, oklch(0.82 0.12 70 / 0.25) 0%, oklch(0.85 0.08 70 / 0.10) 40%, transparent 65%)",
            filter: "blur(30px)",
          }}
        />
        {/* Secondary mint glow — bottom-left */}
        <div
          className="absolute light-bg-decor"
          style={{
            bottom: "-25%",
            left: "-10%",
            width: "55vw",
            height: "55vw",
            borderRadius: "50%",
            background:
              "radial-gradient(circle, oklch(0.88 0.06 160 / 0.35) 0%, oklch(0.90 0.04 160 / 0.15) 40%, transparent 65%)",
            filter: "blur(30px)",
          }}
        />
        {/* Vine SVG — top-left corner */}
        <svg
          className="absolute light-bg-decor"
          style={{
            top: "5%",
            left: "2%",
            width: "28vw",
            maxWidth: "400px",
            opacity: 0.18,
          }}
          viewBox="0 0 400 500"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Main vine stem */}
          <path
            d="M20 480 C40 400, 80 350, 100 280 C120 210, 90 160, 120 100 C150 40, 180 20, 200 10"
            stroke="oklch(0.70 0.10 160)"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          {/* Branch 1 */}
          <path
            d="M80 340 C100 320, 130 310, 150 330"
            stroke="oklch(0.72 0.09 160)"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
          {/* Leaf 1 */}
          <path
            d="M150 330 C160 310, 175 305, 170 325 C165 340, 150 340, 150 330Z"
            fill="oklch(0.80 0.06 160 / 0.6)"
          />
          {/* Branch 2 */}
          <path
            d="M100 280 C70 260, 50 230, 55 200"
            stroke="oklch(0.72 0.09 160)"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
          {/* Leaf 2 */}
          <path
            d="M55 200 C40 190, 35 175, 50 180 C65 185, 60 200, 55 200Z"
            fill="oklch(0.82 0.05 155 / 0.5)"
          />
          {/* Branch 3 */}
          <path
            d="M110 180 C140 170, 165 155, 170 130"
            stroke="oklch(0.72 0.09 160)"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          {/* Leaf 3 */}
          <path
            d="M170 130 C180 115, 195 110, 188 128 C180 142, 170 138, 170 130Z"
            fill="oklch(0.78 0.07 160 / 0.55)"
          />
          {/* Small leaf on main stem */}
          <path
            d="M95 310 C85 295, 90 280, 100 290 C110 300, 100 310, 95 310Z"
            fill="oklch(0.83 0.05 165 / 0.45)"
          />
          {/* Leaf 4 — near top */}
          <path
            d="M130 90 C115 75, 118 58, 133 68 C148 78, 138 92, 130 90Z"
            fill="oklch(0.80 0.06 160 / 0.5)"
          />
        </svg>
        {/* Vine SVG — bottom-right corner (mirrored) */}
        <svg
          className="absolute light-bg-decor"
          style={{
            bottom: "3%",
            right: "3%",
            width: "22vw",
            maxWidth: "340px",
            opacity: 0.15,
            transform: "scaleX(-1)",
          }}
          viewBox="0 0 400 500"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M20 480 C40 400, 80 350, 100 280 C120 210, 90 160, 120 100 C150 40, 180 20, 200 10"
            stroke="oklch(0.72 0.09 160)"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          <path
            d="M80 340 C100 320, 130 310, 150 330"
            stroke="oklch(0.72 0.09 160)"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
          <path
            d="M150 330 C160 310, 175 305, 170 325 C165 340, 150 340, 150 330Z"
            fill="oklch(0.80 0.06 160 / 0.55)"
          />
          <path
            d="M100 280 C70 260, 50 230, 55 200"
            stroke="oklch(0.72 0.09 160)"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
          <path
            d="M55 200 C40 190, 35 175, 50 180 C65 185, 60 200, 55 200Z"
            fill="oklch(0.82 0.05 155 / 0.45)"
          />
          <path
            d="M110 180 C140 170, 165 155, 170 130"
            stroke="oklch(0.72 0.09 160)"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <path
            d="M170 130 C180 115, 195 110, 188 128 C180 142, 170 138, 170 130Z"
            fill="oklch(0.78 0.07 160 / 0.5)"
          />
          <path
            d="M130 90 C115 75, 118 58, 133 68 C148 78, 138 92, 130 90Z"
            fill="oklch(0.80 0.06 160 / 0.45)"
          />
        </svg>
      </div>
      <Navbar />
      {/* Route-specific background overlay (dot-grid on Preview, dims orbs) */}
      <RouteBackdrop />
      {/* Content area — padded to avoid navbar overlap */}
      <main className="relative z-10 flex-1 pt-20">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
