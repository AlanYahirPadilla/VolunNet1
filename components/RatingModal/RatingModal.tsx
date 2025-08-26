"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Star, X, Send, User, Calendar } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface RatingModalProps {
  isOpen: boolean
  onClose: () => void
  event: {
    id: string
    title: string
    startDate: string
    endDate: string
  }
  userToRate: {
    id: string
    name: string
    role: string
    avatar?: string
  }
  onSubmit: (rating: number, feedback: string) => void
  loading?: boolean
}

export function RatingModal({ 
  isOpen, 
  onClose, 
  event, 
  userToRate, 
  onSubmit, 
  loading = false 
}: RatingModalProps) {
  const [rating, setRating] = useState(0)
  const [feedback, setFeedback] = useState("")
  const [hoveredRating, setHoveredRating] = useState(0)

  const handleSubmit = () => {
    if (rating > 0) {
      onSubmit(rating, feedback)
    }
  }

  const handleClose = () => {
    setRating(0)
    setFeedback("")
    onClose()
  }

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    } catch {
      return dateString
    }
  }

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'VOLUNTEER':
        return 'Voluntario'
      case 'ORGANIZATION':
        return 'Organización'
      default:
        return role
    }
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      >
        <motion.div
          initial={{ scale: 0.95, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.95, y: 20 }}
          className="bg-white rounded-lg shadow-xl max-w-md w-full"
        >
          {/* Header */}
          <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  Calificar Experiencia
                </h2>
                <p className="text-sm text-gray-600">
                  Evalúa tu experiencia con {userToRate.name}
                </p>
              </div>
              <Button variant="ghost" size="sm" onClick={handleClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* Información del evento */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-blue-600" />
                  {event.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span className="font-medium">Fecha:</span>
                  <span>{formatDate(event.startDate)}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span className="font-medium">Estado:</span>
                  <Badge variant="outline" className="text-xs">
                    Completado
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Usuario a calificar */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <User className="h-5 w-5 text-green-600" />
                  {userToRate.name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  {userToRate.avatar ? (
                    <img 
                      src={userToRate.avatar} 
                      alt={userToRate.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                      <User className="h-6 w-6 text-gray-500" />
                    </div>
                  )}
                  <div>
                    <p className="font-medium text-gray-900">{userToRate.name}</p>
                    <Badge variant="secondary" className="text-xs">
                      {getRoleLabel(userToRate.role)}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Sistema de calificación */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Tu Calificación</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Estrellas */}
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 mb-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHoveredRating(star)}
                        onMouseLeave={() => setHoveredRating(0)}
                        className="p-1 transition-all duration-200 hover:scale-110"
                      >
                        <Star
                          className={`h-8 w-8 ${
                            star <= (hoveredRating || rating)
                              ? 'text-yellow-400 fill-current'
                              : 'text-gray-300'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                  
                  <p className="text-sm text-gray-600">
                    {rating === 0 && "Haz clic en las estrellas para calificar"}
                    {rating === 1 && "Muy malo"}
                    {rating === 2 && "Malo"}
                    {rating === 3 && "Regular"}
                    {rating === 4 && "Bueno"}
                    {rating === 5 && "Excelente"}
                  </p>
                </div>

                {/* Comentario */}
                <div>
                  <label htmlFor="feedback" className="block text-sm font-medium text-gray-700 mb-2">
                    Comentario (opcional)
                  </label>
                  <Textarea
                    id="feedback"
                    placeholder="Comparte tu experiencia, sugerencias o comentarios..."
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    rows={3}
                    className="resize-none"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Tu comentario ayudará a mejorar la experiencia para futuros eventos
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Información adicional */}
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-blue-600 text-xs font-medium">i</span>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-blue-900 mb-1">
                    Calificación Bidireccional
                  </h4>
                  <p className="text-xs text-blue-700">
                    Este sistema permite que tanto voluntarios como organizaciones se califiquen mutuamente, 
                    creando una comunidad más transparente y confiable.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between">
              <Button variant="outline" onClick={handleClose}>
                Cancelar
              </Button>
              
              <Button 
                onClick={handleSubmit}
                disabled={rating === 0 || loading}
                className="min-w-[120px]"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Enviando...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Enviar Calificación
                  </>
                )}
              </Button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}


