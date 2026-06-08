import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { User, GraduationCap } from 'lucide-react';

/* ---------- Data ---------- */
const TECH_STACK = [
  'React 19',
  'TypeScript',
  'Vite',
  'Tailwind CSS v4',
  'shadcn/ui',
  'Framer Motion',
  'React Router',
  'Lucide Icons',
] as const;

const TEAM = [
  {
    name: 'Student Developer',
    role: 'Full-Stack Engineer & UI/UX Designer',
    initials: 'SD',
  },
] as const;

/* ---------- Animation variants ---------- */
const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12, delayChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring' as const, bounce: 0.25, duration: 0.6 },
  },
};

/* ---------- Main component ---------- */
export function TeamSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.2 });

  return (
    <section
      ref={sectionRef}
      className="section-spacing mx-auto max-w-3xl px-6"
    >
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate={isInView ? 'visible' : 'hidden'}
        className="space-y-8"
      >
        {/* Section header */}
        <motion.div variants={itemVariants} className="text-center">
          <h2 className="mb-3">About RedRep</h2>
          <p className="mx-auto max-w-lg text-muted-foreground">
            A university project exploring what a modern academic Q&A platform
            can look like when UI/UX quality is the top priority.
          </p>
        </motion.div>

        {/* Why RedRep card */}
        <motion.div
          variants={itemVariants}
          whileHover={{ scale: 1.02 }}
          className="liquid-glass rounded-2xl p-6 sm:p-8 cursor-default"
        >
          <div className="flex items-start gap-4 mb-5">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-accent/15 text-accent">
              <GraduationCap className="size-5" />
            </div>
            <div>
              <h3 className="text-lg font-semibold font-[family-name:var(--font-display)] text-foreground mb-2">
                Why RedRep?
              </h3>
              <p className="leading-relaxed">
                Students deserve better than clunky forum software from 2005.
                RedRep reimagines the academic Q&A experience with the polish of
                modern web applications — fast, beautiful, and designed for how
                students actually ask questions and share knowledge.
              </p>
            </div>
          </div>
          <p className="leading-relaxed">
            Built as a showcase project demonstrating architecture design,
            responsive UI engineering, accessibility best practices, and
            thoughtful interaction design — all within a single-page application
            with no backend dependencies.
          </p>
        </motion.div>

        {/* Team card */}
        <motion.div variants={itemVariants} className="flex justify-center">
          <div className="flex flex-wrap justify-center gap-4">
            {TEAM.map((member) => (
              <motion.div
                key={member.name}
                whileHover={{ scale: 1.02 }}
                className="liquid-glass rounded-2xl p-5 flex items-center gap-4 min-w-[280px] cursor-default"
              >
                {/* Avatar placeholder */}
                <div className="flex size-14 shrink-0 items-center justify-center rounded-full bg-muted">
                  <User className="size-6 text-muted-foreground" />
                </div>
                <div>
                  <p className="font-semibold font-[family-name:var(--font-display)] text-foreground">
                    {member.name}
                  </p>
                  <p className="text-sm text-muted-foreground">{member.role}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Tech stack badges */}
        <motion.div variants={itemVariants} className="text-center">
          <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3">
            Built With
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {TECH_STACK.map((tech) => (
              <Badge key={tech} variant="secondary" className="text-xs">
                {tech}
              </Badge>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}
