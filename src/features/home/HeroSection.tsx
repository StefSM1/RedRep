import { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { APP_CONFIG } from '@/lib/constants';
import { HeroPreview } from './HeroPreview';
import { StatsMarquee } from './StatsMarquee';

/* ---------- Animation variants ---------- */
const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.15, delayChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 28 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring' as const, bounce: 0.3, duration: 0.7 },
  },
};

/* ---------- Main component ---------- */
export function HeroSection() {
  const navigate = useNavigate();
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.2 });

  return (
    <>
      <section
        ref={sectionRef}
        className="relative flex min-h-[80vh] items-center overflow-hidden px-6"
      >
        <motion.div
          className="relative z-10 mx-auto grid w-full max-w-5xl grid-cols-1 items-center gap-8 lg:grid-cols-[55%_45%]"
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
        >
          {/* Left column — Text + CTAs */}
          <motion.div
            variants={itemVariants}
            className="flex flex-col items-start"
          >
            {/* Hero box — liquid glass */}
            <motion.div
              variants={itemVariants}
              className="liquid-glass rounded-3xl px-8 py-10 sm:px-12 sm:py-14 w-full"
            >
              {/* Title */}
              <h1 className="mb-4 font-[family-name:var(--font-display)]">
                {APP_CONFIG.name}
              </h1>

              {/* Tagline */}
              <p className="max-w-lg text-lg text-muted-foreground">
                {APP_CONFIG.tagline}
              </p>

              {/* Subtitle */}
              <p className="mt-3 max-w-xl text-sm text-muted-foreground/70">
                {APP_CONFIG.description}
              </p>

              {/* CTA Buttons */}
              <div className="mt-8 flex flex-wrap gap-3">
                <Button
                  variant="outline"
                  className="cursor-pointer"
                  onClick={() => {
                    document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                >
                  Explore Features
                </Button>
                <Button
                  className="cursor-pointer"
                  onClick={() => navigate('/preview')}
                >
                  Try Preview &rarr;
                </Button>
              </div>
            </motion.div>
          </motion.div>

          {/* Right column — Animated Preview Frame */}
          <div className="hidden lg:block">
            <HeroPreview />
          </div>
        </motion.div>
      </section>

      {/* Stats Marquee — visual divider below hero */}
      <StatsMarquee />
    </>
  );
}
