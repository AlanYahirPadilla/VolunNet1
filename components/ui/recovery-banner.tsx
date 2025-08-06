"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { RotateCcw, X, Clock } from "lucide-react"

interface RecoveryBannerProps {
  onRestore: () => void
  onDismiss: () => void
  timestamp: number
  isVisible: boolean
}

export function RecoveryBanner({ onRestore, onDismiss, timestamp, isVisible }: RecoveryBannerProps) {
  const [isAnimating, setIsAnimating] = useState(false)

  const formatTimestamp = (ts: number) => {
    const date = new Date(ts)
    const now = new Date()
    const diff = now.getTime() - ts
    const minutes = Math.floor(diff / 60000)

    if (minutes < 1) return "hace un momento"
    if (minutes === 1) return "hace 1 minuto"
    if (minutes < 60) return `hace ${minutes} minutos`

    return date.toLocaleString("es-ES", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const handleRestore = () => {
    setIsAnimating(true)
    setTimeout(() => {
      onRestore()
      setIsAnimating(false)
    }, 300)
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -50, scale: 0.95 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="mb-6"
        >
          <Alert className="border-blue-200 bg-blue-50/50 backdrop-blur-sm">
            <Clock className="h-4 w-4 text-blue-600" />
            <AlertDescription className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-blue-800 font-medium">Progreso guardado encontrado</p>
                <p className="text-blue-600 text-sm mt-1">
                  Tienes un formulario sin completar guardado {formatTimestamp(timestamp)}
                </p>
              </div>
              <div className="flex items-center space-x-2 ml-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRestore}
                  disabled={isAnimating}
                  className="bg-blue-600 text-white hover:bg-blue-700 border-blue-600"
                >
                  <motion.div
                    animate={isAnimating ? { rotate: 360 } : { rotate: 0 }}
                    transition={{ duration: 0.5 }}
                    className="flex items-center space-x-1"
                  >
                    <RotateCcw className="h-3 w-3" />
                    <span>Restaurar</span>
                  </motion.div>
                </Button>
                <Button variant="ghost" size="sm" onClick={onDismiss} className="text-gray-500 hover:text-gray-700">
                  <X className="h-3 w-3" />
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
