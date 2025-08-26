"use client"

import { useEffect, useCallback, useRef } from "react"

interface AutosaveOptions {
  key: string
  data: any
  delay?: number
  enabled?: boolean
}

export function useFormAutosave({ key, data, delay = 1000, enabled = true }: AutosaveOptions) {
  const timeoutRef = useRef<NodeJS.Timeout>()
  const lastSavedRef = useRef<string>("")

  const saveToStorage = useCallback(() => {
    if (!enabled) return

    try {
      const dataString = JSON.stringify(data)

      // Solo guardar si los datos han cambiado
      if (dataString !== lastSavedRef.current) {
        localStorage.setItem(key, dataString)
        localStorage.setItem(`${key}_timestamp`, Date.now().toString())
        lastSavedRef.current = dataString

        // Disparar evento personalizado para notificar el guardado
        window.dispatchEvent(
          new CustomEvent("formAutosaved", {
            detail: { key, timestamp: Date.now() },
          }),
        )
      }
    } catch (error) {
      console.warn("Error saving form data to localStorage:", error)
    }
  }, [key, data, enabled])

  const debouncedSave = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    timeoutRef.current = setTimeout(saveToStorage, delay)
  }, [saveToStorage, delay])

  useEffect(() => {
    if (enabled && data) {
      debouncedSave()
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [data, debouncedSave, enabled])

  const loadFromStorage = useCallback(() => {
    if (!enabled) return null

    try {
      const savedData = localStorage.getItem(key)
      const timestamp = localStorage.getItem(`${key}_timestamp`)

      if (savedData && timestamp) {
        const parsedData = JSON.parse(savedData)
        const savedTime = Number.parseInt(timestamp)
        const now = Date.now()
        const hourInMs = 60 * 60 * 1000

        // Solo cargar si los datos fueron guardados en la última hora
        if (now - savedTime < hourInMs) {
          return {
            data: parsedData,
            timestamp: savedTime,
            isRecent: now - savedTime < 5 * 60 * 1000, // Últimos 5 minutos
          }
        }
      }
    } catch (error) {
      console.warn("Error loading form data from localStorage:", error)
    }

    return null
  }, [key, enabled])

  const clearStorage = useCallback(() => {
    try {
      localStorage.removeItem(key)
      localStorage.removeItem(`${key}_timestamp`)
      lastSavedRef.current = ""
    } catch (error) {
      console.warn("Error clearing form data from localStorage:", error)
    }
  }, [key])

  return {
    loadFromStorage,
    clearStorage,
    saveToStorage,
  }
}
