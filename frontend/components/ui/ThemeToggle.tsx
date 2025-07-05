'use client';

import { Moon, Sun, Monitor } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();

  const toggleTheme = () => {
    if (theme === 'light') {
      setTheme('dark');
    } else if (theme === 'dark') {
      setTheme('system');
    } else {
      setTheme('light');
    }
  };

  const getIcon = () => {
    if (theme === 'system') {
      return <Monitor className="w-5 h-5" />;
    }
    return resolvedTheme === 'dark' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />;
  };

  const getLabel = () => {
    if (theme === 'system') {
      return 'System';
    }
    return resolvedTheme === 'dark' ? 'Dark' : 'Light';
  };

  return (
    <button
      onClick={toggleTheme}
      className="
        flex items-center gap-2 p-2 rounded-lg
        bg-gray-100 hover:bg-gray-200 
        dark:bg-gray-800 dark:hover:bg-gray-700
        text-gray-700 dark:text-gray-300
        transition-colors duration-200
        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
        dark:focus:ring-offset-gray-900
      "
      title={`Switch to ${theme === 'light' ? 'dark' : theme === 'dark' ? 'system' : 'light'} theme`}
    >
      {getIcon()}
      <span className="text-sm font-medium hidden sm:inline">
        {getLabel()}
      </span>
    </button>
  );
}