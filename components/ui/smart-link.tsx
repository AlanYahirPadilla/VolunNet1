"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { Loader2 } from "lucide-react"

interface SmartLinkProps {
  href: string
  children: React.ReactNode
  preloadOnHover?: boolean
  preloadDelay?: number
  showPreloadIndicator?: boolean
  className?: string
}

export function SmartLink({
  href,
  children,
  preloadOnHover = false,
  preloadDelay = 200,
  showPreloadIndicator = true,
  className = "",
}: SmartLinkProps) {
  const [isPreloading, setIsPreloading] = useState(false)
  const [isPreloaded, setIsPreloaded] = useState(false)
  const timeoutRef = useRef<NodeJS.Timeout>()
  const linkRef = useRef<HTMLAnchorElement>(null)

  const handleMouseEnter = () => {
    if (!preloadOnHover || isPreloaded) return

    timeoutRef.current = setTimeout(() => {
      setIsPreloading(true)

      // Simular preload (en una implementación real, aquí cargarías la página)
      setTimeout(() => {
        setIsPreloading(false)
        setIsPreloaded(true)
      }, 500)
    }, preloadDelay)
  }

  const handleMouseLeave = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
  }

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  return (
    <Link href={href} className={className}>
      <motion.div
        ref={linkRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className="relative"
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
      >
        {children}

        {/* Indicador de preload */}
        {showPreloadIndicator && isPreloading && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="absolute top-2 right-2 bg-blue-500 text-white rounded-full p-1"
          >
            <Loader2 className="w-3 h-3 animate-spin" />
          </motion.div>
        )}

        {/* Indicador de precargado */}
        {showPreloadIndicator && isPreloaded && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute top-2 right-2 bg-green-500 text-white rounded-full p-1"
          >
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
          </motion.div>
        )}
      </motion.div>
    </Link>
  )
}
