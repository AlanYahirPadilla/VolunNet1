"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { formatDistanceToNow } from "date-fns"
import { es } from "date-fns/locale"

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

interface NotificationItemProps {
  notification: Notification
  onMarkAsRead: (id: string) => void
  onAction: (notification: Notification) => void
  getCategoryIcon: (category: string) => React.ReactNode
  getPriorityColor: (priority: string) => string
}

export function NotificationItem({ 
  notification, 
  onMarkAsRead, 
  onAction,
  getCategoryIcon,
  getPriorityColor
}: NotificationItemProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const isUnread = ['PENDING', 'SENT', 'DELIVERED'].includes(notification.status)

  const handleMarkAsRead = () => {
    if (isUnread) {
      onMarkAsRead(notification.id)
    }
  }

  const handleAction = () => {
    onAction(notification)
  }

  const formatTime = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { 
        addSuffix: true, 
        locale: es 
      })
    } catch {
      return 'Hace un momento'
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={`border-b border-gray-100 transition-all duration-200 ${
        isUnread ? 'bg-blue-50' : 'hover:bg-gray-50'
      }`}
    >
      <div className="p-4">
        <div className="flex items-start gap-3">
          {/* Icono de categoría */}
          <div className="flex-shrink-0 mt-1">
            <div className="p-2 rounded-lg bg-gray-100">
              {getCategoryIcon(notification.category)}
            </div>
          </div>

          {/* Contenido principal */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2 flex-wrap">
                <h4 className={`text-sm font-medium ${
                  isUnread ? 'text-gray-900' : 'text-gray-700'
                }`}>
                  {notification.title}
                </h4>
                
                {/* Badge de prioridad */}
                <Badge className={`px-2 py-1 text-xs font-medium rounded-full ${
                  getPriorityColor(notification.priority)
                }`}>
                  {notification.priority}
                </Badge>
                
                {/* Indicador de no leída */}
                {isUnread && (
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                )}
              </div>
              
              <span className="text-xs text-gray-500 flex-shrink-0">
                {formatTime(notification.createdAt)}
              </span>
            </div>
            
            {/* Mensaje */}
            <p className={`text-sm mb-3 ${
              isUnread ? 'text-gray-800' : 'text-gray-600'
            }`}>
              {notification.message}
            </p>
            
            {/* Acciones */}
            <div className="flex items-center gap-2 flex-wrap">
              {notification.actionText && (
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={handleAction}
                  className="text-xs"
                >
                  {notification.actionText}
                </Button>
              )}
              
              {isUnread && (
                <Button 
                  size="sm" 
                  variant="ghost"
                  onClick={handleMarkAsRead}
                  className="text-xs text-gray-500 hover:text-gray-700"
                >
                  Marcar como leída
                </Button>
              )}
              
              {/* Botón para expandir/contraer si el mensaje es largo */}
              {notification.message.length > 100 && (
                <Button 
                  size="sm" 
                  variant="ghost"
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="text-xs text-gray-500 hover:text-gray-700"
                >
                  {isExpanded ? 'Ver menos' : 'Ver más'}
                </Button>
              )}
            </div>
            
            {/* Metadatos adicionales */}
            <div className="flex items-center gap-3 mt-3 pt-3 border-t border-gray-100">
              <span className="text-xs text-gray-500">
                Categoría: {notification.category}
              </span>
              
              {notification.subcategory && (
                <span className="text-xs text-gray-500">
                  Subcategoría: {notification.subcategory}
                </span>
              )}
              
              <span className="text-xs text-gray-500">
                Estado: {getStatusLabel(notification.status)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    'PENDING': 'Pendiente',
    'SENT': 'Enviada',
    'DELIVERED': 'Entregada',
    'READ': 'Leída',
    'ACTED': 'Actuada',
    'EXPIRED': 'Expirada',
    'ARCHIVED': 'Archivada'
  }
  return labels[status] || status
}



