'use client'

import React, { useState } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { toast } from 'react-hot-toast'
import api from '@/lib/api'

interface QRSession {
  session_code: string
  qr_code: Uint8Array
  expires_at: string
  subject: string
  teacher: string
  location: string
}

export default function QRCodeGenerator() {
  const [formData, setFormData] = useState({
    subject: '',
    teacher: '',
    location: '',
    duration: 30
  })
  const [qrSession, setQRSession] = useState<QRSession | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await api.post('/admin/qr/generate', formData)
      setQRSession(response.data)
      toast.success('QR Code berhasil dibuat!')
    } catch (error) {
      toast.error('Gagal membuat QR Code')
      console.error('Error generating QR code:', error)
    } finally {
      setLoading(false)
    }
  }

  const downloadQR = () => {
    if (!qrSession) return

    // Create QR code data for mobile app
    const qrData = {
      session_code: qrSession.session_code,
      subject: qrSession.subject,
      teacher: qrSession.teacher,
      location: qrSession.location,
      expires_at: new Date(qrSession.expires_at).getTime() / 1000
    }

    const canvas = document.createElement('canvas')
    const qrCodeElement = document.querySelector('#qr-code svg') as SVGElement
    if (!qrCodeElement) return

    // Convert SVG to canvas and download
    const svgData = new XMLSerializer().serializeToString(qrCodeElement)
    const img = new Image()
    
    img.onload = () => {
      canvas.width = img.width
      canvas.height = img.height
      const ctx = canvas.getContext('2d')
      if (ctx) {
        ctx.drawImage(img, 0, 0)
        const link = document.createElement('a')
        link.download = `qr-code-${qrSession.subject}-${new Date().toISOString().split('T')[0]}.png`
        link.href = canvas.toDataURL()
        link.click()
      }
    }
    
    img.src = 'data:image/svg+xml;base64,' + btoa(svgData)
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold mb-6">Generate QR Code Presensi</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Mata Pelajaran
          </label>
          <input
            type="text"
            value={formData.subject}
            onChange={(e) => setFormData({...formData, subject: e.target.value})}
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nama Guru
          </label>
          <input
            type="text"
            value={formData.teacher}
            onChange={(e) => setFormData({...formData, teacher: e.target.value})}
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Lokasi
          </label>
          <input
            type="text"
            value={formData.location}
            onChange={(e) => setFormData({...formData, location: e.target.value})}
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Durasi (menit)
          </label>
          <select
            value={formData.duration}
            onChange={(e) => setFormData({...formData, duration: parseInt(e.target.value)})}
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value={15}>15 menit</option>
            <option value={30}>30 menit</option>
            <option value={45}>45 menit</option>
            <option value={60}>60 menit</option>
            <option value={90}>90 menit</option>
            <option value={120}>120 menit</option>
          </select>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Membuat QR Code...' : 'Generate QR Code'}
        </button>
      </form>

      {qrSession && (
        <div className="border-t pt-6">
          <div className="text-center">
            <h3 className="text-lg font-semibold mb-4">QR Code Presensi</h3>
            
            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Mata Pelajaran:</span>
                  <p>{qrSession.subject}</p>
                </div>
                <div>
                  <span className="font-medium">Guru:</span>
                  <p>{qrSession.teacher}</p>
                </div>
                <div>
                  <span className="font-medium">Lokasi:</span>
                  <p>{qrSession.location}</p>
                </div>
                <div>
                  <span className="font-medium">Berlaku sampai:</span>
                  <p>{new Date(qrSession.expires_at).toLocaleString('id-ID')}</p>
                </div>
              </div>
            </div>

            <div id="qr-code" className="flex justify-center mb-4">
              <QRCodeSVG
                value={JSON.stringify({
                  session_code: qrSession.session_code,
                  subject: qrSession.subject,
                  teacher: qrSession.teacher,
                  location: qrSession.location,
                  expires_at: new Date(qrSession.expires_at).getTime() / 1000
                })}
                size={256}
                level="M"
                includeMargin={true}
              />
            </div>

            <div className="flex justify-center space-x-4">
              <button
                onClick={downloadQR}
                className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
              >
                Download QR Code
              </button>
              
              <button
                onClick={() => setQRSession(null)}
                className="bg-gray-600 text-white px-6 py-2 rounded-md hover:bg-gray-700 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
              >
                Buat QR Baru
              </button>
            </div>

            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
              <p className="text-sm text-yellow-800">
                <strong>Petunjuk:</strong> Siswa dapat memindai QR code ini menggunakan aplikasi mobile atau kamera untuk mencatat kehadiran.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}