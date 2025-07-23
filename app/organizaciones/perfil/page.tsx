"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Star, Building, Edit, Lock } from "lucide-react"
import { Button } from "@/components/ui/button"

const mockOrg = {
  name: "Nova Corp S.A. de C.V.",
  email: "contacto@novacorp.com",
  description: "Organización dedicada a la innovación social y el desarrollo comunitario.",
  focusAreas: ["Educación", "Tecnología", "Salud"],
  events: 8,
  volunteers: 32,
  rating: 4.8,
}

export default function PerfilOrganizacion() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <Card className="max-w-md w-full mx-auto bg-white/90 shadow-2xl rounded-3xl">
        <CardHeader className="flex flex-col items-center">
          <div className="h-24 w-24 rounded-full bg-gradient-to-tr from-blue-100 to-purple-100 border-4 border-white shadow-lg flex items-center justify-center text-4xl text-purple-600 font-bold mb-2">
            <Building className="h-12 w-12" />
          </div>
          <CardTitle className="text-2xl font-bold text-center mb-1">{mockOrg.name}</CardTitle>
          <div className="text-xs text-gray-500 mb-2">{mockOrg.email}</div>
          <div className="flex gap-1 mb-2 mt-1">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className={`h-5 w-5 ${i < Math.round(mockOrg.rating) ? 'text-yellow-400 fill-yellow-300' : 'text-gray-300'}`} />
            ))}
            <span className="ml-1 text-yellow-500 font-semibold text-sm">{mockOrg.rating}</span>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col gap-6 items-center">
          <div className="text-center text-gray-700 text-sm mb-2">{mockOrg.description}</div>
          <div className="flex flex-wrap gap-2 justify-center mb-2">
            {mockOrg.focusAreas.map(area => (
              <span key={area} className="px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-semibold">{area}</span>
            ))}
          </div>
          <div className="flex gap-8 justify-center w-full">
            <div className="flex flex-col items-center">
              <span className="font-bold text-blue-700 text-lg">{mockOrg.events}</span>
              <span className="text-xs text-gray-500">Eventos</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="font-bold text-green-600 text-lg">{mockOrg.volunteers}</span>
              <span className="text-xs text-gray-500">Voluntarios</span>
            </div>
          </div>
          <div className="flex gap-3 w-full justify-center mt-2">
            <Button variant="outline" className="flex items-center gap-2"><Edit className="h-4 w-4" /> Editar perfil</Button>
            <Button variant="outline" className="flex items-center gap-2"><Lock className="h-4 w-4" /> Cambiar contraseña</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 