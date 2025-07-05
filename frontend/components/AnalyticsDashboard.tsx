'use client'

import React, { useState, useEffect } from 'react'
import { Line, Bar, Doughnut } from 'react-chartjs-2'
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  BarElement,
  ArcElement,
  Title, 
  Tooltip, 
  Legend 
} from 'chart.js'
import api from '@/lib/api'
import { format, subDays, startOfWeek, endOfWeek } from 'date-fns'
import { id } from 'date-fns/locale'

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
)

interface AttendanceStats {
  overall: {
    total_students: number
    present_count: number
    absent_count: number
    late_count: number
    excused_count: number
  }
  daily_stats: Array<{
    date: string
    present: number
    absent: number
    late: number
    excused: number
  }>
  class_stats: Array<{
    class: string
    present: number
    absent: number
    late: number
    excused: number
  }>
}

export default function AnalyticsDashboard() {
  const [stats, setStats] = useState<AttendanceStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [dateRange, setDateRange] = useState({
    start_date: format(startOfWeek(new Date()), 'yyyy-MM-dd'),
    end_date: format(endOfWeek(new Date()), 'yyyy-MM-dd')
  })
  const [selectedClass, setSelectedClass] = useState('')
  const [selectedGrade, setSelectedGrade] = useState('')

  useEffect(() => {
    fetchStats()
  }, [dateRange, selectedClass, selectedGrade])

  const fetchStats = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      
      if (dateRange.start_date) params.append('start_date', dateRange.start_date)
      if (dateRange.end_date) params.append('end_date', dateRange.end_date)
      if (selectedClass) params.append('class', selectedClass)
      if (selectedGrade) params.append('grade', selectedGrade)

      const response = await api.get(`/admin/reports/stats?${params.toString()}`)
      setStats(response.data)
    } catch (error) {
      console.error('Error fetching stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const exportToPDF = async () => {
    try {
      const params = new URLSearchParams()
      if (dateRange.start_date) params.append('start_date', dateRange.start_date)
      if (dateRange.end_date) params.append('end_date', dateRange.end_date)
      if (selectedClass) params.append('class', selectedClass)
      if (selectedGrade) params.append('grade', selectedGrade)

      const response = await fetch(`/api/admin/reports/export/pdf?${params.toString()}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })

      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `laporan_presensi_${format(new Date(), 'yyyy-MM-dd')}.pdf`
        a.click()
        window.URL.revokeObjectURL(url)
      }
    } catch (error) {
      console.error('Error exporting PDF:', error)
    }
  }

  const exportToExcel = async () => {
    try {
      const params = new URLSearchParams()
      if (dateRange.start_date) params.append('start_date', dateRange.start_date)
      if (dateRange.end_date) params.append('end_date', dateRange.end_date)
      if (selectedClass) params.append('class', selectedClass)
      if (selectedGrade) params.append('grade', selectedGrade)

      const response = await fetch(`/api/admin/reports/export/excel?${params.toString()}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })

      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `laporan_presensi_${format(new Date(), 'yyyy-MM-dd')}.xlsx`
        a.click()
        window.URL.revokeObjectURL(url)
      }
    } catch (error) {
      console.error('Error exporting Excel:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="text-center text-gray-500">
        Tidak ada data statistik tersedia
      </div>
    )
  }

  // Prepare chart data
  const dailyChartData = {
    labels: stats.daily_stats.map(d => format(new Date(d.date), 'dd MMM', { locale: id })),
    datasets: [
      {
        label: 'Hadir',
        data: stats.daily_stats.map(d => d.present),
        borderColor: 'rgb(34, 197, 94)',
        backgroundColor: 'rgba(34, 197, 94, 0.2)',
        tension: 0.1
      },
      {
        label: 'Tidak Hadir',
        data: stats.daily_stats.map(d => d.absent),
        borderColor: 'rgb(239, 68, 68)',
        backgroundColor: 'rgba(239, 68, 68, 0.2)',
        tension: 0.1
      },
      {
        label: 'Terlambat',
        data: stats.daily_stats.map(d => d.late),
        borderColor: 'rgb(245, 158, 11)',
        backgroundColor: 'rgba(245, 158, 11, 0.2)',
        tension: 0.1
      }
    ]
  }

  const classChartData = {
    labels: stats.class_stats.map(c => c.class),
    datasets: [
      {
        label: 'Hadir',
        data: stats.class_stats.map(c => c.present),
        backgroundColor: 'rgba(34, 197, 94, 0.8)'
      },
      {
        label: 'Tidak Hadir',
        data: stats.class_stats.map(c => c.absent),
        backgroundColor: 'rgba(239, 68, 68, 0.8)'
      },
      {
        label: 'Terlambat',
        data: stats.class_stats.map(c => c.late),
        backgroundColor: 'rgba(245, 158, 11, 0.8)'
      }
    ]
  }

  const overallChartData = {
    labels: ['Hadir', 'Tidak Hadir', 'Terlambat', 'Izin'],
    datasets: [
      {
        data: [
          stats.overall.present_count,
          stats.overall.absent_count,
          stats.overall.late_count,
          stats.overall.excused_count
        ],
        backgroundColor: [
          'rgba(34, 197, 94, 0.8)',
          'rgba(239, 68, 68, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(59, 130, 246, 0.8)'
        ],
        borderWidth: 1
      }
    ]
  }

  const attendanceRate = stats.overall.total_students > 0 
    ? ((stats.overall.present_count / (stats.overall.present_count + stats.overall.absent_count + stats.overall.late_count + stats.overall.excused_count)) * 100).toFixed(1)
    : '0'

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold mb-4">Analytics Dashboard</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tanggal Mulai
            </label>
            <input
              type="date"
              value={dateRange.start_date}
              onChange={(e) => setDateRange({...dateRange, start_date: e.target.value})}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tanggal Akhir
            </label>
            <input
              type="date"
              value={dateRange.end_date}
              onChange={(e) => setDateRange({...dateRange, end_date: e.target.value})}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Kelas
            </label>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Semua Kelas</option>
              <option value="10A">10A</option>
              <option value="10B">10B</option>
              <option value="11A">11A</option>
              <option value="11B">11B</option>
              <option value="12A">12A</option>
              <option value="12B">12B</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tingkat
            </label>
            <select
              value={selectedGrade}
              onChange={(e) => setSelectedGrade(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Semua Tingkat</option>
              <option value="10">Kelas 10</option>
              <option value="11">Kelas 11</option>
              <option value="12">Kelas 12</option>
            </select>
          </div>
        </div>

        <div className="flex space-x-4">
          <button
            onClick={exportToPDF}
            className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
          >
            Export PDF
          </button>
          <button
            onClick={exportToExcel}
            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
          >
            Export Excel
          </button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M16 4c0-1.11.89-2 2-2s2 .89 2 2-.89 2-2 2-2-.89-2-2zM4 18v-4h3v4h2V9h3l2 3v2h4V9.5h2L18 7l-1.83-2h-1.92c-.37 0-.73.15-.98.41L11.83 7H8c-1.1 0-2 .9-2 2v8c0 .55.45 1 1 1h1v3c0 .55.45 1 1 1h2c.55 0 1-.45 1-1v-3h1c.55 0 1-.45 1-1v-1.5H4z"/>
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Siswa</p>
              <p className="text-2xl font-bold text-gray-900">{stats.overall.total_students}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Hadir</p>
              <p className="text-2xl font-bold text-green-600">{stats.overall.present_count}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-red-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Tidak Hadir</p>
              <p className="text-2xl font-bold text-red-600">{stats.overall.absent_count}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-yellow-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/>
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Terlambat</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.overall.late_count}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-purple-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Tingkat Kehadiran</p>
              <p className="text-2xl font-bold text-purple-600">{attendanceRate}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4">Tren Kehadiran Harian</h3>
          <Line data={dailyChartData} options={{
            responsive: true,
            plugins: {
              legend: {
                position: 'top' as const,
              },
            },
            scales: {
              y: {
                beginAtZero: true
              }
            }
          }} />
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4">Distribusi Status Kehadiran</h3>
          <Doughnut data={overallChartData} options={{
            responsive: true,
            plugins: {
              legend: {
                position: 'bottom' as const,
              },
            }
          }} />
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4">Kehadiran per Kelas</h3>
        <Bar data={classChartData} options={{
          responsive: true,
          plugins: {
            legend: {
              position: 'top' as const,
            },
          },
          scales: {
            y: {
              beginAtZero: true
            }
          }
        }} />
      </div>
    </div>
  )
}