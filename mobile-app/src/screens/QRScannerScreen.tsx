import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { BarCodeScanner } from 'expo-barcode-scanner';
import { Camera } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { apiClient } from '../services/api';

export default function QRScannerScreen() {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);
  const [scanning, setScanning] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    const getBarCodeScannerPermissions = async () => {
      const { status } = await BarCodeScanner.requestPermissionsAsync();
      setHasPermission(status === 'granted');
    };

    getBarCodeScannerPermissions();
  }, []);

  const handleBarCodeScanned = async ({ type, data }: { type: string; data: string }) => {
    if (scanned) return;
    
    setScanned(true);
    setScanning(false);

    try {
      // Parse QR code data
      const qrData = JSON.parse(data);
      
      // Validate QR code structure
      if (!qrData.session_code || !qrData.expires_at) {
        Alert.alert('Error', 'QR Code tidak valid');
        resetScanner();
        return;
      }

      // Check if QR code is expired
      const expiresAt = new Date(qrData.expires_at * 1000);
      if (new Date() > expiresAt) {
        Alert.alert('Error', 'QR Code sudah expired');
        resetScanner();
        return;
      }

      // Submit attendance
      const response = await apiClient.post('/student/qr/scan', {
        qr_data: data,
        student_id: user?.student_id,
        location: 'Mobile App'
      });

      Alert.alert(
        'Berhasil!', 
        `Presensi berhasil dicatat!\n\nMata Pelajaran: ${qrData.subject}\nGuru: ${qrData.teacher}\nWaktu: ${new Date().toLocaleTimeString('id-ID')}`,
        [
          {
            text: 'OK',
            onPress: resetScanner
          }
        ]
      );

    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Gagal memproses QR Code';
      Alert.alert('Error', errorMessage, [
        {
          text: 'OK',
          onPress: resetScanner
        }
      ]);
    }
  };

  const resetScanner = () => {
    setScanned(false);
    setScanning(false);
  };

  const startScanning = () => {
    setScanning(true);
    setScanned(false);
  };

  if (hasPermission === null) {
    return (
      <View style={styles.container}>
        <Text>Meminta izin kamera...</Text>
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Tidak ada akses ke kamera</Text>
        <Text style={styles.helpText}>
          Silakan berikan izin kamera pada pengaturan aplikasi untuk menggunakan fitur scan QR code.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {scanning ? (
        <View style={styles.scannerContainer}>
          <BarCodeScanner
            onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
            style={styles.scanner}
          />
          
          <View style={styles.overlay}>
            <View style={styles.scanFrame} />
            <Text style={styles.scanText}>
              Arahkan kamera ke QR Code presensi
            </Text>
            
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setScanning(false)}
            >
              <Text style={styles.cancelButtonText}>Batal</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <View style={styles.startContainer}>
          <View style={styles.iconContainer}>
            <Ionicons name="qr-code" size={120} color="#2563eb" />
          </View>
          
          <Text style={styles.title}>Scan QR Code Presensi</Text>
          <Text style={styles.subtitle}>
            Scan QR code yang ditampilkan oleh guru untuk mencatat kehadiran Anda
          </Text>
          
          <TouchableOpacity
            style={styles.startButton}
            onPress={startScanning}
          >
            <Ionicons name="camera" size={24} color="white" style={styles.buttonIcon} />
            <Text style={styles.startButtonText}>Mulai Scan</Text>
          </TouchableOpacity>
          
          <View style={styles.instructionsContainer}>
            <Text style={styles.instructionsTitle}>Petunjuk:</Text>
            <Text style={styles.instructionsText}>
              1. Pastikan QR code terlihat jelas di layar{'\n'}
              2. Tahan kamera agar stabil{'\n'}
              3. Tunggu hingga QR code terdeteksi{'\n'}
              4. Presensi akan tercatat otomatis
            </Text>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scannerContainer: {
    flex: 1,
  },
  scanner: {
    flex: 1,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scanFrame: {
    width: 250,
    height: 250,
    borderWidth: 2,
    borderColor: '#2563eb',
    borderRadius: 10,
    backgroundColor: 'transparent',
  },
  scanText: {
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 10,
    borderRadius: 5,
  },
  cancelButton: {
    backgroundColor: 'rgba(239, 68, 68, 0.9)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
    marginTop: 20,
  },
  cancelButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  startContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  iconContainer: {
    marginBottom: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 22,
  },
  startButton: {
    backgroundColor: '#2563eb',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 10,
    marginBottom: 30,
  },
  buttonIcon: {
    marginRight: 10,
  },
  startButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  instructionsContainer: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  instructionsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 10,
  },
  instructionsText: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
  errorText: {
    fontSize: 18,
    color: '#ef4444',
    textAlign: 'center',
    marginBottom: 10,
  },
  helpText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
});