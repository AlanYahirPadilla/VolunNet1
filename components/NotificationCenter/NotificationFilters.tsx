"use client"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"

interface NotificationFilters {
  status: string
  category: string
  priority: string
}

interface NotificationFiltersProps {
  filters: NotificationFilters
  onFiltersChange: (filters: NotificationFilters) => void
}

export function NotificationFilters({ filters, onFiltersChange }: NotificationFiltersProps) {
  const updateFilter = (key: keyof NotificationFilters, value: string) => {
    onFiltersChange({
      ...filters,
      [key]: value
    })
  }

  const clearFilters = () => {
    onFiltersChange({
      status: 'all',
      category: 'all',
      priority: 'all'
    })
  }

  const hasActiveFilters = filters.status !== 'all' || filters.category !== 'all' || filters.priority !== 'all'

  return (
    <div className="p-4 border-b border-gray-200 bg-gray-50">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-medium text-gray-700">Filtros</h4>
        
        {hasActiveFilters && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={clearFilters}
            className="text-xs text-gray-500 hover:text-gray-700"
          >
            <X className="h-3 w-3 mr-1" />
            Limpiar filtros
          </Button>
        )}
      </div>

      <div className="flex flex-wrap gap-3">
        {/* Filtro por Estado */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-gray-600">Estado</label>
          <Select value={filters.status} onValueChange={(value) => updateFilter('status', value)}>
            <SelectTrigger className="w-32 h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="PENDING">Pendiente</SelectItem>
              <SelectItem value="SENT">Enviada</SelectItem>
              <SelectItem value="DELIVERED">Entregada</SelectItem>
              <SelectItem value="READ">Leída</SelectItem>
              <SelectItem value="ACTED">Actuada</SelectItem>
              <SelectItem value="EXPIRED">Expirada</SelectItem>
              <SelectItem value="ARCHIVED">Archivada</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Filtro por Categoría */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-gray-600">Categoría</label>
          <Select value={filters.category} onValueChange={(value) => updateFilter('category', value)}>
            <SelectTrigger className="w-36 h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              <SelectItem value="EVENT">Eventos</SelectItem>
              <SelectItem value="APPLICATION">Aplicaciones</SelectItem>
              <SelectItem value="RATING">Calificaciones</SelectItem>
              <SelectItem value="MESSAGE">Mensajes</SelectItem>
              <SelectItem value="SYSTEM">Sistema</SelectItem>
              <SelectItem value="SECURITY">Seguridad</SelectItem>
              <SelectItem value="PAYMENT">Pagos</SelectItem>
              <SelectItem value="PARTNERSHIP">Alianzas</SelectItem>
              <SelectItem value="ACHIEVEMENT">Logros</SelectItem>
              <SelectItem value="REMINDER">Recordatorios</SelectItem>
              <SelectItem value="REPORT">Reportes</SelectItem>
              <SelectItem value="SUPPORT">Soporte</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Filtro por Prioridad */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-gray-600">Prioridad</label>
          <Select value={filters.priority} onValueChange={(value) => updateFilter('priority', value)}>
            <SelectTrigger className="w-28 h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              <SelectItem value="LOW">Baja</SelectItem>
              <SelectItem value="NORMAL">Normal</SelectItem>
              <SelectItem value="HIGH">Alta</SelectItem>
              <SelectItem value="URGENT">Urgente</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Filtros activos */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-gray-200">
          <span className="text-xs text-gray-500">Filtros activos:</span>
          
          {filters.status !== 'all' && (
            <Badge variant="secondary" className="text-xs">
              Estado: {getStatusLabel(filters.status)}
            </Badge>
          )}
          
          {filters.category !== 'all' && (
            <Badge variant="secondary" className="text-xs">
              Categoría: {getCategoryLabel(filters.category)}
            </Badge>
          )}
          
          {filters.priority !== 'all' && (
            <Badge variant="secondary" className="text-xs">
              Prioridad: {getPriorityLabel(filters.priority)}
            </Badge>
          )}
        </div>
      )}
    </div>
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

function getCategoryLabel(category: string): string {
  const labels: Record<string, string> = {
    'EVENT': 'Eventos',
    'APPLICATION': 'Aplicaciones',
    'RATING': 'Calificaciones',
    'MESSAGE': 'Mensajes',
    'SYSTEM': 'Sistema',
    'SECURITY': 'Seguridad',
    'PAYMENT': 'Pagos',
    'PARTNERSHIP': 'Alianzas',
    'ACHIEVEMENT': 'Logros',
    'REMINDER': 'Recordatorios',
    'REPORT': 'Reportes',
    'SUPPORT': 'Soporte'
  }
  return labels[category] || category
}

function getPriorityLabel(priority: string): string {
  const labels: Record<string, string> = {
    'LOW': 'Baja',
    'NORMAL': 'Normal',
    'HIGH': 'Alta',
    'URGENT': 'Urgente'
  }
  return labels[priority] || priority
}


