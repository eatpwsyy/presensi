'use client';

import { useTheme } from '@/contexts/ThemeContext';
import { Sun, Moon, Monitor } from 'lucide-react';

interface ThemeToggleProps {
  variant?: 'default' | 'compact';
  showLabel?: boolean;
}

export function ThemeToggle({ variant = 'default', showLabel = true }: ThemeToggleProps) {
  const { theme, actualTheme, setTheme } = useTheme();

  const themes = [
    { value: 'light' as const, icon: Sun, label: 'Light' },
    { value: 'dark' as const, icon: Moon, label: 'Dark' },
    { value: 'system' as const, icon: Monitor, label: 'System' },
  ];

  if (variant === 'compact') {
    return (
      <button
        onClick={() => {
          const currentIndex = themes.findIndex(t => t.value === theme);
          const nextIndex = (currentIndex + 1) % themes.length;
          setTheme(themes[nextIndex].value);
        }}
        className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        title={`Current: ${theme} (${actualTheme})`}
      >
        {actualTheme === 'dark' ? (
          <Moon className="h-5 w-5" />
        ) : (
          <Sun className="h-5 w-5" />
        )}
      </button>
    );
  }

  return (
    <div className="flex items-center space-x-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
      {themes.map(({ value, icon: Icon, label }) => (
        <button
          key={value}
          onClick={() => setTheme(value)}
          className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
            theme === value
              ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
          }`}
          title={label}
        >
          <Icon className="h-4 w-4" />
          {showLabel && <span>{label}</span>}
        </button>
      ))}
    </div>
  );
}

export function SimpleThemeToggle() {
  const { actualTheme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
      title={`Switch to ${actualTheme === 'dark' ? 'light' : 'dark'} mode`}
    >
      {actualTheme === 'dark' ? (
        <Sun className="h-5 w-5 text-yellow-500" />
      ) : (
        <Moon className="h-5 w-5 text-gray-600" />
      )}
    </button>
  );
}