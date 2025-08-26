"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Bell, Settings, X, Check, AlertCircle, Info, Star, MessageSquare, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { NotificationFilters } from "./NotificationFilters"
import { NotificationSettings } from "./NotificationSettings"
import { NotificationItem } from "./NotificationItem"

interface Notification {
  id: string
  title: string
  message: string
  category: string
  subcategory?: string
  priority: string
  status: string
  actionText?: string
  actionUrl?: string
  createdAt: string
  readAt?: string
}

interface NotificationFilters {
  status: string
  category: string
  priority: string
}

export function NotificationCenter() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [filters, setFilters] = useState<NotificationFilters>({
    status: 'all',
    category: 'all',
    priority: 'all'
  })
  const [loading, setLoading] = useState(true)
  const [showSettings, setShowSettings] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    fetchNotifications()
  }, [filters])

  const fetchNotifications = async () => {
    try {
      setLoading(true)
      
      const params = new URLSearchParams()
      if (filters.status !== 'all') params.append('status', filters.status)
      if (filters.category !== 'all') params.append('category', filters.category)
      if (filters.priority !== 'all') params.append('priority', filters.priority)
      
      const response = await fetch(`/api/notifications?${params.toString()}`)
      
      if (response.ok) {
        const data = await response.json()
        setNotifications(data.notifications)
        
        // Contar notificaciones no leídas
        const unread = data.notifications.filter((n: Notification) => 
          ['PENDING', 'SENT', 'DELIVERED'].includes(n.status)
        ).length
        setUnreadCount(unread)
      }
    } catch (error) {
      console.error('Error fetching notifications:', error)
    } finally {
      setLoading(false)
    }
  }

  const markAsRead = async (notificationId: string) => {
    try {
      const response = await fetch(`/api/notifications/${notificationId}/read`, {
        method: 'PUT'
      })
      
      if (response.ok) {
        // Actualizar estado local
        setNotifications(prev => 
          prev.map(n => 
            n.id === notificationId 
              ? { ...n, status: 'READ', readAt: new Date().toISOString() }
              : n
          )
        )
        setUnreadCount(prev => Math.max(0, prev - 1))
      }
    } catch (error) {
      console.error('Error marking notification as read:', error)
    }
  }

  const markAllAsRead = async () => {
    try {
      const response = await fetch('/api/notifications/mark-all-read', {
        method: 'PUT'
      })
      
      if (response.ok) {
        // Actualizar estado local
        setNotifications(prev => 
          prev.map(n => ({ ...n, status: 'READ', readAt: new Date().toISOString() }))
        )
        setUnreadCount(0)
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error)
    }
  }

  const clearAll = async () => {
    try {
      const response = await fetch('/api/notifications/clear-all', {
        method: 'DELETE'
      })
      
      if (response.ok) {
        setNotifications([])
        setUnreadCount(0)
      }
    } catch (error) {
      console.error('Error clearing all notifications:', error)
    }
  }

  const handleNotificationAction = async (notification: Notification) => {
    // Marcar como actuada
    try {
      await fetch(`/api/notifications/${notification.id}/acted`, {
        method: 'PUT'
      })
      
      // Actualizar estado local
      setNotifications(prev => 
        prev.map(n => 
          n.id === notification.id 
            ? { ...n, status: 'ACTED' }
            : n
        )
      )
    } catch (error) {
      console.error('Error marking notification as acted:', error)
    }

    // Navegar a la acción si hay URL
    if (notification.actionUrl) {
      window.location.href = notification.actionUrl
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'EVENT':
        return <Calendar className="h-4 w-4" />
      case 'RATING':
        return <Star className="h-4 w-4" />
      case 'MESSAGE':
        return <MessageSquare className="h-4 w-4" />
      case 'SYSTEM':
        return <Info className="h-4 w-4" />
      default:
        return <Bell className="h-4 w-4" />
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'LOW':
        return 'bg-gray-100 text-gray-700'
      case 'NORMAL':
        return 'bg-blue-100 text-blue-700'
      case 'HIGH':
        return 'bg-yellow-100 text-yellow-700'
      case 'URGENT':
        return 'bg-red-100 text-red-700'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  const filteredNotifications = notifications.filter(notification => {
    if (filters.status !== 'all' && notification.status !== filters.status) return false
    if (filters.category !== 'all' && notification.category !== filters.category) return false
    if (filters.priority !== 'all' && notification.priority !== filters.priority) return false
    return true
  })

  if (showSettings) {
    return (
      <NotificationSettings 
        onClose={() => setShowSettings(false)}
        onSave={() => {
          setShowSettings(false)
          fetchNotifications()
        }}
      />
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-lg border border-gray-200 max-w-4xl mx-auto">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Bell className="h-6 w-6 text-blue-600" />
              {unreadCount > 0 && (
                <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </Badge>
              )}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Centro de Notificaciones
              </h3>
              <p className="text-sm text-gray-600">
                {unreadCount} notificación{unreadCount !== 1 ? 'es' : ''} no leída{unreadCount !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShowSettings(true)}
            >
              <Settings className="h-4 w-4 mr-2" />
              Configurar
            </Button>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <NotificationFilters 
        filters={filters}
        onFiltersChange={setFilters}
      />

      {/* Lista de notificaciones */}
      <div className="max-h-96 overflow-y-auto">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando notificaciones...</p>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="p-8 text-center">
            <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h4 className="text-lg font-medium text-gray-900 mb-2">
              No hay notificaciones
            </h4>
            <p className="text-gray-600">
              {notifications.length === 0 
                ? 'No tienes notificaciones aún'
                : 'No se encontraron notificaciones con los filtros aplicados'
              }
            </p>
          </div>
        ) : (
          <AnimatePresence>
            {filteredNotifications.map((notification, index) => (
              <motion.div
                key={notification.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2, delay: index * 0.05 }}
              >
                <NotificationItem
                  notification={notification}
                  onMarkAsRead={markAsRead}
                  onAction={handleNotificationAction}
                  getCategoryIcon={getCategoryIcon}
                  getPriorityColor={getPriorityColor}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>

      {/* Footer con acciones */}
      {notifications.length > 0 && (
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">
              {filteredNotifications.length} notificación{filteredNotifications.length !== 1 ? 'es' : ''} mostrada{filteredNotifications.length !== 1 ? 's' : ''}
            </span>
            
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={markAllAsRead}
                disabled={unreadCount === 0}
              >
                <Check className="h-4 w-4 mr-2" />
                Marcar todas como leídas
              </Button>
              
              <Button 
                variant="outline" 
                size="sm" 
                onClick={clearAll}
                disabled={notifications.length === 0}
              >
                <X className="h-4 w-4 mr-2" />
                Limpiar todas
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}


