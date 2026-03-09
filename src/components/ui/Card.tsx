import { ReactNode } from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface CardProps {
  className?: string;
  children?: ReactNode;
  [key: string]: any;
}

export function Card({ className, children, ...props }: CardProps) {
  return (
    <div className={cn("bg-white rounded-3xl shadow-[0_2px_12px_rgba(0,0,0,0.04)] border border-zinc-100 p-5", className)} {...props}>
      {children}
    </div>
  );
}
