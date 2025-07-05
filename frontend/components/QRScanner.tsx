'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Html5QrcodeScanner, Html5QrcodeScanType } from 'html5-qrcode'
import { toast } from 'react-hot-toast'
import api from '@/lib/api'
import { useAuth } from '@/contexts/AuthContext'

export default function QRScanner() {
  const [scanning, setScanning] = useState(false)
  const [scanner, setScanner] = useState<Html5QrcodeScanner | null>(null)
  const { user } = useAuth()
  const scannerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    return () => {
      // Cleanup scanner on unmount
      if (scanner) {
        scanner.clear()
      }
    }
  }, [scanner])

  const startScanning = () => {
    if (!scannerRef.current) return

    const qrCodeScanner = new Html5QrcodeScanner(
      'qr-reader',
      {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        supportedScanTypes: [Html5QrcodeScanType.SCAN_TYPE_CAMERA]
      },
      false
    )

    qrCodeScanner.render(
      async (decodedText) => {
        try {
          // Parse QR code data
          const qrData = JSON.parse(decodedText)
          
          // Validate QR code structure
          if (!qrData.session_code || !qrData.expires_at) {
            toast.error('QR Code tidak valid')
            return
          }

          // Check if QR code is expired
          const expiresAt = new Date(qrData.expires_at * 1000)
          if (new Date() > expiresAt) {
            toast.error('QR Code sudah expired')
            return
          }

          // Submit attendance
          const response = await api.post('/student/qr/scan', {
            qr_data: decodedText,
            student_id: (user as { student_id?: string })?.student_id,
            location: navigator.geolocation ? await getCurrentLocation() : 'Unknown'
          })

          toast.success(`Presensi berhasil! ${response.data.message}`)
          
          // Stop scanning after successful scan
          qrCodeScanner.clear()
          setScanning(false)
          setScanner(null)

        } catch (error: unknown) {
          const err = error as { response?: { data?: { error?: string } } };
          const errorMessage = err.response?.data?.error || 'Gagal memproses QR Code'
          toast.error(errorMessage)
        }
      },
      (errorMessage) => {
        console.log('QR Scan Error:', errorMessage)
      }
    )

    setScanner(qrCodeScanner)
    setScanning(true)
  }

  const stopScanning = () => {
    if (scanner) {
      scanner.clear()
      setScanner(null)
    }
    setScanning(false)
  }

  const getCurrentLocation = (): Promise<string> => {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        resolve('Geolocation not supported')
        return
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords
          resolve(`${latitude.toFixed(6)}, ${longitude.toFixed(6)}`)
        },
        () => {
          resolve('Location access denied')
        },
        { timeout: 5000 }
      )
    })
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold mb-6">Scan QR Code Presensi</h2>
      
      {!scanning ? (
        <div className="text-center">
          <div className="mb-6">
            <svg
              className="mx-auto h-24 w-24 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h2M4 4h4m12 0h2M4 20h4"
              />
            </svg>
          </div>
          
          <p className="text-gray-600 mb-6">
            Tekan tombol di bawah untuk memulai scan QR Code presensi
          </p>
          
          <button
            onClick={startScanning}
            className="bg-blue-600 text-white px-8 py-3 rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Mulai Scan QR Code
          </button>
          
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
            <h3 className="font-medium text-blue-900 mb-2">Petunjuk:</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>1. Pastikan kamera dapat mengakses QR Code dengan jelas</li>
              <li>2. Arahkan kamera ke QR Code yang ditampilkan guru</li>
              <li>3. Tunggu hingga QR Code terdeteksi secara otomatis</li>
              <li>4. Presensi akan tercatat setelah scan berhasil</li>
            </ul>
          </div>
        </div>
      ) : (
        <div>
          <div className="mb-4 flex justify-between items-center">
            <h3 className="text-lg font-medium">Scanning QR Code...</h3>
            <button
              onClick={stopScanning}
              className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            >
              Stop Scanning
            </button>
          </div>
          
          <div id="qr-reader" ref={scannerRef} className="w-full"></div>
          
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
            <p className="text-sm text-yellow-800">
              Arahkan kamera ke QR Code untuk memulai presensi
            </p>
          </div>
        </div>
      )}
    </div>
  )
}