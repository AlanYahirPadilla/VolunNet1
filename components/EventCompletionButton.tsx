"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Users, Calendar, MapPin } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface EventCompletionButtonProps {
  eventId: string
  eventTitle: string
  currentVolunteers: number
  maxVolunteers: number
  startDate: string
  city: string
  state: string
  canComplete: boolean
  onCompletion?: () => void
}

export function EventCompletionButton({
  eventId,
  eventTitle,
  currentVolunteers,
  maxVolunteers,
  startDate,
  city,
  state,
  canComplete,
  onCompletion
}: EventCompletionButtonProps) {
  const [isCompleting, setIsCompleting] = useState(false)
  const { toast } = useToast()

  const handleCompleteEvent = async () => {
    if (!canComplete) {
      toast({
        title: "Acceso Denegado",
        description: "Solo el organizador puede marcar el evento como completado",
        variant: "destructive"
      })
      return
    }

    setIsCompleting(true)

    try {
      const response = await fetch(`/api/events/${eventId}/complete`, {
        method: 'POST',
        credentials: 'include'
      })

      if (response.ok) {
        toast({
          title: "Evento Completado",
          description: "El evento ha sido marcado como completado exitosamente",
        })
        
        if (onCompletion) {
          onCompletion()
        }
      } else {
        const errorData = await response.json()
        toast({
          title: "Error",
          description: errorData.error || "No se pudo completar el evento",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error("Error completing event:", error)
      toast({
        title: "Error",
        description: "Ocurrió un error al completar el evento",
        variant: "destructive"
      })
    } finally {
      setIsCompleting(false)
    }
  }

  if (!canComplete) {
    return null
  }

  return (
    <Card className="border-green-200 bg-green-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-green-800">
          <CheckCircle className="h-5 w-5" />
          Completar Evento
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2 text-gray-600">
            <Users className="h-4 w-4" />
            <span>
              {currentVolunteers} de {maxVolunteers} voluntarios participaron
            </span>
          </div>
          <div className="flex items-center gap-2 text-gray-600">
            <Calendar className="h-4 w-4" />
            <span>
              {new Date(startDate).toLocaleDateString('es-ES', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
              })}
            </span>
          </div>
          <div className="flex items-center gap-2 text-gray-600">
            <MapPin className="h-4 w-4" />
            <span>{city}, {state}</span>
          </div>
        </div>

        <div className="space-y-3">
          <div className="text-sm text-gray-700">
            <p className="font-medium mb-2">Al marcar este evento como completado:</p>
            <ul className="list-disc list-inside space-y-1 text-gray-600">
              <li>Se notificará a todos los voluntarios participantes</li>
              <li>Se habilitará el sistema de calificaciones bidireccionales</li>
              <li>El evento se archivará automáticamente</li>
              <li>Se generará un reporte de participación</li>
            </ul>
          </div>

          <Button
            onClick={handleCompleteEvent}
            disabled={isCompleting}
            className="w-full bg-green-600 hover:bg-green-700 text-white"
          >
            {isCompleting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Completando...
              </>
            ) : (
              <>
                <CheckCircle className="h-4 w-4 mr-2" />
                Marcar como Completado
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}


