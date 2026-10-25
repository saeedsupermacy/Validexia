// src/shared/ui/forms.tsx
import React from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
 error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
 ({ className = '', error, ...props }, ref) => {
 return (
 <div className="w-full">
 <input
 ref={ref}
 className={`flex h-9 w-full rounded-md border bg-surface px-3 py-1 text-body shadow-sm transition-colors placeholder:text-text-tertiary disabled:cursor-not-allowed disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-info ${
 error ? 'border-risk-critical' : 'border-border-strong hover:border-text-secondary'
 } ${className}`}
 {...props}
 />
 {error && <p className="mt-1.5 text-xs text-risk-critical m-0">{error}</p>}
 </div>
 );
 }
);
Input.displayName = 'Input';

export const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
 ({ className = '', ...props }, ref) => {
 return (
 <textarea
 ref={ref}
 className={`flex min-h-[80px] w-full rounded-md border border-border-strong bg-surface px-3 py-2 text-body shadow-sm transition-colors placeholder:text-text-tertiary hover:border-text-secondary disabled:cursor-not-allowed disabled:opacity-50 resize-y focus:outline-none focus:ring-2 focus:ring-info ${className}`}
 {...props}
 />
 );
 }
);
Textarea.displayName = 'Textarea';

export const Checkbox = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
 ({ className = '', ...props }, ref) => {
 return (
 <input
 type="checkbox"
 ref={ref}
 className={`h-4 w-4 rounded-sm border border-border-strong bg-surface text-text-primary shadow-sm transition-colors checked:bg-text-primary checked:border-text-primary hover:border-text-secondary disabled:cursor-not-allowed disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-info ${className}`}
 {...props}
 />
 );
 }
);
Checkbox.displayName = 'Checkbox';