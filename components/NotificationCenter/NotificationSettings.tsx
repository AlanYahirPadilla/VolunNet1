"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Bell, Mail, Smartphone, MessageSquare, Clock, Globe } from "lucide-react"

interface NotificationSettingsProps {
  onClose: () => void
  onSave: () => void
}

interface UserPreferences {
  emailNotifications: boolean
  pushNotifications: boolean
  inAppNotifications: boolean
  smsNotifications: boolean
  quietHoursStart: string
  quietHoursEnd: string
  timezone: string
  digestFrequency: string
  preferences: Record<string, any>
}

export function NotificationSettings({ onClose, onSave }: NotificationSettingsProps) {
  const [preferences, setPreferences] = useState<UserPreferences>({
    emailNotifications: true,
    pushNotifications: true,
    inAppNotifications: true,
    smsNotifications: false,
    quietHoursStart: "22:00",
    quietHoursEnd: "08:00",
    timezone: "UTC",
    digestFrequency: "DAILY",
    preferences: {}
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchUserPreferences()
  }, [])

  const fetchUserPreferences = async () => {
    try {
      const response = await fetch('/api/notifications/preferences')
      if (response.ok) {
        const data = await response.json()
        setPreferences(data.preferences)
      }
    } catch (error) {
      console.error('Error fetching user preferences:', error)
    }
  }

  const updatePreference = (key: keyof UserPreferences, value: any) => {
    setPreferences(prev => ({
      ...prev,
      [key]: value
    }))
  }

  const updateCategoryPreference = (category: string, channel: string, enabled: boolean) => {
    setPreferences(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        [category]: {
          ...prev.preferences[category],
          [channel]: enabled
        }
      }
    }))
  }

  const savePreferences = async () => {
    try {
      setLoading(true)
      
      const response = await fetch('/api/notifications/preferences', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(preferences)
      })

      if (response.ok) {
        onSave()
      }
    } catch (error) {
      console.error('Error saving preferences:', error)
    } finally {
      setLoading(false)
    }
  }

  const categories = [
    { 
      key: 'EVENT', 
      label: 'Eventos', 
      description: 'Notificaciones sobre eventos y actividades',
      icon: <Bell className="h-4 w-4" />
    },
    { 
      key: 'RATING', 
      label: 'Calificaciones', 
      description: 'Recordatorios y confirmaciones de calificaciones',
      icon: <Bell className="h-4 w-4" />
    },
    { 
      key: 'MESSAGE', 
      label: 'Mensajes', 
      description: 'Nuevos mensajes y comunicaciones',
      icon: <MessageSquare className="h-4 w-4" />
    },
    { 
      key: 'SYSTEM', 
      label: 'Sistema', 
      description: 'Actualizaciones y mantenimiento del sistema',
      icon: <Bell className="h-4 w-4" />
    }
  ]

  const channels = [
    { key: 'email', label: 'Email', icon: Mail, description: 'Recibir notificaciones por correo electrónico' },
    { key: 'push', label: 'Push', icon: Bell, description: 'Notificaciones push en el navegador' },
    { key: 'inApp', label: 'En la app', icon: Smartphone, description: 'Notificaciones dentro de la aplicación' },
    { key: 'sms', label: 'SMS', icon: MessageSquare, description: 'Notificaciones por mensaje de texto' }
  ]

  const frequencies = [
    { value: 'IMMEDIATE', label: 'Inmediato', description: 'Enviar notificaciones al momento' },
    { value: 'HOURLY', label: 'Cada hora', description: 'Resumen cada hora' },
    { value: 'DAILY', label: 'Diario', description: 'Resumen diario por la mañana' },
    { value: 'WEEKLY', label: 'Semanal', description: 'Resumen semanal los lunes' }
  ]

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
    >
      <motion.div
        initial={{ y: 20 }}
        animate={{ y: 0 }}
        className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" onClick={onClose}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Configuración de Notificaciones
                </h2>
                <p className="text-gray-600">
                  Personaliza cómo y cuándo recibir notificaciones
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Canales de notificación */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Canales de Notificación
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {channels.map((channel) => (
                  <div key={channel.key} className="flex items-center space-x-3 p-3 border rounded-lg">
                    <Switch
                      id={channel.key}
                      checked={preferences[`${channel.key}Notifications` as keyof UserPreferences] as boolean}
                      onCheckedChange={(checked) => 
                        updatePreference(`${channel.key}Notifications` as keyof UserPreferences, checked)
                      }
                    />
                    <div className="flex items-center gap-2">
                      <channel.icon className="h-4 w-4 text-gray-600" />
                      <div>
                        <Label htmlFor={channel.key} className="font-medium">
                          {channel.label}
                        </Label>
                        <p className="text-xs text-gray-500">{channel.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Preferencias por categoría */}
          <Card>
            <CardHeader>
              <CardTitle>Preferencias por Categoría</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {categories.map((category) => (
                  <div key={category.key} className="border rounded-lg p-4">
                    <div className="flex items-center gap-3 mb-3">
                      {category.icon}
                      <div>
                        <h4 className="font-medium">{category.label}</h4>
                        <p className="text-sm text-gray-600">{category.description}</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {channels.map((channel) => (
                        <div key={channel.key} className="flex items-center space-x-2">
                          <Switch
                            id={`${category.key}-${channel.key}`}
                            checked={preferences.preferences[category.key]?.[channel.key] ?? true}
                            onCheckedChange={(checked) => 
                              updateCategoryPreference(category.key, channel.key, checked)
                            }
                          />
                          <Label htmlFor={`${category.key}-${channel.key}`} className="text-sm">
                            {channel.label}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Horarios de silencio */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Horarios de Silencio
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="quietHoursStart" className="text-sm font-medium">
                    Inicio
                  </Label>
                  <Input
                    id="quietHoursStart"
                    type="time"
                    value={preferences.quietHoursStart}
                    onChange={(e) => updatePreference('quietHoursStart', e.target.value)}
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label htmlFor="quietHoursEnd" className="text-sm font-medium">
                    Fin
                  </Label>
                  <Input
                    id="quietHoursEnd"
                    type="time"
                    value={preferences.quietHoursEnd}
                    onChange={(e) => updatePreference('quietHoursEnd', e.target.value)}
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label htmlFor="timezone" className="text-sm font-medium">
                    Zona Horaria
                  </Label>
                  <Select 
                    value={preferences.timezone} 
                    onValueChange={(value) => updatePreference('timezone', value)}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="UTC">UTC</SelectItem>
                      <SelectItem value="America/Mexico_City">Ciudad de México</SelectItem>
                      <SelectItem value="America/New_York">Nueva York</SelectItem>
                      <SelectItem value="Europe/Madrid">Madrid</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <p className="text-xs text-gray-500 mt-2">
                Durante estos horarios, solo se enviarán notificaciones urgentes
              </p>
            </CardContent>
          </Card>

          {/* Frecuencia de resúmenes */}
          <Card>
            <CardHeader>
              <CardTitle>Frecuencia de Resúmenes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {frequencies.map((frequency) => (
                  <div key={frequency.value} className="flex items-center space-x-3 p-3 border rounded-lg">
                    <input
                      type="radio"
                      id={frequency.value}
                      name="digestFrequency"
                      value={frequency.value}
                      checked={preferences.digestFrequency === frequency.value}
                      onChange={(e) => updatePreference('digestFrequency', e.target.value)}
                      className="text-blue-600"
                    />
                    <div>
                      <Label htmlFor={frequency.value} className="font-medium">
                        {frequency.label}
                      </Label>
                      <p className="text-xs text-gray-500">{frequency.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-end gap-3">
            <Button variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button onClick={savePreferences} disabled={loading}>
              {loading ? 'Guardando...' : 'Guardar Cambios'}
            </Button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}



