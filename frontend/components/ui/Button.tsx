import React, { forwardRef } from 'react';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'outline' | 'ghost' | 'link';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  loading?: boolean;
  children: React.ReactNode;
  fullWidth?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(({
  variant = 'primary',
  size = 'md',
  loading = false,
  children,
  className = '',
  disabled,
  fullWidth = false,
  ...props
}, ref) => {
  const baseClasses = `
    inline-flex items-center justify-center font-medium rounded-lg
    transition-all duration-200 ease-in-out
    focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-900
    disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
    relative overflow-hidden
    ${fullWidth ? 'w-full' : ''}
  `;
  
  const variantClasses = {
    primary: `
      bg-gradient-to-r from-blue-600 to-blue-700 text-white 
      hover:from-blue-700 hover:to-blue-800 hover:shadow-lg hover:scale-105
      focus:ring-blue-500 active:scale-95
      shadow-md dark:shadow-blue-500/25
    `,
    secondary: `
      bg-gray-100 text-gray-900 hover:bg-gray-200 hover:shadow-md hover:scale-105
      dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-700
      focus:ring-gray-500 active:scale-95 border border-gray-200 dark:border-gray-700
    `,
    danger: `
      bg-gradient-to-r from-red-600 to-red-700 text-white 
      hover:from-red-700 hover:to-red-800 hover:shadow-lg hover:scale-105
      focus:ring-red-500 active:scale-95
      shadow-md dark:shadow-red-500/25
    `,
    success: `
      bg-gradient-to-r from-green-600 to-green-700 text-white 
      hover:from-green-700 hover:to-green-800 hover:shadow-lg hover:scale-105
      focus:ring-green-500 active:scale-95
      shadow-md dark:shadow-green-500/25
    `,
    outline: `
      border border-gray-300 dark:border-gray-600 bg-transparent 
      text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800
      hover:border-gray-400 dark:hover:border-gray-500 hover:shadow-md hover:scale-105
      focus:ring-blue-500 active:scale-95
    `,
    ghost: `
      bg-transparent text-gray-700 dark:text-gray-300 
      hover:bg-gray-100 dark:hover:bg-gray-800 hover:scale-105
      focus:ring-gray-500 active:scale-95
    `,
    link: `
      bg-transparent text-blue-600 dark:text-blue-400 
      hover:text-blue-800 dark:hover:text-blue-300 hover:underline
      focus:ring-blue-500 p-0 h-auto font-normal
    `,
  };
  
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm min-h-[36px] touch-target',
    md: 'px-4 py-2 text-base min-h-[40px] touch-target',
    lg: 'px-6 py-3 text-lg min-h-[48px] touch-target',
    xl: 'px-8 py-4 text-xl min-h-[56px] touch-target',
  };

  return (
    <button
      ref={ref}
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      disabled={disabled || loading}
      aria-label={loading ? 'Loading...' : undefined}
      {...props}
    >
      {loading ? (
        <>
          <Loader2 className="w-4 h-4 mr-2 animate-spin" aria-hidden="true" />
          <span className="opacity-70">Loading...</span>
        </>
      ) : (
        children
      )}
      
      {/* Ripple effect overlay */}
      <span className="absolute inset-0 overflow-hidden rounded-lg">
        <span className="absolute inset-0 bg-white opacity-0 hover:opacity-10 transition-opacity duration-200"></span>
      </span>
    </button>
  );
});

Button.displayName = 'Button';