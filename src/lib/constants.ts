import type { ThreadSort } from '@/types';

/**
 * RedRep Design System Constants
 * "Scholarly Neon" — Luxury Minimal + Retro-Futurist
 */

// --- Typography ---
export const fonts = {
  display: '"Space Grotesk", ui-sans-serif, system-ui, sans-serif',
  body: '"DM Sans", ui-sans-serif, system-ui, sans-serif',
  mono: '"JetBrains Mono", ui-monospace, monospace',
} as const;

// --- Spacing Rhythm (base: 4px) ---
export const spacing = {
  sectionGap: '6rem',       // 96px between major sections (mobile)
  sectionGapMd: '8rem',     // 128px between major sections (desktop)
  componentGap: '1.5rem',   // 24px between components
  componentGapLg: '2rem',   // 32px between components
  innerPadding: '1rem',     // 16px inner padding
  innerPaddingLg: '1.5rem', // 24px inner padding
} as const;

// --- Animation Durations ---
export const motion = {
  fast: '150ms',
  normal: '200ms',
  slow: '300ms',
  entrance: '600ms',
  gradientMesh: '12s',
  float: '6s',
} as const;

// --- Z-Index Scale ---
export const zIndex = {
  base: 0,
  dropdown: 10,
  sticky: 20,
  fixed: 30,
  modal: 50,
  popover: 60,
  tooltip: 70,
} as const;

// --- Breakpoints ---
export const breakpoints = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
} as const;

// --- Categories ---
export const CATEGORIES = [
  'general',
  'homework',
  'exam-prep',
  'project',
  'career',
  'campus-life',
] as const;

export type Category = (typeof CATEGORIES)[number];

// --- Category Display Config ---
export const CATEGORY_CONFIG: Record<Category, { label: string; color: string }> = {
  general: { label: 'General', color: 'oklch(0.55 0.20 270)' },
  homework: { label: 'Homework', color: 'oklch(0.75 0.18 70)' },
  'exam-prep': { label: 'Exam Prep', color: 'oklch(0.55 0.22 25)' },
  project: { label: 'Project', color: 'oklch(0.65 0.15 160)' },
  career: { label: 'Career', color: 'oklch(0.60 0.18 330)' },
  'campus-life': { label: 'Campus Life', color: 'oklch(0.70 0.12 40)' },
} as const;

// --- App Config ---
export const APP_CONFIG = {
  name: 'RedRep',
  tagline: 'Your questions, answered by peers.',
  description: 'A Reddit-style student Q&A platform for academic help-seeking.',
  maxThreads: 100,
  searchDebounce: 300,
  storageKey: 'redrep-threads',
  themeKey: 'redrep-theme',
} as const;

// --- Thread Sort Options ---
export const THREAD_SORTS: { value: ThreadSort; label: string; icon: string }[] = [
  { value: 'hot', label: 'Hot', icon: 'Flame' },
  { value: 'new', label: 'New', icon: 'Clock' },
  { value: 'top', label: 'Top', icon: 'TrendingUp' },
] as const;

// --- Stats Marquee Items ---
export const STATS_ITEMS = [
  { label: 'Questions asked', value: '1,247' },
  { label: 'Answers given', value: '3,892' },
  { label: 'Best answers', value: '891' },
  { label: 'Active students', value: '342' },
  { label: 'Categories', value: '6' },
  { label: 'Reputation earned', value: '28.4K' },
] as const;
