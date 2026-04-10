'use client';

import * as React from 'react';
import * as ButtonPrimitive from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-all duration-normal focus-ring disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed',
  {
    variants: {
      variant: {
        default: 
          'bg-primary text-primary-foreground hover:bg-primary-hover shadow-sm hover:shadow-md active:scale-[0.98]',
        destructive: 
          'bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-sm hover:shadow-md active:scale-[0.98]',
        outline: 
          'border border-border bg-transparent hover:bg-accent hover:text-accent-foreground hover:border-border-strong',
        secondary: 
          'bg-secondary text-secondary-foreground hover:bg-secondary-hover active:scale-[0.98]',
        ghost: 
          'hover:bg-accent hover:text-accent-foreground',
        link: 
          'text-primary underline-offset-4 hover:underline hover:text-primary-hover',
        success:
          'bg-success text-success-foreground hover:bg-success/90 shadow-sm hover:shadow-md active:scale-[0.98]',
        warning:
          'bg-warning text-warning-foreground hover:bg-warning/90 shadow-sm hover:shadow-md active:scale-[0.98]',
      },
      size: {
        default: 'h-9 px-4 py-2',
        sm: 'h-8 px-3 text-xs',
        lg: 'h-11 px-6 text-base',
        xl: 'h-12 px-8 text-base',
        icon: 'h-9 w-9',
        'icon-sm': 'h-8 w-8',
        'icon-lg': 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? ButtonPrimitive.Slot : 'button';
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };