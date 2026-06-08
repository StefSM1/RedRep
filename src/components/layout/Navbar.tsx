import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ThemeToggle } from './ThemeToggle';
import { APP_CONFIG } from '@/lib/constants';
import { cn } from '@/lib/utils';

const NAV_ITEMS = [
  { to: '/', label: 'Home' },
  { to: '/preview', label: 'Preview' },
] as const;

export function Navbar() {
  return (
    <nav
      className="fixed top-4 left-4 right-4 z-40 mx-auto max-w-2xl"
      role="navigation"
      aria-label="Main navigation"
    >
      <div className="liquid-glass flex items-center justify-between rounded-2xl px-4 py-2.5 sm:px-6">
        {/* Logo / Wordmark */}
        <NavLink
          to="/"
          className="font-[family-name:var(--font-display)] text-lg font-bold tracking-tight text-foreground transition-opacity hover:opacity-80"
        >
          {APP_CONFIG.name}
        </NavLink>

        {/* Tab Navigation */}
        <div className="relative flex items-center gap-1">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                cn(
                  'relative rounded-lg px-3 py-1.5 text-sm font-medium transition-colors cursor-pointer',
                  isActive
                    ? 'text-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                )
              }
            >
              {({ isActive }) => (
                <>
                  <span className="relative z-10">{item.label}</span>
                  {isActive && (
                    <motion.span
                      layoutId="navbar-active-tab"
                      className="absolute inset-0 rounded-lg bg-muted"
                      transition={{ type: 'spring', bounce: 0.2, duration: 0.5 }}
                    />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </div>

        {/* Theme Toggle */}
        <ThemeToggle />
      </div>
    </nav>
  );
}
