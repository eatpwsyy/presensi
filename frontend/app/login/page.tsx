'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { authApi } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { SimpleThemeToggle } from '@/components/ThemeToggle';
import { LoginRequest } from '@/types';

export default function LoginPage() {
  const [userType, setUserType] = useState<'student' | 'admin'>('student');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginRequest>();

  const onSubmit = async (data: LoginRequest) => {
    setLoading(true);
    setError('');

    try {
      let response;
      if (userType === 'student') {
        response = await authApi.studentLogin(data);
      } else {
        response = await authApi.adminLogin(data);
      }

      login(response.token, response.user, userType);
      
      // Redirect to appropriate dashboard
      if (userType === 'admin') {
        router.push('/admin/dashboard');
      } else {
        router.push('/student/dashboard');
      }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } } };
      setError(error.response?.data?.error || 'Login gagal. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-900 dark:to-slate-800">
      {/* Theme Toggle - Positioned absolutely in top right */}
      <div className="absolute top-4 right-4 z-10">
        <SimpleThemeToggle />
      </div>
      
      <div className="w-full max-w-md">
        {/* App Title */}
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Presensi
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Sistem Presensi Sekolah Modern
          </p>
        </div>

        <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-gray-200 dark:border-slate-700 shadow-xl">
          <CardHeader>
            <CardTitle className="text-center text-xl sm:text-2xl text-gray-900 dark:text-white">
              Masuk ke Sistem
            </CardTitle>
            <p className="text-center text-gray-600 dark:text-gray-400 mt-2 text-sm sm:text-base">
              Silakan pilih jenis akun dan masuk
            </p>
          </CardHeader>
        
        <CardContent>
          {/* User Type Selector */}
          <div className="flex mb-6 bg-gray-100 dark:bg-slate-700 rounded-lg p-1">
            <button
              type="button"
              onClick={() => setUserType('student')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                userType === 'student'
                  ? 'bg-white dark:bg-slate-600 text-blue-600 dark:text-blue-400 shadow-sm'
                  : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Siswa
            </button>
            <button
              type="button"
              onClick={() => setUserType('admin')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                userType === 'admin'
                  ? 'bg-white dark:bg-slate-600 text-blue-600 dark:text-blue-400 shadow-sm'
                  : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Admin
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/50 border border-red-400 dark:border-red-600 text-red-700 dark:text-red-300 rounded">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Email
              </label>
              <input
                id="email"
                type="email"
                {...register('email', {
                  required: 'Email harus diisi',
                  pattern: {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: 'Format email tidak valid',
                  },
                })}
                className="w-full px-3 py-3 sm:py-2 border border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-colors"
                placeholder="Masukkan email"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Password
              </label>
              <input
                id="password"
                type="password"
                {...register('password', {
                  required: 'Password harus diisi',
                  minLength: {
                    value: 6,
                    message: 'Password minimal 6 karakter',
                  },
                })}
                className="w-full px-3 py-3 sm:py-2 border border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-colors"
                placeholder="Masukkan password"
              />
              {errors.password && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.password.message}</p>
              )}
            </div>

            <Button
              type="submit"
              loading={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white py-3 sm:py-2"
              size="lg"
            >
              {loading ? 'Sedang Masuk...' : 'Masuk'}
            </Button>
          </form>

          {userType === 'student' && (
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Belum punya akun?{' '}
                <Link href="/register" className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium">
                  Daftar sekarang
                </Link>
              </p>
            </div>
          )}

          {userType === 'admin' && (
            <div className="mt-6 text-center">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Default admin: admin@school.com / admin123
              </p>
            </div>
          )}
        </CardContent>
      </Card>
      </div>
    </div>
  );
}