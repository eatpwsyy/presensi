import axios from 'axios';
import { AuthResponse, LoginRequest, StudentRegisterRequest, Student, Attendance, AttendanceStats, PaginatedResponse } from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authApi = {
  studentLogin: async (data: LoginRequest): Promise<AuthResponse> => {
    const response = await api.post('/auth/student/login', data);
    return response.data;
  },

  adminLogin: async (data: LoginRequest): Promise<AuthResponse> => {
    const response = await api.post('/auth/admin/login', data);
    return response.data;
  },

  studentRegister: async (data: StudentRegisterRequest): Promise<AuthResponse> => {
    const response = await api.post('/auth/student/register', data);
    return response.data;
  },

  getProfile: async () => {
    const response = await api.get('/profile');
    return response.data;
  },
};

// Student API (for students)
export const studentApi = {
  checkIn: async (subject?: string) => {
    const response = await api.post('/student/checkin', { subject });
    return response.data;
  },

  checkOut: async () => {
    const response = await api.post('/student/checkout');
    return response.data;
  },

  getMyAttendance: async (page = 1, limit = 10, month?: string) => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    if (month) params.append('month', month);
    
    const response = await api.get(`/student/attendance?${params}`);
    return response.data;
  },
};

// Admin API
export const adminApi = {
  // Student management
  getStudents: async (page = 1, limit = 10, filters?: {
    class?: string;
    grade?: string;
    search?: string;
  }): Promise<PaginatedResponse<Student>> => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    
    if (filters?.class) params.append('class', filters.class);
    if (filters?.grade) params.append('grade', filters.grade);
    if (filters?.search) params.append('search', filters.search);
    
    const response = await api.get(`/admin/students?${params}`);
    return response.data;
  },

  getStudent: async (id: number): Promise<Student> => {
    const response = await api.get(`/admin/students/${id}`);
    return response.data;
  },

  createStudent: async (data: StudentRegisterRequest): Promise<Student> => {
    const response = await api.post('/admin/students', data);
    return response.data;
  },

  updateStudent: async (id: number, data: Partial<Student>): Promise<Student> => {
    const response = await api.put(`/admin/students/${id}`, data);
    return response.data;
  },

  deleteStudent: async (id: number) => {
    const response = await api.delete(`/admin/students/${id}`);
    return response.data;
  },

  getStudentsByClass: async (className: string): Promise<Student[]> => {
    const response = await api.get(`/admin/students/class/${className}`);
    return response.data;
  },

  getStudentsByGrade: async (grade: string): Promise<Student[]> => {
    const response = await api.get(`/admin/students/grade/${grade}`);
    return response.data;
  },

  // Attendance management
  getAllAttendance: async (page = 1, limit = 10, filters?: {
    class?: string;
    grade?: string;
    date?: string;
    status?: string;
  }) => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    
    if (filters?.class) params.append('class', filters.class);
    if (filters?.grade) params.append('grade', filters.grade);
    if (filters?.date) params.append('date', filters.date);
    if (filters?.status) params.append('status', filters.status);
    
    const response = await api.get(`/admin/attendance?${params}`);
    return response.data;
  },

  createAttendance: async (data: {
    student_id: number;
    date: string;
    status: string;
    notes?: string;
    subject?: string;
  }): Promise<Attendance> => {
    const response = await api.post('/admin/attendance', data);
    return response.data;
  },

  updateAttendance: async (id: number, data: {
    status?: string;
    notes?: string;
    subject?: string;
  }): Promise<Attendance> => {
    const response = await api.put(`/admin/attendance/${id}`, data);
    return response.data;
  },

  getAttendanceStats: async (filters?: {
    student_id?: number;
    start_date?: string;
    end_date?: string;
  }): Promise<AttendanceStats[]> => {
    const params = new URLSearchParams();
    
    if (filters?.student_id) params.append('student_id', filters.student_id.toString());
    if (filters?.start_date) params.append('start_date', filters.start_date);
    if (filters?.end_date) params.append('end_date', filters.end_date);
    
    const response = await api.get(`/admin/attendance/stats?${params}`);
    return response.data;
  },
};

export default api;