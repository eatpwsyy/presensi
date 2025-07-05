'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { Loader2, School, Users, BarChart3, QrCode } from 'lucide-react';

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
        // Redirect to login page after showing landing briefly
        const timer = setTimeout(() => {
          router.push('/login');
        }, 2000);
        return () => clearTimeout(timer);
      }
    }
  }, [isAuthenticated, userType, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="text-center space-y-4 animate-fade-in">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 dark:text-blue-400 mx-auto" />
          <p className="text-gray-600 dark:text-gray-400 text-lg">Memuat aplikasi...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header with theme toggle */}
      <header className="absolute top-4 right-4 z-10">
        <ThemeToggle />
      </header>

      {/* Main content */}
      <div className="flex items-center justify-center min-h-screen px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-4xl mx-auto animate-fade-in">
          {/* Logo and title */}
          <div className="mb-8 sm:mb-12">
            <div className="inline-flex items-center justify-center w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full mb-6 shadow-lg">
              <School className="w-10 h-10 sm:w-12 sm:h-12 text-white" />
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-4 tracking-tight">
              Sistem Presensi
              <span className="block text-blue-600 dark:text-blue-400">Sekolah</span>
            </h1>
            <p className="text-base sm:text-lg lg:text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto leading-relaxed">
              Sistem manajemen kehadiran siswa yang modern dan efisien dengan teknologi QR Code dan analitik real-time
            </p>
          </div>

          {/* Features grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8 sm:mb-12">
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl p-4 sm:p-6 shadow-lg border border-gray-200/50 dark:border-gray-700/50 animate-slide-up">
              <QrCode className="w-8 h-8 sm:w-10 sm:h-10 text-blue-600 dark:text-blue-400 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base mb-2">QR Code Scanner</h3>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Absensi cepat dengan scan QR</p>
            </div>
            
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl p-4 sm:p-6 shadow-lg border border-gray-200/50 dark:border-gray-700/50 animate-slide-up" style={{ animationDelay: '0.1s' }}>
              <Users className="w-8 h-8 sm:w-10 sm:h-10 text-green-600 dark:text-green-400 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base mb-2">Manajemen Siswa</h3>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Kelola data siswa dengan mudah</p>
            </div>
            
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl p-4 sm:p-6 shadow-lg border border-gray-200/50 dark:border-gray-700/50 animate-slide-up col-span-1 sm:col-span-2 lg:col-span-1" style={{ animationDelay: '0.2s' }}>
              <BarChart3 className="w-8 h-8 sm:w-10 sm:h-10 text-purple-600 dark:text-purple-400 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base mb-2">Analytics Dashboard</h3>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Laporan dan statistik real-time</p>
            </div>
          </div>

          {/* Loading indicator */}
          <div className="flex items-center justify-center space-x-3">
            <Loader2 className="w-6 h-6 sm:w-8 sm:h-8 animate-spin text-blue-600 dark:text-blue-400" />
            <span className="text-sm sm:text-base text-gray-600 dark:text-gray-400 font-medium">
              Mengarahkan ke halaman login...
            </span>
          </div>

          {/* Quick stats */}
          <div className="mt-8 sm:mt-12 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-lg p-3 sm:p-4">
              <div className="text-lg sm:text-2xl font-bold text-blue-600 dark:text-blue-400">100%</div>
              <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Real-time</div>
            </div>
            <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-lg p-3 sm:p-4">
              <div className="text-lg sm:text-2xl font-bold text-green-600 dark:text-green-400">24/7</div>
              <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Akses</div>
            </div>
            <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-lg p-3 sm:p-4">
              <div className="text-lg sm:text-2xl font-bold text-purple-600 dark:text-purple-400">Aman</div>
              <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Data</div>
            </div>
            <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-lg p-3 sm:p-4">
              <div className="text-lg sm:text-2xl font-bold text-orange-600 dark:text-orange-400">Mudah</div>
              <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Digunakan</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
