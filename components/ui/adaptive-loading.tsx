"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { LoadingScreen } from "./loading-screen"
import { SkeletonLoader } from "./skeleton-loader"
import { ProgressiveLoader } from "./progressive-loader"

interface LoadingStep {
  id: string
  label: string
  status: "pending" | "loading" | "completed" | "error"
}

interface AdaptiveLoadingProps {
  children: React.ReactNode
  isLoading: boolean
  type?: "dashboard" | "page" | "component"
  loadingSteps?: LoadingStep[]
  minLoadingTime?: number
}

export function AdaptiveLoading({
  children,
  isLoading,
  type = "page",
  loadingSteps = [],
  minLoadingTime = 500,
}: AdaptiveLoadingProps) {
  const [showLoading, setShowLoading] = useState(isLoading)
  const [connectionSpeed, setConnectionSpeed] = useState<"slow" | "fast">("fast")
  const [deviceType, setDeviceType] = useState<"mobile" | "desktop">("desktop")

  useEffect(() => {
    // Detectar tipo de dispositivo
    const isMobile = window.innerWidth < 768
    setDeviceType(isMobile ? "mobile" : "desktop")

    // Detectar velocidad de conexión (aproximada)
    if ("connection" in navigator) {
      const connection = (navigator as any).connection
      if (connection && connection.effectiveType) {
        const slowConnections = ["slow-2g", "2g", "3g"]
        setConnectionSpeed(slowConnections.includes(connection.effectiveType) ? "slow" : "fast")
      }
    }
  }, [])

  useEffect(() => {
    if (!isLoading) {
      // Mantener loading mínimo para mejor UX
      const timer = setTimeout(
        () => {
          setShowLoading(false)
        },
        Math.max(0, minLoadingTime),
      )

      return () => clearTimeout(timer)
    } else {
      setShowLoading(true)
    }
  }, [isLoading, minLoadingTime])

  if (!showLoading) {
    return <>{children}</>
  }

  // Seleccionar tipo de loading basado en contexto
  if (type === "dashboard") {
    if (deviceType === "mobile" || connectionSpeed === "slow") {
      return <ProgressiveLoader steps={loadingSteps} />
    }
    return <LoadingScreen type="dashboard" steps={loadingSteps} />
  }

  if (type === "component") {
    return <SkeletonLoader type="card" />
  }

  // Loading por defecto
  return <LoadingScreen type="page" />
}
