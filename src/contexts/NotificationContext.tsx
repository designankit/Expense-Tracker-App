"use client"

import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import { useSupabase } from '@/components/supabase-provider'

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
  isLoading: boolean
  addNotification: (notification: Omit<Notification, 'id' | 'read' | 'createdAt'>) => Promise<void>
  markAsRead: (id: string) => Promise<void>
  markAllAsRead: () => Promise<void>
  removeNotification: (id: string) => Promise<void>
  clearAllNotifications: () => Promise<void>
  refreshNotifications: () => Promise<void>
  addDemoNotifications: () => Promise<void>
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const { user } = useSupabase()

  const mapFromApi = (row: { id: string; title: string; message: string; type: string; read: boolean; created_at?: string; createdAt?: string; action_url?: string; actionUrl?: string }): Notification => ({
    id: row.id,
    title: row.title,
    message: row.message,
    type: row.type as "error" | "success" | "info" | "warning",
    read: Boolean(row.read),
    createdAt: row.created_at ?? row.createdAt ?? new Date().toISOString(),
    actionUrl: row.action_url ?? row.actionUrl ?? undefined,
  })

  // Load notifications from Supabase on mount and when user changes
  useEffect(() => {
    const fetchNotifications = async () => {
      if (!user?.id) {
        setNotifications([])
        return
      }

      setIsLoading(true)
      try {
        const response = await fetch(`/api/notifications?userId=${encodeURIComponent(user.id)}`)
        if (response.ok) {
          const data = await response.json()
          const mapped = (data.notifications || []).map(mapFromApi)
          setNotifications(mapped)
        }
      } catch (error) {
        console.error('Failed to fetch notifications:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchNotifications()
  }, [user?.id])

  const unreadCount = notifications.filter(n => !n.read).length

  const addNotification = async (notification: Omit<Notification, 'id' | 'read' | 'createdAt'>) => {
    if (!user?.id) return

    try {
      const response = await fetch('/api/notifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          title: notification.title,
          message: notification.message,
          type: notification.type,
          actionUrl: notification.actionUrl
        })
      })

      if (response.ok) {
        const data = await response.json()
        const mapped = mapFromApi(data.notification)
        setNotifications(prev => [mapped, ...prev])
      }
    } catch (error) {
      console.error('Failed to add notification:', error)
    }
  }

  const markAsRead = async (id: string) => {
    if (!user?.id) return

    try {
      const response = await fetch(`/api/notifications/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          read: true
        })
      })

      if (response.ok) {
        setNotifications(prev => 
          prev.map(notification => 
            notification.id === id 
              ? { ...notification, read: true }
              : notification
          )
        )
      }
    } catch (error) {
      console.error('Failed to mark notification as read:', error)
    }
  }

  const markAllAsRead = async () => {
    if (!user?.id) return

    try {
      const response = await fetch('/api/notifications/mark-all-read', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id
        })
      })

      if (response.ok) {
        setNotifications(prev => 
          prev.map(notification => ({ ...notification, read: true }))
        )
      }
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error)
    }
  }

  const removeNotification = async (id: string) => {
    if (!user?.id) return

    try {
      const response = await fetch(`/api/notifications/${id}?userId=${encodeURIComponent(user.id)}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setNotifications(prev => prev.filter(n => n.id !== id))
      }
    } catch (error) {
      console.error('Failed to remove notification:', error)
    }
  }

  const clearAllNotifications = async () => {
    if (!user?.id) return

    try {
      // Delete all notifications one by one (or implement a bulk delete endpoint)
      const deletePromises = notifications.map(notification => 
        fetch(`/api/notifications/${notification.id}?userId=${encodeURIComponent(user.id)}`, {
          method: 'DELETE'
        })
      )

      await Promise.all(deletePromises)
      setNotifications([])
    } catch (error) {
      console.error('Failed to clear all notifications:', error)
    }
  }

  const refreshNotifications = async () => {
    if (!user?.id) return

    setIsLoading(true)
    try {
      const response = await fetch(`/api/notifications?userId=${encodeURIComponent(user.id)}`)
      if (response.ok) {
        const data = await response.json()
        const mapped = (data.notifications || []).map(mapFromApi)
        setNotifications(mapped)
      }
    } catch (error) {
      console.error('Failed to refresh notifications:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const addDemoNotifications = async () => {
    if (!user?.id) return

    try {
      const response = await fetch('/api/notifications/demo', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id
        })
      })

      if (response.ok) {
        const data = await response.json()
        const mapped = (data.notifications || []).map(mapFromApi)
        setNotifications(prev => [...mapped, ...prev])
      }
    } catch (error) {
      console.error('Failed to add demo notifications:', error)
    }
  }

  return (
    <NotificationContext.Provider value={{
      notifications,
      unreadCount,
      isLoading,
      addNotification,
      markAsRead,
      markAllAsRead,
      removeNotification,
      clearAllNotifications,
      refreshNotifications,
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