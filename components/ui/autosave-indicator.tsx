"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Check, Cloud, CloudOff, Clock } from "lucide-react"

interface AutosaveIndicatorProps {
  isEnabled?: boolean
  className?: string
}

export function AutosaveIndicator({ isEnabled = true, className = "" }: AutosaveIndicatorProps) {
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle")
  const [lastSaved, setLastSaved] = useState<Date | null>(null)

  useEffect(() => {
    if (!isEnabled) return

    const handleAutosave = (event: CustomEvent) => {
      setStatus("saving")

      setTimeout(() => {
        setStatus("saved")
        setLastSaved(new Date())

        setTimeout(() => {
          setStatus("idle")
        }, 2000)
      }, 500)
    }

    window.addEventListener("formAutosaved", handleAutosave as EventListener)

    return () => {
      window.removeEventListener("formAutosaved", handleAutosave as EventListener)
    }
  }, [isEnabled])

  if (!isEnabled) return null

  const getStatusIcon = () => {
    switch (status) {
      case "saving":
        return <Cloud className="h-3 w-3 animate-pulse" />
      case "saved":
        return <Check className="h-3 w-3" />
      case "error":
        return <CloudOff className="h-3 w-3" />
      default:
        return <Clock className="h-3 w-3" />
    }
  }

  const getStatusText = () => {
    switch (status) {
      case "saving":
        return "Guardando..."
      case "saved":
        return "Guardado"
      case "error":
        return "Error al guardar"
      default:
        return lastSaved ? `Guardado ${formatTime(lastSaved)}` : "Autoguardado activado"
    }
  }

  const getStatusColor = () => {
    switch (status) {
      case "saving":
        return "text-blue-600"
      case "saved":
        return "text-green-600"
      case "error":
        return "text-red-600"
      default:
        return "text-gray-500"
    }
  }

  const formatTime = (date: Date) => {
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / 60000)

    if (minutes < 1) return "hace un momento"
    if (minutes === 1) return "hace 1 minuto"
    if (minutes < 60) return `hace ${minutes} minutos`

    return date.toLocaleTimeString("es-ES", {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className={`flex items-center space-x-2 text-xs ${getStatusColor()} ${className}`}
      >
        {getStatusIcon()}
        <span>{getStatusText()}</span>
      </motion.div>
    </AnimatePresence>
  )
}
