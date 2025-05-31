import React, { useState } from 'react';
import { cn } from '../../lib/utils';
import { Eye, EyeOff, AlertCircle } from 'lucide-react';

const Input = React.forwardRef(({ className, type, error, icon: Icon, ...props }, ref) => {
  return (
    <div className="relative w-full">
      {Icon && (
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
          <Icon size={18} />
        </div>
      )}
      <input
        type={type}
        className={cn(
          'flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm transition-all duration-200',
          'shadow-md hover:shadow-lg focus:shadow-lg placeholder:text-muted-foreground/60',
          'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-primary',
          'disabled:cursor-not-allowed disabled:opacity-50',
          'hover:-translate-y-0.5 focus:translate-y-0 active:translate-y-0',
          error && 'border-destructive focus-visible:ring-destructive',
          Icon && 'pl-10',
          className
        )}
        ref={ref}
        {...props}
      />
      {error && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-destructive">
          <AlertCircle size={18} />
        </div>
      )}
    </div>
  );
});

Input.displayName = 'Input';

const PasswordInput = React.forwardRef(({ className, error, ...props }, ref) => {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative w-full">
      <Input
        ref={ref}
        type={visible ? 'text' : 'password'}
        className={className}
        error={error}
        {...props}
      />
      <button
        type="button"
        onClick={() => setVisible((prev) => !prev)}
        className={cn(
          "absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground",
          "w-8 h-8 flex items-center justify-center rounded-full hover:bg-muted transition-colors",
          error && "right-10"
        )}
        tabIndex={-1}
      >
        {visible ? <EyeOff size={18} /> : <Eye size={18} />}
      </button>
    </div>
  );
});

PasswordInput.displayName = 'PasswordInput';

export { Input, PasswordInput };
