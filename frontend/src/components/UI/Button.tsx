import React from 'react';
import clsx from 'clsx';

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
};

const base =
  'inline-flex items-center justify-center rounded-xl font-semibold transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 relative overflow-hidden';

const sizes = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-3 text-base',
};

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  className,
  children,
  type = 'button',
  ...rest
}) => {
  const styles = {
    primary:
      'text-white glass bg-white/5 border border-white/12 shadow-[0_12px_40px_rgba(0,0,0,0.35)] ' +
      'hover:bg-white/10 hover:shadow-[0_16px_48px_rgba(0,0,0,0.45)] hover:-translate-y-[1px] ' +
      'focus:ring-white/40 focus:ring-offset-0',
    ghost:
      'glass text-white hover:bg-white/10 hover:text-white/80 focus:ring-white/40 border border-white/12',
    danger: 'bg-rose-600 text-white hover:bg-rose-700 hover:scale-[1.02] focus:ring-rose-500',
  }[variant];

  return (
    <button className={clsx(base, sizes[size], styles, className)} type={type} {...rest}>
      {children}
    </button>
  );
};
