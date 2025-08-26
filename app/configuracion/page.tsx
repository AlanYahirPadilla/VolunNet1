"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Heart, Home, Bell, User, Settings, LogOut, 
  User as UserIcon, Shield, Bell as BellIcon, 
  Palette, Globe, Smartphone, Mail, MapPin,
  Save, Eye, EyeOff, Lock, Unlock, Trash2, CheckCircle
} from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"
import { getCurrentUser } from "@/app/auth/actions"
import { VerificationModal } from "@/components/ui/verification-modal"

interface UserData {
  id: string
  firstName: string
  lastName: string
  email: string
  phone?: string
  city?: string
  state?: string
  country?: string
  bio?: string
  role: string
  avatar?: string
  emailVerified?: boolean
  phoneVerified?: boolean
}

interface NotificationSettings {
  emailNotifications: boolean
  pushNotifications: boolean
  eventReminders: boolean
  newEventAlerts: boolean
  applicationUpdates: boolean
  communityUpdates: boolean
}

interface PrivacySettings {
  profileVisibility: 'public' | 'private' | 'friends'
  showEmail: boolean
  showPhone: boolean
  showLocation: boolean
  allowMessages: boolean
}

export default function ConfiguracionPage() {
  const router = useRouter()
  const [user, setUser] = useState<UserData | null>(null)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [mounted, setMounted] = useState(false)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState("perfil")
  const [showPassword, setShowPassword] = useState(false)
  const [success, setSuccess] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [verifyingEmail, setVerifyingEmail] = useState(false)
  const [verifyingPhone, setVerifyingPhone] = useState(false)
  const [emailVerificationSent, setEmailVerificationSent] = useState(false)
  const [phoneVerificationSent, setPhoneVerificationSent] = useState(false)
  const [showEmailModal, setShowEmailModal] = useState(false)
  const [showPhoneModal, setShowPhoneModal] = useState(false)

  // Estados para las configuraciones
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    city: '',
    state: '',
    country: '',
    bio: ''
  })

  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    emailNotifications: true,
    pushNotifications: true,
    eventReminders: true,
    newEventAlerts: true,
    applicationUpdates: true,
    communityUpdates: false
  })

  const [privacySettings, setPrivacySettings] = useState<PrivacySettings>({
    profileVisibility: 'public',
    showEmail: false,
    showPhone: false,
    showLocation: true,
    allowMessages: true
  })

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted) {
      loadUserData()
    }
  }, [mounted])

  const loadUserData = async () => {
    try {
      setLoading(true)
      const currentUser = await getCurrentUser()
      setUser(currentUser)
      
      if (currentUser) {
        setProfileData({
          firstName: currentUser.firstName || '',
          lastName: currentUser.lastName || '',
          email: currentUser.email || '',
          phone: currentUser.phone || '',
          city: currentUser.city || '',
          state: currentUser.state || '',
          country: currentUser.country || '',
          bio: currentUser.bio || ''
        })
      }
    } catch (error) {
      console.error("Error loading user data:", error)
      setError("Error al cargar los datos del usuario")
    } finally {
      setLoading(false)
    }
  }

  const handleSaveProfile = async () => {
    setSaving(true)
    setError(null)
    setSuccess(null)

    try {
      // Aquí iría la lógica para guardar los datos del perfil
      await new Promise(resolve => setTimeout(resolve, 1000)) // Simulación
      setSuccess("Perfil actualizado correctamente")
    } catch (error) {
      setError("Error al actualizar el perfil")
    } finally {
      setSaving(false)
    }
  }

  const handleSaveNotifications = async () => {
    setSaving(true)
    setError(null)
    setSuccess(null)

    try {
      // Aquí iría la lógica para guardar las configuraciones de notificaciones
      await new Promise(resolve => setTimeout(resolve, 1000)) // Simulación
      setSuccess("Configuración de notificaciones actualizada")
    } catch (error) {
      setError("Error al actualizar las notificaciones")
    } finally {
      setSaving(false)
    }
  }

  const handleSavePrivacy = async () => {
    setSaving(true)
    setError(null)
    setSuccess(null)

    try {
      // Aquí iría la lógica para guardar las configuraciones de privacidad
      await new Promise(resolve => setTimeout(resolve, 1000)) // Simulación
      setSuccess("Configuración de privacidad actualizada")
    } catch (error) {
      setError("Error al actualizar la privacidad")
    } finally {
      setSaving(false)
    }
  }

  const handleChangePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError("Las contraseñas no coinciden")
      return
    }

    if (passwordData.newPassword.length < 8) {
      setError("La nueva contraseña debe tener al menos 8 caracteres")
      return
    }

    setSaving(true)
    setError(null)
    setSuccess(null)

    try {
      // Aquí iría la lógica para cambiar la contraseña
      await new Promise(resolve => setTimeout(resolve, 1000)) // Simulación
      setSuccess("Contraseña cambiada correctamente")
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      })
    } catch (error) {
      setError("Error al cambiar la contraseña")
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteAccount = async () => {
    if (!confirm('¿Estás seguro de que quieres eliminar tu cuenta? Esta acción no se puede deshacer.')) {
      return
    }

    setSaving(true)
    setError(null)

    try {
      // Aquí iría la lógica para eliminar la cuenta
      await new Promise(resolve => setTimeout(resolve, 1000)) // Simulación
      router.push('/')
    } catch (error) {
      setError("Error al eliminar la cuenta")
    } finally {
      setSaving(false)
    }
  }

  const handleSendEmailVerification = async () => {
    setVerifyingEmail(true)
    setError(null)
    setSuccess(null)

    try {
      const response = await fetch("/api/auth/verify-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "send",
          email: profileData.email,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setEmailVerificationSent(true)
        setSuccess("Código de verificación enviado a tu correo electrónico")
      } else {
        setError(data.error || "Error al enviar el código de verificación")
      }
    } catch (error) {
      setError("Error al enviar el código de verificación")
    } finally {
      setVerifyingEmail(false)
    }
  }

  const handleSendPhoneVerification = async () => {
    if (!profileData.phone) {
      setError("Primero debes agregar un número de teléfono")
      return
    }

    setVerifyingPhone(true)
    setError(null)
    setSuccess(null)

    try {
      const response = await fetch("/api/auth/verify-phone", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "send",
          phone: profileData.phone,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setPhoneVerificationSent(true)
        setSuccess("Código de verificación enviado a tu teléfono")
      } else {
        setError(data.error || "Error al enviar el código de verificación")
      }
    } catch (error) {
      setError("Error al enviar el código de verificación")
    } finally {
      setVerifyingPhone(false)
    }
  }

  const handleVerifyEmail = async (code: string) => {
    setVerifyingEmail(true)
    setError(null)
    setSuccess(null)

    try {
      const response = await fetch("/api/auth/verify-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "verify",
          code: code,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess("Correo electrónico verificado correctamente")
        setEmailVerificationSent(false)
        setShowEmailModal(false)
        // Recargar datos del usuario para actualizar el estado
        await loadUserData()
      } else {
        setError(data.error || "Error al verificar el código")
      }
    } catch (error) {
      setError("Error al verificar el código")
    } finally {
      setVerifyingEmail(false)
    }
  }

  const handleVerifyPhone = async (code: string) => {
    setVerifyingPhone(true)
    setError(null)
    setSuccess(null)

    try {
      const response = await fetch("/api/auth/verify-phone", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "verify",
          code: code,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess("Teléfono verificado correctamente")
        setPhoneVerificationSent(false)
        setShowPhoneModal(false)
        // Recargar datos del usuario para actualizar el estado
        await loadUserData()
      } else {
        setError(data.error || "Error al verificar el código")
      }
    } catch (error) {
      setError("Error al verificar el código")
    } finally {
      setVerifyingPhone(false)
    }
  }

  if (!mounted || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando configuración...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header superior */}
      <div className="sticky top-0 z-30 bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-4 py-2">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <Link href="/dashboard" className="flex items-center gap-2 focus:outline-none">
              <Heart className="h-8 w-8 text-blue-600 fill-blue-200" />
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">VolunNet</span>
            </Link>
          </div>
          
          {/* Navegación */}
          <div className="flex items-center gap-6">
            <nav className="flex gap-2 text-gray-600 text-sm font-medium">
              <Link href="/dashboard" className="flex items-center gap-1 px-3 py-1 rounded-lg hover:text-blue-700 hover:bg-blue-50 transition group relative">
                <Home className="h-5 w-5 group-hover:text-blue-700 transition" />
                <span>Inicio</span>
                <span className="absolute left-0 -bottom-0.5 w-0 h-0.5 bg-blue-600 transition-all duration-300 group-hover:w-full rounded-full"></span>
              </Link>
              <Link href="/eventos/buscar" className="flex items-center gap-1 px-3 py-1 rounded-lg hover:text-blue-700 hover:bg-blue-50 transition group relative">
                <Bell className="h-5 w-5 group-hover:text-blue-700 transition" />
                <span>Eventos</span>
                <span className="absolute left-0 -bottom-0.5 w-0 h-0.5 bg-blue-600 transition-all duration-300 group-hover:w-full rounded-full"></span>
              </Link>
              <Link href="/organizaciones/dashboard" className="flex items-center gap-1 px-3 py-1 rounded-lg hover:text-blue-700 hover:bg-blue-50 transition group relative">
                <User className="h-5 w-5 group-hover:text-blue-700 transition" />
                <span>Organizaciones</span>
                <span className="absolute left-0 -bottom-0.5 w-0 h-0.5 bg-blue-600 transition-all duration-300 group-hover:w-full rounded-full"></span>
              </Link>
            </nav>
            
            {/* Separador visual */}
            <div className="w-px h-8 bg-gray-200 mx-2" />
            
            {/* Avatar usuario */}
            <div className="relative">
              <button
                className="h-9 w-9 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-bold focus:outline-none focus:ring-2 focus:ring-blue-300"
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                aria-label="Abrir menú de usuario"
              >
                {user?.firstName?.[0] || 'U'}
              </button>
              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-44 bg-white rounded-xl shadow-lg border border-gray-100 z-50">
                  <div className="px-4 py-3 border-b border-gray-100">
                    <div className="font-semibold text-gray-800 text-sm">{user?.firstName || 'Usuario'} {user?.lastName || ''}</div>
                    <div className="text-xs text-gray-500">{user?.email || 'usuario@volunnet.com'}</div>
                  </div>
                  <Link
                    href="/perfil"
                    className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 transition"
                  >
                    <UserIcon className="h-4 w-4 text-gray-500" />
                    Perfil
                  </Link>
                  <Link
                    href="/configuracion"
                    className="flex items-center gap-2 w-full px-4 py-2 text-sm text-blue-700 bg-blue-50 transition"
                  >
                    <Settings className="h-4 w-4 text-blue-500" />
                    Configuración
                  </Link>
                  <div className="border-t border-gray-100 my-1" />
                  <button
                    className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 rounded-b-xl transition"
                    onClick={async () => {
                      await fetch("/api/auth/logout", { method: "POST" });
                      router.push("/");
                    }}
                  >
                    <LogOut className="h-4 w-4 text-gray-500" />
                    Cerrar sesión
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Header de la página */}
      <div className="bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-blue-600/10 backdrop-blur-md border-b border-blue-200/50">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center gap-6">
            <Link href="/dashboard" className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium transition-colors duration-200 group">
              <span className="text-lg">←</span>
              <span>Volver al Dashboard</span>
            </Link>
            <div className="h-8 w-px bg-gray-300/50" />
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                Configuración
              </h1>
              <p className="text-sm text-gray-600 mt-1">Gestiona tu cuenta y preferencias</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Alertas */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3"
          >
            <div className="h-5 w-5 text-red-500">⚠️</div>
            <span className="text-red-700">{error}</span>
          </motion.div>
        )}

        {success && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3"
          >
            <div className="h-5 w-5 text-green-500">✅</div>
            <span className="text-green-700">{success}</span>
          </motion.div>
        )}

        {/* Tabs de configuración */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-white/80 backdrop-blur-sm border border-gray-200">
            <TabsTrigger value="perfil" className="flex items-center gap-2">
              <UserIcon className="h-4 w-4" />
              Perfil
            </TabsTrigger>
            <TabsTrigger value="notificaciones" className="flex items-center gap-2">
              <BellIcon className="h-4 w-4" />
              Notificaciones
            </TabsTrigger>
            <TabsTrigger value="privacidad" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Privacidad
            </TabsTrigger>
            <TabsTrigger value="seguridad" className="flex items-center gap-2">
              <Lock className="h-4 w-4" />
              Seguridad
            </TabsTrigger>
          </TabsList>

          {/* Contenido de Perfil */}
          <TabsContent value="perfil" className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 border-b border-blue-100">
                  <CardTitle className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <UserIcon className="h-5 w-5 text-blue-500" />
                    Información Personal
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="firstName" className="text-sm font-medium text-gray-700">Nombre *</Label>
                      <Input
                        id="firstName"
                        value={profileData.firstName}
                        onChange={(e) => setProfileData({ ...profileData, firstName: e.target.value })}
                        className="mt-2 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <Label htmlFor="lastName" className="text-sm font-medium text-gray-700">Apellido *</Label>
                      <Input
                        id="lastName"
                        value={profileData.lastName}
                        onChange={(e) => setProfileData({ ...profileData, lastName: e.target.value })}
                        className="mt-2 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="email" className="text-sm font-medium text-gray-700">Correo electrónico *</Label>
                    <div className="flex items-center gap-2 mt-2">
                      <Input
                        id="email"
                        type="email"
                        value={profileData.email}
                        onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                        className="flex-1 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                      />
                      <div className="flex items-center gap-2">
                        {user?.emailVerified ? (
                          <Badge className="bg-green-100 text-green-700 border-green-200">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Verificado
                          </Badge>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={handleSendEmailVerification}
                            disabled={verifyingEmail}
                            className="text-xs"
                          >
                            {verifyingEmail ? "Enviando..." : emailVerificationSent ? "Verificar" : "Verificar"}
                          </Button>
                        )}
                      </div>
                    </div>
                    {emailVerificationSent && !user?.emailVerified && (
                      <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded-md">
                        <p className="text-xs text-blue-700">Código enviado. Revisa tu correo y haz clic en "Verificar"</p>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setShowEmailModal(true)}
                          className="mt-1 text-xs text-blue-600 hover:text-blue-700"
                        >
                          Confirmar verificación
                        </Button>
                      </div>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="phone" className="text-sm font-medium text-gray-700">Teléfono</Label>
                    <div className="flex items-center gap-2 mt-2">
                      <Input
                        id="phone"
                        value={profileData.phone}
                        onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                        placeholder="+52 33 1234 5678"
                        className="flex-1 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                      />
                      <div className="flex items-center gap-2">
                        {user?.phoneVerified ? (
                          <Badge className="bg-green-100 text-green-700 border-green-200">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Verificado
                          </Badge>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={handleSendPhoneVerification}
                            disabled={verifyingPhone || !profileData.phone}
                            className="text-xs"
                          >
                            {verifyingPhone ? "Enviando..." : phoneVerificationSent ? "Verificar" : "Verificar"}
                          </Button>
                        )}
                      </div>
                    </div>
                    {phoneVerificationSent && !user?.phoneVerified && (
                      <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded-md">
                        <p className="text-xs text-blue-700">Código enviado. Revisa tu teléfono y haz clic en "Verificar"</p>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setShowPhoneModal(true)}
                          className="mt-1 text-xs text-blue-600 hover:text-blue-700"
                        >
                          Confirmar verificación
                        </Button>
                      </div>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="bio" className="text-sm font-medium text-gray-700">Biografía</Label>
                    <Textarea
                      id="bio"
                      value={profileData.bio}
                      onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                      placeholder="Cuéntanos un poco sobre ti..."
                      className="mt-2 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                      rows={3}
                    />
                  </div>

                  <Separator />

                  <div>
                    <Label className="text-sm font-medium text-gray-700 flex items-center gap-2 mb-3">
                      <MapPin className="h-4 w-4 text-blue-500" />
                      Ubicación
                    </Label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="city" className="text-xs text-gray-600">Ciudad</Label>
                        <Input
                          id="city"
                          value={profileData.city}
                          onChange={(e) => setProfileData({ ...profileData, city: e.target.value })}
                          placeholder="Guadalajara"
                          className="mt-1 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <Label htmlFor="state" className="text-xs text-gray-600">Estado</Label>
                        <Input
                          id="state"
                          value={profileData.state}
                          onChange={(e) => setProfileData({ ...profileData, state: e.target.value })}
                          placeholder="Jalisco"
                          className="mt-1 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <Label htmlFor="country" className="text-xs text-gray-600">País</Label>
                        <Input
                          id="country"
                          value={profileData.country}
                          onChange={(e) => setProfileData({ ...profileData, country: e.target.value })}
                          placeholder="México"
                          className="mt-1 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end pt-4">
                    <Button 
                      onClick={handleSaveProfile}
                      disabled={saving}
                      className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-200 group"
                    >
                      <Save className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform" />
                      {saving ? "Guardando..." : "Guardar Cambios"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          {/* Contenido de Notificaciones */}
          <TabsContent value="notificaciones" className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 border-b border-blue-100">
                  <CardTitle className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <BellIcon className="h-5 w-5 text-blue-500" />
                    Configuración de Notificaciones
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-sm font-medium text-gray-700">Notificaciones por correo</Label>
                        <p className="text-xs text-gray-500">Recibe actualizaciones importantes por email</p>
                      </div>
                      <Switch
                        checked={notificationSettings.emailNotifications}
                        onCheckedChange={(checked) => setNotificationSettings({ ...notificationSettings, emailNotifications: checked })}
                      />
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-sm font-medium text-gray-700">Notificaciones push</Label>
                        <p className="text-xs text-gray-500">Recibe notificaciones en tiempo real</p>
                      </div>
                      <Switch
                        checked={notificationSettings.pushNotifications}
                        onCheckedChange={(checked) => setNotificationSettings({ ...notificationSettings, pushNotifications: checked })}
                      />
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-sm font-medium text-gray-700">Recordatorios de eventos</Label>
                        <p className="text-xs text-gray-500">Recibe recordatorios antes de tus eventos</p>
                      </div>
                      <Switch
                        checked={notificationSettings.eventReminders}
                        onCheckedChange={(checked) => setNotificationSettings({ ...notificationSettings, eventReminders: checked })}
                      />
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-sm font-medium text-gray-700">Nuevos eventos</Label>
                        <p className="text-xs text-gray-500">Notificaciones sobre nuevos eventos en tu área</p>
                      </div>
                      <Switch
                        checked={notificationSettings.newEventAlerts}
                        onCheckedChange={(checked) => setNotificationSettings({ ...notificationSettings, newEventAlerts: checked })}
                      />
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-sm font-medium text-gray-700">Actualizaciones de aplicaciones</Label>
                        <p className="text-xs text-gray-500">Estado de tus postulaciones a eventos</p>
                      </div>
                      <Switch
                        checked={notificationSettings.applicationUpdates}
                        onCheckedChange={(checked) => setNotificationSettings({ ...notificationSettings, applicationUpdates: checked })}
                      />
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-sm font-medium text-gray-700">Actualizaciones de la comunidad</Label>
                        <p className="text-xs text-gray-500">Noticias y actualizaciones de VolunNet</p>
                      </div>
                      <Switch
                        checked={notificationSettings.communityUpdates}
                        onCheckedChange={(checked) => setNotificationSettings({ ...notificationSettings, communityUpdates: checked })}
                      />
                    </div>
                  </div>

                  <div className="flex justify-end pt-4">
                    <Button 
                      onClick={handleSaveNotifications}
                      disabled={saving}
                      className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-200 group"
                    >
                      <Save className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform" />
                      {saving ? "Guardando..." : "Guardar Configuración"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          {/* Contenido de Privacidad */}
          <TabsContent value="privacidad" className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 border-b border-blue-100">
                  <CardTitle className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <Shield className="h-5 w-5 text-blue-500" />
                    Configuración de Privacidad
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Visibilidad del perfil</Label>
                    <Select 
                      value={privacySettings.profileVisibility} 
                      onValueChange={(value: 'public' | 'private' | 'friends') => setPrivacySettings({ ...privacySettings, profileVisibility: value })}
                    >
                      <SelectTrigger className="mt-2 border-gray-200 focus:border-blue-500 focus:ring-blue-500">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="public">
                          <div className="flex items-center gap-2">
                            <Globe className="h-4 w-4" />
                            <span>Público</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="friends">
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4" />
                            <span>Solo amigos</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="private">
                          <div className="flex items-center gap-2">
                            <Lock className="h-4 w-4" />
                            <span>Privado</span>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-sm font-medium text-gray-700">Mostrar correo electrónico</Label>
                        <p className="text-xs text-gray-500">Permitir que otros usuarios vean tu email</p>
                      </div>
                      <Switch
                        checked={privacySettings.showEmail}
                        onCheckedChange={(checked) => setPrivacySettings({ ...privacySettings, showEmail: checked })}
                      />
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-sm font-medium text-gray-700">Mostrar teléfono</Label>
                        <p className="text-xs text-gray-500">Permitir que otros usuarios vean tu teléfono</p>
                      </div>
                      <Switch
                        checked={privacySettings.showPhone}
                        onCheckedChange={(checked) => setPrivacySettings({ ...privacySettings, showPhone: checked })}
                      />
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-sm font-medium text-gray-700">Mostrar ubicación</Label>
                        <p className="text-xs text-gray-500">Mostrar tu ciudad y estado en el perfil</p>
                      </div>
                      <Switch
                        checked={privacySettings.showLocation}
                        onCheckedChange={(checked) => setPrivacySettings({ ...privacySettings, showLocation: checked })}
                      />
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-sm font-medium text-gray-700">Permitir mensajes</Label>
                        <p className="text-xs text-gray-500">Recibir mensajes de otros usuarios</p>
                      </div>
                      <Switch
                        checked={privacySettings.allowMessages}
                        onCheckedChange={(checked) => setPrivacySettings({ ...privacySettings, allowMessages: checked })}
                      />
                    </div>
                  </div>

                  <div className="flex justify-end pt-4">
                    <Button 
                      onClick={handleSavePrivacy}
                      disabled={saving}
                      className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-200 group"
                    >
                      <Save className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform" />
                      {saving ? "Guardando..." : "Guardar Configuración"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          {/* Contenido de Seguridad */}
          <TabsContent value="seguridad" className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 border-b border-blue-100">
                  <CardTitle className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <Lock className="h-5 w-5 text-blue-500" />
                    Seguridad de la Cuenta
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  {/* Cambiar contraseña */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900">Cambiar Contraseña</h3>
                    
                    <div>
                      <Label htmlFor="currentPassword" className="text-sm font-medium text-gray-700">Contraseña actual</Label>
                      <div className="relative mt-2">
                        <Input
                          id="currentPassword"
                          type={showPassword ? "text" : "password"}
                          value={passwordData.currentPassword}
                          onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                          className="border-gray-200 focus:border-blue-500 focus:ring-blue-500 pr-10"
                        />
                        <button
                          type="button"
                          className="absolute inset-y-0 right-0 pr-3 flex items-center"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4 text-gray-400" />
                          ) : (
                            <Eye className="h-4 w-4 text-gray-400" />
                          )}
                        </button>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="newPassword" className="text-sm font-medium text-gray-700">Nueva contraseña</Label>
                      <Input
                        id="newPassword"
                        type="password"
                        value={passwordData.newPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                        className="mt-2 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">Confirmar nueva contraseña</Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        value={passwordData.confirmPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                        className="mt-2 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>

                    <Button 
                      onClick={handleChangePassword}
                      disabled={saving}
                      className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-200 group"
                    >
                      <Lock className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform" />
                      {saving ? "Cambiando..." : "Cambiar Contraseña"}
                    </Button>
                  </div>

                  <Separator />

                  {/* Eliminar cuenta */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-red-600">Zona de Peligro</h3>
                    
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <Trash2 className="h-5 w-5 text-red-500 mt-0.5" />
                        <div>
                          <h4 className="font-medium text-red-800">Eliminar cuenta</h4>
                          <p className="text-sm text-red-600 mt-1">
                            Una vez que elimines tu cuenta, no hay vuelta atrás. Por favor, ten cuidado.
                          </p>
                          <Button 
                            variant="destructive"
                            onClick={handleDeleteAccount}
                            disabled={saving}
                            className="mt-3 hover:bg-red-700"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            {saving ? "Eliminando..." : "Eliminar mi cuenta"}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>
        </Tabs>

        {/* Modales de verificación */}
        <VerificationModal
          isOpen={showEmailModal}
          onClose={() => setShowEmailModal(false)}
          onVerify={handleVerifyEmail}
          type="email"
          isLoading={verifyingEmail}
        />

        <VerificationModal
          isOpen={showPhoneModal}
          onClose={() => setShowPhoneModal(false)}
          onVerify={handleVerifyPhone}
          type="phone"
          isLoading={verifyingPhone}
        />
      </div>
    </div>
  )
} 