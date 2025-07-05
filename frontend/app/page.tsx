'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { SimpleThemeToggle } from '@/components/ThemeToggle';

export default function Home() {
  const { isAuthenticated, userType, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (isAuthenticated) {
        // Redirect to appropriate dashboard based on user type
        if (userType === 'admin') {
          router.push('/admin/dashboard');
        } else if (userType === 'student') {
          router.push('/student/dashboard');
        }
      } else {
        // Redirect to login page
        router.push('/login');
      }
    }
  }, [isAuthenticated, userType, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-900 dark:to-slate-800">
        {/* Theme Toggle */}
        <div className="absolute top-4 right-4 z-10">
          <SimpleThemeToggle />
        </div>
        
        <div className="text-center px-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-900 dark:to-slate-800 px-4">
      {/* Theme Toggle */}
      <div className="absolute top-4 right-4 z-10">
        <SimpleThemeToggle />
      </div>
      
      <div className="text-center max-w-md mx-auto">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-4">
          Presensi
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8 text-base sm:text-lg">
          Sistem manajemen kehadiran siswa yang modern dan efisien
        </p>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 dark:border-blue-400 mx-auto"></div>
      </div>
    </div>
  );
}
