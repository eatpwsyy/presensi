export interface Student {
  id: number;
  student_id: string;
  name: string;
  email: string;
  class: string;
  grade: string;
  phone_number?: string;
  address?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Admin {
  id: number;
  username: string;
  email: string;
  name: string;
  role: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Attendance {
  id: number;
  student_id: number;
  date: string;
  check_in_time?: string;
  check_out_time?: string;
  status: 'present' | 'absent' | 'late' | 'excused';
  notes?: string;
  subject?: string;
  created_at: string;
  updated_at: string;
  student?: Student;
}

export interface AttendanceStats {
  student_id: number;
  student_name: string;
  total_days: number;
  present_days: number;
  absent_days: number;
  late_days: number;
  attendance_rate: number;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface StudentRegisterRequest {
  student_id: string;
  name: string;
  email: string;
  password: string;
  class: string;
  grade: string;
  phone_number?: string;
  address?: string;
}

export interface AuthResponse {
  token: string;
  user: Student | Admin;
}

export interface ApiResponse<T> {
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export type UserType = 'student' | 'admin';

export interface User {
  id: number;
  type: UserType;
  data: Student | Admin;
}