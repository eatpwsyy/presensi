import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  RefreshControl,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { apiClient } from '../services/api';

interface AttendanceStats {
  today_status: string | null;
  this_week: {
    present: number;
    absent: number;
    late: number;
    total_days: number;
  };
  this_month: {
    present: number;
    absent: number;
    late: number;
    total_days: number;
  };
}

export default function HomeScreen() {
  const { user, logout } = useAuth();
  const [stats, setStats] = useState<AttendanceStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchAttendanceStats();
  }, []);

  const fetchAttendanceStats = async () => {
    try {
      const response = await apiClient.get('/student/attendance/stats');
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchAttendanceStats();
  };

  const handleCheckIn = async () => {
    try {
      await apiClient.post('/student/checkin');
      Alert.alert('Berhasil!', 'Check-in berhasil dicatat');
      fetchAttendanceStats();
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Gagal melakukan check-in';
      Alert.alert('Error', errorMessage);
    }
  };

  const handleCheckOut = async () => {
    try {
      await apiClient.post('/student/checkout');
      Alert.alert('Berhasil!', 'Check-out berhasil dicatat');
      fetchAttendanceStats();
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Gagal melakukan check-out';
      Alert.alert('Error', errorMessage);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'present': return '#22c55e';
      case 'late': return '#f59e0b';
      case 'absent': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'present': return 'Hadir';
      case 'late': return 'Terlambat';
      case 'absent': return 'Tidak Hadir';
      default: return 'Belum Presensi';
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Memuat data...</Text>
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Selamat datang,</Text>
          <Text style={styles.userName}>{user?.name}</Text>
          <Text style={styles.userInfo}>{user?.class} • {user?.student_id}</Text>
        </View>
        <TouchableOpacity onPress={logout} style={styles.logoutButton}>
          <Ionicons name="log-out-outline" size={24} color="#ef4444" />
        </TouchableOpacity>
      </View>

      {/* Today's Status */}
      <View style={styles.todayCard}>
        <Text style={styles.cardTitle}>Status Hari Ini</Text>
        <View style={styles.todayStatus}>
          <View style={[
            styles.statusBadge, 
            { backgroundColor: getStatusColor(stats?.today_status || 'none') }
          ]}>
            <Text style={styles.statusText}>
              {getStatusText(stats?.today_status || 'none')}
            </Text>
          </View>
          <Text style={styles.todayDate}>
            {new Date().toLocaleDateString('id-ID', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </Text>
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.actionsCard}>
        <Text style={styles.cardTitle}>Aksi Cepat</Text>
        <View style={styles.actionsContainer}>
          <TouchableOpacity style={styles.actionButton} onPress={handleCheckIn}>
            <Ionicons name="log-in" size={24} color="#22c55e" />
            <Text style={styles.actionText}>Check In</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton} onPress={handleCheckOut}>
            <Ionicons name="log-out" size={24} color="#ef4444" />
            <Text style={styles.actionText}>Check Out</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Weekly Stats */}
      {stats?.this_week && (
        <View style={styles.statsCard}>
          <Text style={styles.cardTitle}>Statistik Minggu Ini</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{stats.this_week.present}</Text>
              <Text style={styles.statLabel}>Hadir</Text>
              <View style={[styles.statIndicator, { backgroundColor: '#22c55e' }]} />
            </View>
            
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{stats.this_week.late}</Text>
              <Text style={styles.statLabel}>Terlambat</Text>
              <View style={[styles.statIndicator, { backgroundColor: '#f59e0b' }]} />
            </View>
            
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{stats.this_week.absent}</Text>
              <Text style={styles.statLabel}>Tidak Hadir</Text>
              <View style={[styles.statIndicator, { backgroundColor: '#ef4444' }]} />
            </View>
          </View>
          
          <View style={styles.attendanceRate}>
            <Text style={styles.rateLabel}>Tingkat Kehadiran:</Text>
            <Text style={styles.rateValue}>
              {stats.this_week.total_days > 0 
                ? `${((stats.this_week.present / stats.this_week.total_days) * 100).toFixed(1)}%`
                : '0%'
              }
            </Text>
          </View>
        </View>
      )}

      {/* Monthly Stats */}
      {stats?.this_month && (
        <View style={styles.statsCard}>
          <Text style={styles.cardTitle}>Statistik Bulan Ini</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{stats.this_month.present}</Text>
              <Text style={styles.statLabel}>Hadir</Text>
              <View style={[styles.statIndicator, { backgroundColor: '#22c55e' }]} />
            </View>
            
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{stats.this_month.late}</Text>
              <Text style={styles.statLabel}>Terlambat</Text>
              <View style={[styles.statIndicator, { backgroundColor: '#f59e0b' }]} />
            </View>
            
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{stats.this_month.absent}</Text>
              <Text style={styles.statLabel}>Tidak Hadir</Text>
              <View style={[styles.statIndicator, { backgroundColor: '#ef4444' }]} />
            </View>
          </View>
          
          <View style={styles.attendanceRate}>
            <Text style={styles.rateLabel}>Tingkat Kehadiran:</Text>
            <Text style={styles.rateValue}>
              {stats.this_month.total_days > 0 
                ? `${((stats.this_month.present / stats.this_month.total_days) * 100).toFixed(1)}%`
                : '0%'
              }
            </Text>
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    backgroundColor: '#2563eb',
    padding: 20,
    paddingTop: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  greeting: {
    fontSize: 16,
    color: '#e5e7eb',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 5,
  },
  userInfo: {
    fontSize: 14,
    color: '#e5e7eb',
    marginTop: 2,
  },
  logoutButton: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    padding: 8,
    borderRadius: 8,
  },
  todayCard: {
    backgroundColor: 'white',
    margin: 16,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 16,
  },
  todayStatus: {
    alignItems: 'center',
  },
  statusBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 12,
  },
  statusText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  todayDate: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
  actionsCard: {
    backgroundColor: 'white',
    margin: 16,
    marginTop: 0,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  actionButton: {
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#f8fafc',
    minWidth: 100,
  },
  actionText: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  statsCard: {
    backgroundColor: 'white',
    margin: 16,
    marginTop: 0,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
    textAlign: 'center',
  },
  statIndicator: {
    width: 4,
    height: 4,
    borderRadius: 2,
    marginTop: 4,
  },
  attendanceRate: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  rateLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  rateValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2563eb',
  },
});