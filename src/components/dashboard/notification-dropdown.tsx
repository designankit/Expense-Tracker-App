"use client"

import React, { useRef, useEffect, useState } from 'react'
import { useNotifications, Notification } from '@/contexts/NotificationContext'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { motion, AnimatePresence } from 'framer-motion'
// import { Card, CardContent } from '@/components/ui/card'
import { 
  Bell, 
  CheckCheck, 
  X, 
  Trash2,
  Info,
  CheckCircle,
  AlertTriangle,
  AlertCircle,
  ExternalLink,
  Square,
  CheckSquare
} from 'lucide-react'

interface NotificationDropdownProps {
  isOpen: boolean
  onClose: () => void
}

export function NotificationDropdown({ isOpen, onClose }: NotificationDropdownProps) {
  const dropdownRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const showDemoNotifications = process.env.NEXT_PUBLIC_SHOW_DEMO_NOTIFICATIONS === 'true'
  const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set())
  const [isClearingAll, setIsClearingAll] = useState(false)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [isSelectMode, setIsSelectMode] = useState(false)
  const {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAllNotifications,
    addDemoNotifications
  } = useNotifications()

  // Close dropdown when clicking outside and refresh relative times every minute
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen, onClose])

  // Force re-render every 30 seconds for live relative timestamps
  const [, setTick] = useState(0)
  useEffect(() => {
    const interval = setInterval(() => setTick(t => t + 1), 30000)
    return () => clearInterval(interval)
  }, [])

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />
      default:
        return <Info className="h-4 w-4 text-blue-500" />
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const _getNotificationColor = (type: Notification['type']) => {
    switch (type) {
      case 'success':
        return 'border-green-200 bg-green-50/50 dark:border-emerald-800 dark:bg-emerald-950/20'
      case 'warning':
        return 'border-yellow-200 bg-yellow-50/50 dark:border-yellow-800 dark:bg-yellow-950/20'
      case 'error':
        return 'border-red-200 bg-red-50/50 dark:border-rose-800 dark:bg-rose-950/20'
      default:
        return 'border-blue-200 bg-blue-50/50 dark:border-slate-800 dark:bg-slate-950/20'
    }
  }

  const formatTime = (createdAt: string) => {
    const now = new Date()
    const notificationTime = new Date(createdAt)
    const diffInSeconds = Math.floor((now.getTime() - notificationTime.getTime()) / 1000)
    const diffInMinutes = Math.floor(diffInSeconds / 60)
    const diffInHours = Math.floor(diffInMinutes / 60)
    const diffInDays = Math.floor(diffInHours / 24)
    
    if (diffInSeconds < 30) return 'Just now'
    if (diffInSeconds < 60) return `${diffInSeconds}s ago`
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`
    if (diffInHours < 24) return `${diffInHours}h ago`
    if (diffInDays < 7) return `${diffInDays}d ago`
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)}w ago`
    if (diffInDays < 365) return `${Math.floor(diffInDays / 30)}mo ago`
    return `${Math.floor(diffInDays / 365)}y ago`
  }

  const handleNotificationClick = async (notification: Notification) => {
    await markAsRead(notification.id)
    if (notification.actionUrl) {
      router.push(notification.actionUrl)
      onClose()
    }
  }

  const handleDeleteNotification = async (id: string) => {
    // Add to deleting set for animation
    setDeletingIds(prev => new Set([...prev, id]))
    
    // Wait for animation to complete before actually deleting
    setTimeout(async () => {
      await removeNotification(id)
      setDeletingIds(prev => {
        const newSet = new Set(prev)
        newSet.delete(id)
        return newSet
      })
    }, 300) // Match animation duration
  }

  const handleClearAll = async () => {
    setIsClearingAll(true)
    
    // Animate all notifications out
    const allIds = new Set(notifications.map(n => n.id))
    setDeletingIds(allIds)
    
    // Wait for animation to complete
    setTimeout(async () => {
      await clearAllNotifications()
      setDeletingIds(new Set())
      setIsClearingAll(false)
      setSelectedIds(new Set())
      setIsSelectMode(false)
    }, 300)
  }

  const handleSelectAll = () => {
    if (selectedIds.size === notifications.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(notifications.map(n => n.id)))
    }
  }

  const handleToggleSelect = (id: string) => {
    const newSelected = new Set(selectedIds)
    if (newSelected.has(id)) {
      newSelected.delete(id)
    } else {
      newSelected.add(id)
    }
    setSelectedIds(newSelected)
  }

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return

    // Animate selected notifications out
    setDeletingIds(selectedIds)
    
    // Wait for animation to complete
    setTimeout(async () => {
      const deletePromises = Array.from(selectedIds).map(id => removeNotification(id))
      await Promise.all(deletePromises)
      setDeletingIds(new Set())
      setSelectedIds(new Set())
      setIsSelectMode(false)
    }, 300)
  }

  const handleExitSelectMode = () => {
    setIsSelectMode(false)
    setSelectedIds(new Set())
  }

  if (!isOpen) return null

  return (
    <div
      ref={dropdownRef}
      className="absolute top-full right-0 mt-2 w-80 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50 rounded-xl shadow-2xl z-50 max-h-96 overflow-hidden"
      style={{
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.05)'
      }}
    >
      {/* Header */}
      <div className="p-4 border-b border-gray-200/50 dark:border-gray-700/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-gray-600 dark:text-gray-400" />
            <h3 className="font-semibold text-gray-900 dark:text-gray-100">Notifications</h3>
            {unreadCount > 0 && (
              <Badge variant="destructive" className="text-xs">
                {unreadCount}
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-1">
            {!isSelectMode ? (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => markAllAsRead()}
                  className="h-8 w-8 p-0"
                  title="Mark all as read"
                  disabled={notifications.length === 0 || notifications.every(n => n.read)}
                >
                  <CheckCheck className="h-4 w-4" />
                </Button>
                {notifications.length > 0 && (
                  <>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsSelectMode(true)}
                      className="h-8 w-8 p-0"
                      title="Select notifications"
                    >
                      <Square className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleClearAll()}
                      className="h-8 w-8 p-0 text-red-600 hover:text-red-700 transition-colors"
                      title="Clear all"
                      disabled={isClearingAll}
                    >
                      <Trash2 className={`h-4 w-4 ${isClearingAll ? 'animate-pulse' : ''}`} />
                    </Button>
                  </>
                )}
              </>
            ) : (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleSelectAll()}
                  className="h-8 w-8 p-0"
                  title={selectedIds.size === notifications.length ? "Deselect all" : "Select all"}
                >
                  {selectedIds.size === notifications.length ? (
                    <CheckSquare className="h-4 w-4" />
                  ) : (
                    <Square className="h-4 w-4" />
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleBulkDelete()}
                  className="h-8 w-8 p-0 text-red-600 hover:text-red-700 transition-colors"
                  title={`Delete ${selectedIds.size} selected`}
                  disabled={selectedIds.size === 0}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleExitSelectMode()}
                  className="h-8 w-8 p-0"
                  title="Exit select mode"
                >
                  <X className="h-4 w-4" />
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Notifications List */}
      <div className="max-h-80 overflow-y-auto">
        {isLoading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-200 dark:border-gray-700 mx-auto mb-3"></div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Loading notifications...
            </p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-8 text-center">
            <Bell className="h-12 w-12 mx-auto text-gray-300 dark:text-gray-600 mb-3" />
            <p className="text-sm text-gray-500 dark:text-gray-400">
              No notifications yet
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200/50 dark:divide-gray-700/50">
            <AnimatePresence mode="popLayout">
              {notifications.map((notification) => (
                <motion.div
                  key={notification.id}
                  layout
                  initial={{ opacity: 1, height: "auto", x: 0 }}
                  animate={{ 
                    opacity: deletingIds.has(notification.id) ? 0 : 1,
                    height: deletingIds.has(notification.id) ? 0 : "auto",
                    x: deletingIds.has(notification.id) ? 100 : 0,
                    scale: deletingIds.has(notification.id) ? 0.95 : 1
                  }}
                  exit={{ 
                    opacity: 0, 
                    height: 0, 
                    x: 100,
                    scale: 0.95,
                    transition: { duration: 0.3, ease: "easeInOut" }
                  }}
                  transition={{ 
                    duration: 0.3, 
                    ease: "easeInOut",
                    layout: { duration: 0.2 }
                  }}
                  className={`p-4 hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors overflow-hidden ${
                    !notification.read ? 'bg-blue-50/30 dark:bg-slate-950/10' : ''
                  } ${
                    isSelectMode ? 'cursor-default' : 'cursor-pointer'
                  } ${
                    selectedIds.has(notification.id) ? 'bg-blue-100/50 dark:bg-slate-900/20' : ''
                  }`}
                  onClick={() => {
                    if (isSelectMode) {
                      handleToggleSelect(notification.id)
                    } else {
                      handleNotificationClick(notification)
                    }
                  }}
                >
                <div className="flex items-start gap-3">
                  {isSelectMode && (
                    <div className="flex-shrink-0 mt-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-4 w-4 p-0"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleToggleSelect(notification.id)
                        }}
                      >
                        {selectedIds.has(notification.id) ? (
                          <CheckSquare className="h-3 w-3 text-blue-600" />
                        ) : (
                          <Square className="h-3 w-3 text-gray-400" />
                        )}
                      </Button>
                    </div>
                  )}
                  <div className="flex-shrink-0 mt-0.5">
                    {getNotificationIcon(notification.type)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                          {notification.title}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                          {notification.message}
                        </p>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs text-gray-500 dark:text-gray-500">
                            {formatTime(notification.createdAt)}
                          </span>
                          {!notification.read && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-1">
                        {notification.actionUrl && !isSelectMode && (
                          <ExternalLink className="h-3 w-3 text-gray-400" />
                        )}
                        {!isSelectMode && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={async (e) => {
                              e.stopPropagation()
                              await handleDeleteNotification(notification.id)
                            }}
                            className="h-6 w-6 p-0 text-gray-400 hover:text-red-600 transition-colors"
                            disabled={deletingIds.has(notification.id)}
                          >
                            <X className={`h-3 w-3 ${deletingIds.has(notification.id) ? 'animate-pulse' : ''}`} />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-gray-200/50 dark:border-gray-700/50 bg-gray-50/50 dark:bg-gray-800/50">
        {notifications.length > 0 ? (
          <div className="flex items-center justify-between">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {isSelectMode ? `${selectedIds.size} selected` : `${notifications.length} notification${notifications.length !== 1 ? 's' : ''}`}
            </p>
            {isSelectMode ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleBulkDelete()}
                className="text-xs h-7 px-2 text-red-600 hover:text-red-700"
                disabled={selectedIds.size === 0}
              >
                <Trash2 className="h-3 w-3 mr-1" />
                Delete ({selectedIds.size})
              </Button>
            ) : unreadCount > 0 ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => markAllAsRead()}
                className="text-xs h-7 px-2"
              >
                <CheckCheck className="h-3 w-3 mr-1" />
                Mark all read
              </Button>
            ) : null}
          </div>
        ) : showDemoNotifications ? (
          <div className="flex justify-center">
            <Button
              variant="outline"
              size="sm"
              onClick={() => addDemoNotifications()}
              className="text-xs"
            >
              Add Demo Notifications
            </Button>
          </div>
        ) : (
          <p className="text-xs text-center text-gray-500 dark:text-gray-400">
            No notifications
          </p>
        )}
      </div>
    </div>
  )
}
