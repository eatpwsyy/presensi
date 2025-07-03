import { format } from 'date-fns';

export const formatDate = (date: string | Date) => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return format(dateObj, 'dd/MM/yyyy');
};

export const formatDateTime = (date: string | Date) => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return format(dateObj, 'dd/MM/yyyy HH:mm');
};

export const formatTime = (date: string | Date) => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return format(dateObj, 'HH:mm');
};

export const getStatusColor = (status: string) => {
  switch (status) {
    case 'present':
      return 'text-green-600 bg-green-100';
    case 'absent':
      return 'text-red-600 bg-red-100';
    case 'late':
      return 'text-yellow-600 bg-yellow-100';
    case 'excused':
      return 'text-blue-600 bg-blue-100';
    default:
      return 'text-gray-600 bg-gray-100';
  }
};

export const getStatusText = (status: string) => {
  switch (status) {
    case 'present':
      return 'Hadir';
    case 'absent':
      return 'Tidak Hadir';
    case 'late':
      return 'Terlambat';
    case 'excused':
      return 'Izin';
    default:
      return status;
  }
};

export const calculateAttendanceRate = (present: number, total: number) => {
  if (total === 0) return 0;
  return Math.round((present / total) * 100);
};

export const truncateText = (text: string, maxLength: number) => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};