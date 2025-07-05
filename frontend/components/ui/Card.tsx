import React, { forwardRef } from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'default' | 'elevated' | 'outlined' | 'glass';
  hover?: boolean;
}

export const Card = forwardRef<HTMLDivElement, CardProps>(({
  children,
  className = '',
  padding = 'md',
  variant = 'default',
  hover = false,
  ...props
}, ref) => {
  const paddingClasses = {
    none: '',
    sm: 'p-3',
    md: 'p-4 sm:p-6',
    lg: 'p-6 sm:p-8',
    xl: 'p-8 sm:p-10',
  };

  const variantClasses = {
    default: `
      bg-white dark:bg-gray-800 
      border border-gray-200 dark:border-gray-700
      shadow-sm dark:shadow-gray-900/20
    `,
    elevated: `
      bg-white dark:bg-gray-800
      border border-gray-200 dark:border-gray-700
      shadow-lg dark:shadow-gray-900/30
    `,
    outlined: `
      bg-white dark:bg-gray-800
      border-2 border-gray-300 dark:border-gray-600
      shadow-none
    `,
    glass: `
      glass backdrop-blur-xl
      border border-white/20 dark:border-gray-800/20
    `,
  };

  const hoverClasses = hover ? `
    transition-all duration-300 ease-in-out
    hover:shadow-xl dark:hover:shadow-gray-900/40
    hover:scale-[1.02] hover:border-gray-300 dark:hover:border-gray-600
    cursor-pointer
  ` : 'transition-all duration-200 ease-in-out';

  return (
    <div
      ref={ref}
      className={`
        rounded-xl overflow-hidden
        ${variantClasses[variant]}
        ${paddingClasses[padding]}
        ${hoverClasses}
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  );
});

Card.displayName = 'Card';

interface CardHeaderProps {
  children: React.ReactNode;
  className?: string;
}

export const CardHeader: React.FC<CardHeaderProps> = ({
  children,
  className = '',
}) => {
  return (
    <div className={`
      border-b border-gray-200 dark:border-gray-700 
      pb-3 sm:pb-4 mb-4 sm:mb-6
      ${className}
    `}>
      {children}
    </div>
  );
};

interface CardTitleProps {
  children: React.ReactNode;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const CardTitle: React.FC<CardTitleProps> = ({
  children,
  className = '',
  size = 'md',
}) => {
  const sizeClasses = {
    sm: 'text-base sm:text-lg',
    md: 'text-lg sm:text-xl',
    lg: 'text-xl sm:text-2xl',
    xl: 'text-2xl sm:text-3xl',
  };

  return (
    <h3 className={`
      font-bold text-gray-900 dark:text-gray-100
      leading-tight tracking-tight
      ${sizeClasses[size]}
      ${className}
    `}>
      {children}
    </h3>
  );
};

interface CardDescriptionProps {
  children: React.ReactNode;
  className?: string;
}

export const CardDescription: React.FC<CardDescriptionProps> = ({
  children,
  className = '',
}) => {
  return (
    <p className={`
      text-sm sm:text-base text-gray-600 dark:text-gray-400 
      leading-relaxed mt-1 sm:mt-2
      ${className}
    `}>
      {children}
    </p>
  );
};

interface CardContentProps {
  children: React.ReactNode;
  className?: string;
}

export const CardContent: React.FC<CardContentProps> = ({
  children,
  className = '',
}) => {
  return (
    <div className={`space-y-4 ${className}`}>
      {children}
    </div>
  );
};

interface CardFooterProps {
  children: React.ReactNode;
  className?: string;
}

export const CardFooter: React.FC<CardFooterProps> = ({
  children,
  className = '',
}) => {
  return (
    <div className={`
      border-t border-gray-200 dark:border-gray-700 
      pt-3 sm:pt-4 mt-4 sm:mt-6
      flex flex-col sm:flex-row gap-2 sm:gap-3
      ${className}
    `}>
      {children}
    </div>
  );
};