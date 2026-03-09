import { InputHTMLAttributes, forwardRef } from 'react';
import { cn } from './Card';

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={cn(
          "flex h-12 w-full rounded-2xl border border-zinc-200 bg-zinc-50/50 px-4 py-2 text-sm placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50 transition-all",
          className
        )}
        {...props}
      />
    );
  }
);
Input.displayName = 'Input';
