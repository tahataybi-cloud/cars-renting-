import { HTMLMotionProps, motion } from 'framer-motion';
import { ReactNode } from 'react';
import { cn } from '../utils';

interface CyberButtonProps extends HTMLMotionProps<"button"> {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'destructive';
  size?: 'sm' | 'md' | 'lg';
  glow?: boolean;
}

export function CyberButton({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  glow = false,
  className,
  ...props 
}: CyberButtonProps) {
  const variants = {
    primary: 'bg-electric text-white hover:bg-electric/90 shadow-[0_0_15px_rgba(0,122,255,0.3)]',
    secondary: 'bg-steel text-white hover:bg-steel/80',
    outline: 'bg-transparent border border-electric/50 text-electric hover:bg-electric/10',
    destructive: 'bg-rose-600 text-white hover:bg-rose-500 shadow-[0_0_15px_rgba(225,29,72,0.3)]'
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base'
  };

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={cn(
        'rounded-full font-semibold transition-all duration-300 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed',
        variants[variant],
        sizes[size],
        glow && 'animate-glow',
        className
      )}
      {...props}
    >
      {children}
    </motion.button>
  );
}
