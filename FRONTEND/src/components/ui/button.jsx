import React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { Loader2 } from 'lucide-react';
import { cn } from '../../lib/utils';

const buttonVariants = ({
  variant = 'default',
  size = 'default',
  gradient = false,
  className,
} = {}) => {
  return cn(
    'inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 relative overflow-hidden',
    {
      'bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground shadow-lg hover:shadow-xl active:shadow-md hover:-translate-y-0.5 active:translate-y-0 after:absolute after:inset-0 after:opacity-0 hover:after:opacity-20 after:bg-gradient-to-r after:from-white after:to-transparent after:transition-opacity': variant === 'default' && !gradient,
      'bg-gradient-to-r from-primary to-accent text-primary-foreground hover:text-primary-foreground hover:brightness-105 border-0 shadow-lg hover:shadow-xl active:shadow-md hover:-translate-y-0.5 active:translate-y-0 after:absolute after:inset-0 after:opacity-0 hover:after:opacity-20 after:bg-gradient-to-r after:from-white after:to-transparent after:transition-opacity': variant === 'default' && gradient,
      'bg-destructive text-destructive-foreground hover:text-destructive-foreground hover:bg-destructive/90 shadow-lg hover:shadow-xl active:shadow-md hover:-translate-y-0.5 active:translate-y-0 after:absolute after:inset-0 after:opacity-0 hover:after:opacity-20 after:bg-gradient-to-r after:from-white after:to-transparent after:transition-opacity': variant === 'destructive' && !gradient,
      'bg-gradient-to-r from-destructive to-red-400 text-destructive-foreground hover:text-destructive-foreground hover:brightness-105 shadow-lg hover:shadow-xl active:shadow-md hover:-translate-y-0.5 active:translate-y-0 after:absolute after:inset-0 after:opacity-0 hover:after:opacity-20 after:bg-gradient-to-r after:from-white after:to-transparent after:transition-opacity': variant === 'destructive' && gradient,
      'border border-input bg-background text-foreground hover:bg-accent/10 hover:text-accent-foreground shadow-md hover:shadow-lg active:shadow-sm hover:-translate-y-0.5 active:translate-y-0 hover:border-accent/50': variant === 'outline',
      'bg-secondary text-secondary-foreground hover:text-secondary-foreground hover:bg-secondary/80 shadow-md hover:shadow-lg active:shadow-sm hover:-translate-y-0.5 active:translate-y-0 after:absolute after:inset-0 after:opacity-0 hover:after:opacity-10 after:bg-gradient-to-r after:from-white after:to-transparent after:transition-opacity': variant === 'secondary' && !gradient,
      'bg-gradient-to-r from-secondary to-secondary/60 text-secondary-foreground hover:text-secondary-foreground hover:brightness-105 shadow-md hover:shadow-lg active:shadow-sm hover:-translate-y-0.5 active:translate-y-0 after:absolute after:inset-0 after:opacity-0 hover:after:opacity-10 after:bg-gradient-to-r after:from-white after:to-transparent after:transition-opacity': variant === 'secondary' && gradient,
      'text-foreground hover:bg-accent/10 hover:text-accent-foreground hover:shadow-md active:shadow-sm hover:-translate-y-0.5 active:translate-y-0': variant === 'ghost',
      'underline-offset-4 hover:underline text-primary hover:text-primary': variant === 'link',
    },
    {
      'h-10 px-6 py-2': size === 'default',
      'h-9 rounded-md px-4': size === 'sm',
      'h-12 rounded-md px-8 text-base': size === 'lg',
      'h-9 w-9': size === 'icon',
    },
    className
  );
};

const Button = React.forwardRef(({ 
  className, 
  variant = 'default', 
  size = 'default', 
  asChild = false, 
  loading = false,
  gradient = false,
  children,
  ...props 
}, ref) => {
  const Comp = asChild ? Slot : 'button';
  return (
    <Comp
      className={buttonVariants({
        variant,
        size,
        gradient,
        className
      })}
      ref={ref}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          {children}
        </>
      ) : (
        children
      )}
    </Comp>
  );
});

Button.displayName = 'Button';

export { Button, buttonVariants };
export default Button;
