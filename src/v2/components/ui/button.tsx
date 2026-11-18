import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-1.5 rounded-xl text-xs font-medium whitespace-nowrap shrink-0 cursor-pointer transition-colors disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        primary:
          'bg-indigo-600 text-white font-semibold hover:bg-indigo-500 shadow-lg shadow-indigo-950/60',
        secondary:
          'bg-slate-800/90 text-slate-300 border border-slate-700/80 hover:bg-slate-700 hover:text-white shadow-sm',
        active:
          'bg-indigo-600 text-white border border-indigo-500 font-medium shadow-sm',
        ghost:
          'text-slate-400 hover:text-slate-200 hover:bg-slate-800/80',
      },
      size: {
        sm: 'px-3 py-1.5',
        md: 'px-4 py-2',
        icon: 'p-2',
      },
    },
    defaultVariants: {
      variant: 'secondary',
      size: 'sm',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, type = 'button', ...props }, ref) => (
    <button
      ref={ref}
      type={type}
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  )
);
Button.displayName = 'Button';

export { Button, buttonVariants };
