"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  Clock, 
  Play, 
  CheckCircle, 
  Archive, 
  XCircle, 
  AlertTriangle,
  Info
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface EventStatusControlProps {
  eventId: string
  currentStatus: string
  startDate: string
  endDate: string
  onStatusChange: (newStatus: string) => void
  isEventOwner: boolean
}

const STATUS_CONFIG = {
  DRAFT: {
    label: 'Borrador',
    color: 'bg-gray-100 text-gray-700',
    icon: Clock,
    description: 'Evento en preparación, no visible para voluntarios',
    canChangeTo: ['PUBLISHED', 'CANCELLED']
  },
  PUBLISHED: {
    label: 'Publicado',
    color: 'bg-green-100 text-green-700',
    icon: Play,
    description: 'Evento visible y abierto para postulaciones',
    canChangeTo: ['ONGOING', 'CANCELLED', 'DRAFT']
  },
  ONGOING: {
    label: 'En Proceso',
    color: 'bg-blue-100 text-blue-700',
    icon: Play,
    description: 'Evento en ejecución, postulaciones cerradas',
    canChangeTo: ['COMPLETED', 'CANCELLED']
  },
  COMPLETED: {
    label: 'Completado',
    color: 'bg-purple-100 text-purple-700',
    icon: CheckCircle,
    description: 'Evento finalizado, listo para calificaciones',
    canChangeTo: ['ARCHIVED']
  },
  ARCHIVED: {
    label: 'Archivado',
    color: 'bg-gray-100 text-gray-700',
    icon: Archive,
    description: 'Evento histórico, solo para consulta',
    canChangeTo: ['COMPLETED']
  },
  CANCELLED: {
    label: 'Cancelado',
    color: 'bg-red-100 text-red-700',
    icon: XCircle,
    description: 'Evento cancelado, no se realizará',
    canChangeTo: ['DRAFT', 'PUBLISHED']
  }
}

export function EventStatusControl({ 
  eventId, 
  currentStatus, 
  startDate, 
  endDate, 
  onStatusChange,
  isEventOwner 
}: EventStatusControlProps) {
  const [selectedStatus, setSelectedStatus] = useState(currentStatus)
  const [isChanging, setIsChanging] = useState(false)
  const [showValidation, setShowValidation] = useState(false)
  const { toast } = useToast()

  const currentConfig = STATUS_CONFIG[currentStatus as keyof typeof STATUS_CONFIG]
  const selectedConfig = STATUS_CONFIG[selectedStatus as keyof typeof STATUS_CONFIG]
  const canChangeTo = currentConfig?.canChangeTo || []

  const handleStatusChange = async () => {
    if (selectedStatus === currentStatus) return

    setIsChanging(true)
    try {
      const response = await fetch(`/api/events/${eventId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: selectedStatus })
      })

      if (response.ok) {
        toast({
          title: "Estado actualizado",
          description: `El evento ahora está ${selectedConfig?.label.toLowerCase()}`,
        })
        onStatusChange(selectedStatus)
        setShowValidation(false)
      } else {
        const error = await response.json()
        toast({
          title: "Error al cambiar estado",
          description: error.error || "No se pudo cambiar el estado del evento",
          variant: "destructive"
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Error de conexión al cambiar el estado",
        variant: "destructive"
      })
    } finally {
      setIsChanging(false)
    }
  }

  const validateStatusChange = () => {
    const now = new Date()
    const eventStart = new Date(startDate)
    const eventEnd = new Date(endDate)

    // Validaciones específicas por estado
    if (selectedStatus === 'PUBLISHED') {
      if (now >= eventStart) {
        return "No puedes publicar un evento que ya ha comenzado"
      }
    }

    if (selectedStatus === 'ONGOING') {
      if (now < eventStart) {
        return "No puedes marcar como 'En Proceso' un evento que no ha comenzado"
      }
    }

    if (selectedStatus === 'COMPLETED') {
      if (now < eventEnd) {
        return "No puedes marcar como 'Completado' un evento que no ha terminado"
      }
    }

    if (selectedStatus === 'ARCHIVED') {
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
      if (eventEnd > thirtyDaysAgo) {
        return "Solo puedes archivar eventos completados hace más de 30 días"
      }
    }

    return null
  }

  const handleStatusSelect = (newStatus: string) => {
    setSelectedStatus(newStatus)
    const validationError = validateStatusChange()
    setShowValidation(!!validationError)
  }

  if (!isEventOwner) {
    return null
  }

  const validationError = validateStatusChange()

  return (
    <Card className="border-blue-200 bg-blue-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-blue-800">
          <Info className="h-5 w-5" />
          Control de Estado del Evento
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Estado actual */}
        <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700">Estado actual:</span>
            <Badge className={currentConfig?.color}>
              {currentConfig?.label}
            </Badge>
          </div>
          <div className="text-xs text-gray-500">
            {currentConfig?.description}
          </div>
        </div>

        {/* Selector de nuevo estado */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            Cambiar a:
          </label>
          <Select value={selectedStatus} onValueChange={handleStatusSelect}>
            <SelectTrigger className="border-blue-200">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(STATUS_CONFIG).map(([status, config]) => (
                <SelectItem 
                  key={status} 
                  value={status}
                  disabled={!canChangeTo.includes(status)}
                >
                  <div className="flex items-center gap-2">
                    <config.icon className="h-4 w-4" />
                    <Badge className={config.color}>
                      {config.label}
                    </Badge>
                    {!canChangeTo.includes(status) && (
                      <span className="text-xs text-gray-400">(No disponible)</span>
                    )}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Validación */}
        {showValidation && validationError && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{validationError}</AlertDescription>
          </Alert>
        )}

        {/* Información del nuevo estado */}
        {selectedStatus !== currentStatus && selectedConfig && (
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              <strong>{selectedConfig.label}:</strong> {selectedConfig.description}
            </AlertDescription>
          </Alert>
        )}

        {/* Botón de cambio */}
        <Button
          onClick={handleStatusChange}
          disabled={isChanging || selectedStatus === currentStatus || !!validationError}
          className="w-full bg-blue-600 hover:bg-blue-700"
        >
          {isChanging ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
              Cambiando estado...
            </>
          ) : (
            `Cambiar a ${selectedConfig?.label}`
          )}
        </Button>

        {/* Flujo de estados recomendado */}
        <div className="text-xs text-gray-600 bg-white p-3 rounded-lg border">
          <div className="font-medium mb-2">Flujo recomendado:</div>
          <div className="space-y-1">
            <div>📝 <strong>Borrador</strong> → 📢 <strong>Publicado</strong> → 🔄 <strong>En Proceso</strong> → ✅ <strong>Completado</strong> → 📦 <strong>Archivado</strong></div>
            <div className="text-gray-500">Los estados cambian automáticamente según las fechas, pero puedes controlarlos manualmente aquí.</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}



