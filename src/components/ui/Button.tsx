import { ReactNode } from 'react';
import { cn } from './Card';

interface ButtonProps {
  className?: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg';
  children?: ReactNode;
  [key: string]: any;
}

export function Button({ className, variant = 'primary', size = 'md', children, ...props }: ButtonProps) {
  const variants = {
    primary: 'bg-zinc-900 text-white hover:bg-zinc-800',
    secondary: 'bg-zinc-100 text-zinc-900 hover:bg-zinc-200',
    outline: 'border border-zinc-200 text-zinc-700 hover:bg-zinc-50',
    danger: 'bg-rose-500 text-white hover:bg-rose-600',
    success: 'bg-emerald-500 text-white hover:bg-emerald-600',
  };
  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-5 py-3',
    lg: 'px-6 py-4 text-lg',
  };
  
  return (
    <button 
      className={cn(
        "rounded-2xl font-semibold transition-all focus:ring-2 focus:ring-offset-2 focus:ring-zinc-900 disabled:opacity-50 active:scale-[0.98]", 
        variants[variant], 
        sizes[size], 
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
