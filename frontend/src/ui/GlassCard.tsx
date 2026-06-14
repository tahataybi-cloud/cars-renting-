import { motion } from 'framer-motion';
import { ReactNode } from 'react';
import { cn } from '../utils';

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  animate?: boolean;
}

export function GlassCard({ children, className, animate = true }: GlassCardProps) {
  const Component = animate ? motion.div : 'div';
  
  return (
    <Component
      initial={animate ? { opacity: 0, y: 20 } : undefined}
      whileInView={animate ? { opacity: 1, y: 0 } : undefined}
      viewport={animate ? { once: true } : undefined}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className={cn(
        'glass-panel rounded-2xl p-6 relative overflow-hidden group',
        className
      )}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
      <div className="relative z-10">
        {children}
      </div>
    </Component>
  );
}
