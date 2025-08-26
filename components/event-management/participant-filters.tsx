import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Filter, X } from "lucide-react"

interface ParticipantFiltersProps {
  onSearch: (query: string) => void
  onFilterStatus: (status: string) => void
  onFilterSkills: (skills: string[]) => void
  onClearFilters: () => void
  availableSkills: string[]
}

export function ParticipantFilters({ 
  onSearch, 
  onFilterStatus, 
  onFilterSkills, 
  onClearFilters,
  availableSkills 
}: ParticipantFiltersProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedStatus, setSelectedStatus] = useState("all")
  const [selectedSkills, setSelectedSkills] = useState<string[]>([])

  const handleSearch = (value: string) => {
    setSearchQuery(value)
    onSearch(value)
  }

  const handleStatusFilter = (status: string) => {
    setSelectedStatus(status)
    onFilterStatus(status)
  }

  const handleSkillFilter = (skill: string) => {
    const newSkills = selectedSkills.includes(skill)
      ? selectedSkills.filter(s => s !== skill)
      : [...selectedSkills, skill]
    
    setSelectedSkills(newSkills)
    onFilterSkills(newSkills)
  }

  const handleClearFilters = () => {
    setSearchQuery("")
    setSelectedStatus("all")
    setSelectedSkills([])
    onClearFilters()
  }

  const hasActiveFilters = searchQuery || selectedStatus !== "all" || selectedSkills.length > 0

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
      <div className="flex items-center gap-2 mb-4">
        <Filter className="w-5 h-5 text-gray-600" />
        <h3 className="font-semibold text-gray-900">Filtros y Búsqueda</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        {/* Búsqueda por nombre/email */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Buscar por nombre o email..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Filtro por estado */}
        <Select value={selectedStatus} onValueChange={handleStatusFilter}>
          <SelectTrigger>
            <SelectValue placeholder="Filtrar por estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los estados</SelectItem>
            <SelectItem value="PENDING">Pendientes</SelectItem>
            <SelectItem value="ACCEPTED">Aceptados</SelectItem>
            <SelectItem value="REJECTED">Rechazados</SelectItem>
            <SelectItem value="COMPLETED">Completados</SelectItem>
          </SelectContent>
        </Select>

        {/* Filtro por habilidades */}
        <Select value="" onValueChange={(value) => value && handleSkillFilter(value)}>
          <SelectTrigger>
            <SelectValue placeholder="Filtrar por habilidades" />
          </SelectTrigger>
          <SelectContent>
            {availableSkills.map((skill) => (
              <SelectItem key={skill} value={skill}>
                {skill}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Habilidades seleccionadas */}
      {selectedSkills.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          <span className="text-sm text-gray-600">Habilidades seleccionadas:</span>
          {selectedSkills.map((skill) => (
            <Button
              key={skill}
              variant="outline"
              size="sm"
              onClick={() => handleSkillFilter(skill)}
              className="h-7 px-2 text-xs"
            >
              {skill}
              <X className="w-3 h-3 ml-1" />
            </Button>
          ))}
        </div>
      )}

      {/* Botón para limpiar filtros */}
      {hasActiveFilters && (
        <div className="flex justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={handleClearFilters}
            className="text-gray-600 hover:text-gray-800"
          >
            <X className="w-4 h-4 mr-2" />
            Limpiar Filtros
          </Button>
        </div>
      )}
    </div>
  )
}


