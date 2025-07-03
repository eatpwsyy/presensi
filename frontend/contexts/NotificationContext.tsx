'use client'

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { toast } from 'react-hot-toast'

interface Notification {
  id: number
  type: string
  title: string
  message: string
  user_id: number
  user_type: string
  priority: string
  read: boolean
  created_at: string
}

interface NotificationContextType {
  notifications: Notification[]
  unreadCount: number
  markAsRead: (id: number) => void
  clearAll: () => void
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [ws, setWs] = useState<WebSocket | null>(null)

  useEffect(() => {
    // Connect to WebSocket
    const websocket = new WebSocket('ws://localhost:8080/ws')
    
    websocket.onopen = () => {
      console.log('Connected to WebSocket')
      setWs(websocket)
    }

    websocket.onmessage = (event) => {
      try {
        const notification: Notification = JSON.parse(event.data)
        
        // Add to notifications list
        setNotifications(prev => [notification, ...prev.slice(0, 49)]) // Keep last 50 notifications
        
        // Show toast notification
        const toastOptions = {
          duration: notification.priority === 'high' ? 8000 : 5000,
          style: {
            background: notification.priority === 'high' ? '#ef4444' : 
                       notification.priority === 'medium' ? '#f59e0b' : '#10b981',
            color: 'white',
          },
        }

        toast(notification.message, toastOptions)
      } catch (error) {
        console.error('Error parsing notification:', error)
      }
    }

    websocket.onclose = () => {
      console.log('WebSocket connection closed')
      // Attempt to reconnect after 3 seconds
      setTimeout(() => {
        if (websocket.readyState === WebSocket.CLOSED) {
          window.location.reload() // Simple reconnection strategy
        }
      }, 3000)
    }

    websocket.onerror = (error) => {
      console.error('WebSocket error:', error)
    }

    return () => {
      websocket.close()
    }
  }, [])

  const unreadCount = notifications.filter(n => !n.read).length

  const markAsRead = (id: number) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    )
  }

  const clearAll = () => {
    setNotifications([])
  }

  return (
    <NotificationContext.Provider value={{
      notifications,
      unreadCount,
      markAsRead,
      clearAll
    }}>
      {children}
    </NotificationContext.Provider>
  )
}

export function useNotifications() {
  const context = useContext(NotificationContext)
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider')
  }
  return context
}