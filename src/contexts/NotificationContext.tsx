"use client"

import React, { createContext, useContext, useState, useEffect } from 'react'

export interface Notification {
  id: string
  title: string
  message: string
  type: 'info' | 'success' | 'warning' | 'error'
  read: boolean
  createdAt: string
  actionUrl?: string
}

interface NotificationContextType {
  notifications: Notification[]
  unreadCount: number
  addNotification: (notification: Omit<Notification, 'id' | 'read' | 'createdAt'>) => void
  markAsRead: (id: string) => void
  markAllAsRead: () => void
  removeNotification: (id: string) => void
  clearAllNotifications: () => void
  addDemoNotifications: () => void
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([])

  // Load notifications from localStorage on mount
  useEffect(() => {
    const savedNotifications = localStorage.getItem('notifications')
    if (savedNotifications) {
      try {
        setNotifications(JSON.parse(savedNotifications))
      } catch (error) {
        console.error('Failed to parse saved notifications:', error)
      }
    }
  }, [])

  // Save notifications to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('notifications', JSON.stringify(notifications))
  }, [notifications])

  const unreadCount = notifications.filter(n => !n.read).length

  const addNotification = (notification: Omit<Notification, 'id' | 'read' | 'createdAt'>) => {
    const newNotification: Notification = {
      ...notification,
      id: `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      read: false,
      createdAt: new Date().toISOString()
    }
    
    setNotifications(prev => {
      // Check if notification with same title and message already exists
      const exists = prev.some(n => n.title === notification.title && n.message === notification.message)
      if (exists) return prev
      
      return [newNotification, ...prev]
    })
    
    // Auto-remove after 10 seconds for non-error notifications
    if (notification.type !== 'error') {
      setTimeout(() => {
        setNotifications(prev => prev.filter(n => n.id !== newNotification.id))
      }, 10000)
    }
  }

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id 
          ? { ...notification, read: true }
          : notification
      )
    )
  }

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, read: true }))
    )
  }

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }

  const clearAllNotifications = () => {
    setNotifications([])
  }

  const addDemoNotifications = () => {
    // Only add demo notifications if none exist
    if (notifications.length === 0) {
      // Add welcome notification immediately
      addNotification({
        title: "Welcome!",
        message: "Your expense tracker is ready to use.",
        type: "success",
        actionUrl: "/"
      })

      // Add feature notification after a delay
      setTimeout(() => {
        addNotification({
          title: "New Feature",
          message: "Search functionality has been added to the header.",
          type: "info",
          actionUrl: "/expenses"
        })
      }, 3000)
    }
  }

  return (
    <NotificationContext.Provider value={{
      notifications,
      unreadCount,
      addNotification,
      markAsRead,
      markAllAsRead,
      removeNotification,
      clearAllNotifications,
      addDemoNotifications
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
