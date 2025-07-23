"use client"
import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Settings } from "lucide-react"
import { getCurrentUser } from "@/app/auth/actions"
import Link from "next/link"

export default function ConfiguracionOrganizacion() {
  const [organizationName, setOrganizationName] = useState("Organización")
  const [organizationEmail, setOrganizationEmail] = useState("")
  useEffect(() => {
    (async () => {
      const user = await getCurrentUser()
      if (user?.firstName) setOrganizationName(user.firstName)
      if (user?.email) setOrganizationEmail(user.email)
    })()
  }, [])
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <Card className="max-w-md w-full mx-auto bg-white/90 shadow-2xl rounded-3xl">
        <CardHeader className="flex flex-col items-center">
          <Settings className="h-12 w-12 text-blue-500 mb-2" />
          <CardTitle className="text-2xl font-bold text-center">Configuración de la Organización</CardTitle>
          <div className="text-lg font-bold text-gray-900 text-center mt-2">{organizationName}</div>
          <div className="text-xs text-gray-500 mb-2">{organizationEmail}</div>
        </CardHeader>
        <CardContent className="text-center text-gray-600 py-6">
          Próximamente podrás configurar las opciones de tu organización aquí.
          <div className="mt-6">
            <Link href="/organizaciones/dashboard" className="inline-block px-6 py-2 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold shadow hover:from-blue-700 hover:to-purple-700 transition-all">Regresar al Dashboard</Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 