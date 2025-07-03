'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Sistem Presensi Sekolah
        </h1>
        <p className="text-gray-600 mb-8">
          Sistem manajemen kehadiran siswa yang modern dan efisien
        </p>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
      </div>
    </div>
  );
}
