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
import { StudentRegisterRequest } from '@/types';

export default function RegisterPage() {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<StudentRegisterRequest & { confirmPassword: string }>();

  const password = watch('password');

  const onSubmit = async (data: StudentRegisterRequest & { confirmPassword: string }) => {
    setLoading(true);
    setError('');

    try {
      // Use confirmPassword for validation but don't include in API request
      if (data.password !== data.confirmPassword) {
        setError('Password dan konfirmasi password tidak sama');
        return;
      }
      
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { confirmPassword: _, ...registerData } = data;
      const response = await authApi.studentRegister(registerData);
      
      login(response.token, response.user, 'student');
      router.push('/student/dashboard');
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } } };
      setError(error.response?.data?.error || 'Pendaftaran gagal. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-900 dark:to-slate-800">
      {/* Theme Toggle */}
      <div className="absolute top-4 right-4 z-10">
        <SimpleThemeToggle />
      </div>
      
      <Card className="w-full max-w-lg bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-gray-200 dark:border-slate-700 shadow-xl">
        <CardHeader>
          <CardTitle className="text-center text-xl sm:text-2xl text-gray-900 dark:text-white">
            Daftar Akun Siswa
          </CardTitle>
          <p className="text-center text-gray-600 dark:text-gray-400 mt-2">
            Lengkapi form berikut untuk membuat akun
          </p>
        </CardHeader>
        
        <CardContent>
          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="student_id" className="block text-sm font-medium text-gray-700 mb-1">
                  NIS <span className="text-red-500">*</span>
                </label>
                <input
                  id="student_id"
                  type="text"
                  {...register('student_id', {
                    required: 'NIS harus diisi',
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Nomor Induk Siswa"
                />
                {errors.student_id && (
                  <p className="mt-1 text-sm text-red-600">{errors.student_id.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Nama Lengkap <span className="text-red-500">*</span>
                </label>
                <input
                  id="name"
                  type="text"
                  {...register('name', {
                    required: 'Nama lengkap harus diisi',
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Nama lengkap"
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email <span className="text-red-500">*</span>
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
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="email@contoh.com"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="class" className="block text-sm font-medium text-gray-700 mb-1">
                  Kelas <span className="text-red-500">*</span>
                </label>
                <select
                  id="class"
                  {...register('class', {
                    required: 'Kelas harus dipilih',
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Pilih Kelas</option>
                  <option value="7A">7A</option>
                  <option value="7B">7B</option>
                  <option value="7C">7C</option>
                  <option value="8A">8A</option>
                  <option value="8B">8B</option>
                  <option value="8C">8C</option>
                  <option value="9A">9A</option>
                  <option value="9B">9B</option>
                  <option value="9C">9C</option>
                </select>
                {errors.class && (
                  <p className="mt-1 text-sm text-red-600">{errors.class.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="grade" className="block text-sm font-medium text-gray-700 mb-1">
                  Tingkat <span className="text-red-500">*</span>
                </label>
                <select
                  id="grade"
                  {...register('grade', {
                    required: 'Tingkat harus dipilih',
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Pilih Tingkat</option>
                  <option value="7">7</option>
                  <option value="8">8</option>
                  <option value="9">9</option>
                </select>
                {errors.grade && (
                  <p className="mt-1 text-sm text-red-600">{errors.grade.message}</p>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="phone_number" className="block text-sm font-medium text-gray-700 mb-1">
                Nomor Telepon
              </label>
              <input
                id="phone_number"
                type="tel"
                {...register('phone_number')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="08xxxxxxxxxx"
              />
            </div>

            <div>
              <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                Alamat
              </label>
              <textarea
                id="address"
                rows={3}
                {...register('address')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Alamat lengkap"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Password <span className="text-red-500">*</span>
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Minimal 6 karakter"
                />
                {errors.password && (
                  <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  Konfirmasi Password <span className="text-red-500">*</span>
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  {...register('confirmPassword', {
                    required: 'Konfirmasi password harus diisi',
                    validate: (value) =>
                      value === password || 'Password tidak cocok',
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Ulangi password"
                />
                {errors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>
                )}
              </div>
            </div>

            <Button
              type="submit"
              loading={loading}
              className="w-full"
              size="lg"
            >
              {loading ? 'Sedang Mendaftar...' : 'Daftar'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Sudah punya akun?{' '}
              <Link href="/login" className="text-blue-600 hover:text-blue-800">
                Masuk di sini
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}