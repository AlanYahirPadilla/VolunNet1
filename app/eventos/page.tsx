"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import {
  Search,
  MapPin,
  Calendar,
  Users,
  Star,
  Building,
  CheckCircle,
  Heart,
  TrendingUp,
  Loader2,
  SlidersHorizontal,
  X,
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { searchEvents, getEventCategories, getPopularSearches, getSuggestedFilters } from "./actions"
import { useDebounce } from "@/hooks/use-debounce"
import Link from "next/link"
import { AdaptiveLoading } from "@/components/ui/adaptive-loading"

const MEXICAN_STATES = [
  "Aguascalientes",
  "Baja California",
  "Baja California Sur",
  "Campeche",
  "Chiapas",
  "Chihuahua",
  "Coahuila",
  "Colima",
  "Durango",
  "Estado de México",
  "Guanajuato",
  "Guerrero",
  "Hidalgo",
  "Jalisco",
  "Michoacán",
  "Morelos",
  "Nayarit",
  "Nuevo León",
  "Oaxaca",
  "Puebla",
  "Querétaro",
  "Quintana Roo",
  "San Luis Potosí",
  "Sinaloa",
  "Sonora",
  "Tabasco",
  "Tamaulipas",
  "Tlaxcala",
  "Veracruz",
  "Yucatán",
  "Zacatecas",
]

const SORT_OPTIONS = [
  { value: "relevance", label: "Más relevante" },
  { value: "date", label: "Fecha más próxima" },
  { value: "distance", label: "Más cercano" },
  { value: "popularity", label: "Más popular" },
]

export default function EventsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [filters, setFilters] = useState({
    category: "all",
    city: "",
    state: "all",
    dateFrom: "",
    dateTo: "",
    skills: [] as string[],
    maxDistance: 50,
    sortBy: "relevance",
  })
  const [showFilters, setShowFilters] = useState(false)
  const [events, setEvents] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [popularData, setPopularData] = useState<any>({ popularEvents: [], popularCategories: [] })
  const [suggestions, setSuggestions] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(0)
  const [hasMore, setHasMore] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(true)
  const [loadingSteps, setLoadingSteps] = useState([
    { id: "categories", label: "Cargando categorías", status: "loading" as const },
    { id: "popular", label: "Obteniendo datos populares", status: "pending" as const },
    { id: "suggestions", label: "Preparando sugerencias", status: "pending" as const },
  ])

  const debouncedSearchQuery = useDebounce(searchQuery, 300)

  const updateLoadingStep = (stepId: string, status: "loading" | "completed" | "error") => {
    setLoadingSteps((prev) => prev.map((step) => (step.id === stepId ? { ...step, status } : step)))
  }

  // Cargar datos iniciales
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        updateLoadingStep("categories", "loading")
        const categoriesData = await getEventCategories()
        setCategories(categoriesData.categories)
        updateLoadingStep("categories", "completed")

        updateLoadingStep("popular", "loading")
        const popularData = await getPopularSearches()
        setPopularData(popularData)
        updateLoadingStep("popular", "completed")

        updateLoadingStep("suggestions", "loading")
        const suggestionsData = await getSuggestedFilters()
        setSuggestions(suggestionsData.suggestions)
        updateLoadingStep("suggestions", "completed")
      } catch (error) {
        console.error("Error loading initial data:", error)
        setLoadingSteps((prev) => prev.map((step) => (step.status === "loading" ? { ...step, status: "error" } : step)))
      } finally {
        setTimeout(() => setInitialLoading(false), 800)
      }
    }

    loadInitialData()
  }, [])

  // Buscar eventos cuando cambien los filtros o la query
  const searchEventsCallback = useCallback(
    async (resetPage = true) => {
      setLoading(true)
      const currentPage = resetPage ? 1 : page

      try {
        const result = await searchEvents({
          query: debouncedSearchQuery,
          ...filters,
          page: currentPage,
          limit: 12,
        })

        if (resetPage) {
          setEvents(result.events)
          setPage(1)
        } else {
          setEvents((prev) => [...prev, ...result.events])
        }

        setTotalPages(result.totalPages)
        setHasMore(result.hasMore)
        setShowSuggestions(!debouncedSearchQuery && !Object.values(filters).some((v) => v && v !== "all"))
      } catch (error) {
        console.error("Error searching events:", error)
      } finally {
        setLoading(false)
      }
    },
    [debouncedSearchQuery, filters, page],
  )

  useEffect(() => {
    if (!initialLoading) {
      searchEventsCallback(true)
    }
  }, [debouncedSearchQuery, filters, initialLoading])

  const updateFilter = (key: string, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
    setPage(1)
  }

  const clearFilters = () => {
    setFilters({
      category: "all",
      city: "",
      state: "all",
      dateFrom: "",
      dateTo: "",
      skills: [],
      maxDistance: 50,
      sortBy: "relevance",
    })
    setSearchQuery("")
  }

  const loadMore = () => {
    setPage((prev) => prev + 1)
    searchEventsCallback(false)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-ES", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getScoreColor = (score: number) => {
    if (score >= 0.7) return "text-green-600 bg-green-50"
    if (score >= 0.4) return "text-yellow-600 bg-yellow-50"
    return "text-blue-600 bg-blue-50"
  }

  const activeFiltersCount = useMemo(() => {
    return Object.entries(filters).filter(([key, value]) => {
      if (key === "sortBy") return false
      if (Array.isArray(value)) return value.length > 0
      return value && value !== "all" && value !== ""
    }).length
  }, [filters])

  return (
    <AdaptiveLoading type="events" isLoading={initialLoading} loadingSteps={loadingSteps}>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-sm shadow-sm border-b sticky top-0 z-50">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <Heart className="h-8 w-8 text-blue-600 fill-blue-200" />
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  VolunNet
                </h1>
              </div>
              <Link href="/dashboard">
                <Button variant="outline">Volver al Dashboard</Button>
              </Link>
            </div>

            {/* Barra de búsqueda */}
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Buscar eventos, organizaciones o categorías..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 h-12 text-lg"
                />
              </div>
              <Button variant="outline" onClick={() => setShowFilters(!showFilters)} className="h-12 px-6 relative">
                <SlidersHorizontal className="h-4 w-4 mr-2" />
                Filtros
                {activeFiltersCount > 0 && (
                  <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-xs">
                    {activeFiltersCount}
                  </Badge>
                )}
              </Button>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-8">
          <div className="flex gap-8">
            {/* Sidebar de filtros */}
            <AnimatePresence>
              {showFilters && (
                <motion.div
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: 320, opacity: 1 }}
                  exit={{ width: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <Card className="sticky top-24 h-fit">
                    <CardHeader className="pb-4">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">Filtros</CardTitle>
                        <div className="flex items-center space-x-2">
                          <Button variant="ghost" size="sm" onClick={clearFilters}>
                            Limpiar
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => setShowFilters(false)}>
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {/* Ordenar por */}
                      <div>
                        <Label className="text-sm font-medium mb-2 block">Ordenar por</Label>
                        <Select value={filters.sortBy} onValueChange={(value) => updateFilter("sortBy", value)}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {SORT_OPTIONS.map((option) => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Categoría */}
                      <div>
                        <Label className="text-sm font-medium mb-2 block">Categoría</Label>
                        <Select value={filters.category} onValueChange={(value) => updateFilter("category", value)}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">Todas las categorías</SelectItem>
                            {categories.map((category) => (
                              <SelectItem key={category.id} value={category.id}>
                                <div className="flex items-center space-x-2">
                                  <span>{category.icon}</span>
                                  <span>{category.name}</span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Ubicación */}
                      <div className="space-y-3">
                        <Label className="text-sm font-medium">Ubicación</Label>
                        <Input
                          placeholder="Ciudad"
                          value={filters.city}
                          onChange={(e) => updateFilter("city", e.target.value)}
                        />
                        <Select value={filters.state} onValueChange={(value) => updateFilter("state", value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Estado" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">Todos los estados</SelectItem>
                            {MEXICAN_STATES.map((state) => (
                              <SelectItem key={state} value={state}>
                                {state}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Fechas */}
                      <div className="space-y-3">
                        <Label className="text-sm font-medium">Fechas</Label>
                        <div className="space-y-2">
                          <Input
                            type="date"
                            placeholder="Desde"
                            value={filters.dateFrom}
                            onChange={(e) => updateFilter("dateFrom", e.target.value)}
                          />
                          <Input
                            type="date"
                            placeholder="Hasta"
                            value={filters.dateTo}
                            onChange={(e) => updateFilter("dateTo", e.target.value)}
                          />
                        </div>
                      </div>

                      {/* Distancia máxima */}
                      <div>
                        <Label className="text-sm font-medium mb-2 block">
                          Distancia máxima: {filters.maxDistance} km
                        </Label>
                        <input
                          type="range"
                          min="5"
                          max="100"
                          step="5"
                          value={filters.maxDistance}
                          onChange={(e) => updateFilter("maxDistance", Number.parseInt(e.target.value))}
                          className="w-full"
                        />
                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                          <span>5 km</span>
                          <span>100 km</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Contenido principal */}
            <div className="flex-1">
              {/* Sugerencias */}
              {showSuggestions && !loading && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Descubre eventos para ti</h2>

                  {/* Búsquedas populares */}
                  {popularData.popularEvents.length > 0 && (
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                        <TrendingUp className="h-5 w-5 mr-2 text-green-500" />
                        Búsquedas populares
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {popularData.popularEvents.slice(0, 6).map((search: string, index: number) => (
                          <Button
                            key={index}
                            variant="outline"
                            size="sm"
                            onClick={() => setSearchQuery(search)}
                            className="rounded-full"
                          >
                            {search}
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Categorías populares */}
                  {popularData.popularCategories.length > 0 && (
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold text-gray-800 mb-3">Categorías populares</h3>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {popularData.popularCategories.map((category: any) => (
                          <Card
                            key={category.name}
                            className="cursor-pointer hover:shadow-md transition-shadow"
                            onClick={() => updateFilter("category", category.name)}
                          >
                            <CardContent className="p-4 text-center">
                              <div className="text-3xl mb-2">{category.icon}</div>
                              <h4 className="font-medium text-sm">{category.name}</h4>
                              <p className="text-xs text-gray-500">{category.event_count} eventos</p>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Sugerencias personalizadas */}
                  {suggestions.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                        <Star className="h-5 w-5 mr-2 text-yellow-500" />
                        Sugerencias para ti
                      </h3>
                      <div className="space-y-4">
                        {suggestions.map((suggestion: any, index: number) => (
                          <Card key={index} className="p-4">
                            <h4 className="font-medium mb-2">{suggestion.label}</h4>
                            <div className="flex flex-wrap gap-2">
                              {suggestion.type === "category" &&
                                suggestion.items.map((item: any) => (
                                  <Button
                                    key={item.id}
                                    variant="outline"
                                    size="sm"
                                    onClick={() => updateFilter("category", item.id)}
                                    className="rounded-full"
                                  >
                                    <span className="mr-1">{item.icon}</span>
                                    {item.name}
                                  </Button>
                                ))}
                              {suggestion.type === "location" &&
                                suggestion.items.map((item: any, idx: number) => (
                                  <Button
                                    key={idx}
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      updateFilter("city", item.city)
                                      updateFilter("state", item.state)
                                    }}
                                    className="rounded-full"
                                  >
                                    <MapPin className="h-3 w-3 mr-1" />
                                    {item.city}, {item.state}
                                  </Button>
                                ))}
                            </div>
                          </Card>
                        ))}
                      </div>
                    </div>
                  )}
                </motion.div>
              )}

              {/* Resultados */}
              {(searchQuery || !showSuggestions) && (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">
                      {searchQuery ? `Resultados para "${searchQuery}"` : "Todos los eventos"}
                    </h2>
                    {loading && <Loader2 className="h-5 w-5 animate-spin text-blue-600" />}
                  </div>

                  {events.length > 0 ? (
                    <div className="space-y-6">
                      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {events.map((event, index) => (
                          <motion.div
                            key={event.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                          >
                            <Card className="h-full hover:shadow-lg transition-all duration-300 hover:-translate-y-1 overflow-hidden group">
                              <div className="relative">
                                <div className="h-48 bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
                                  <span className="text-6xl">{event.category_icon}</span>
                                </div>
                                {event.recommendation_score > 0 && (
                                  <Badge
                                    className={`absolute top-3 right-3 ${getScoreColor(event.recommendation_score)} border-0`}
                                  >
                                    {Math.round(event.recommendation_score * 100)}% match
                                  </Badge>
                                )}
                              </div>

                              <CardContent className="p-6">
                                <div className="mb-3">
                                  <h3 className="font-bold text-lg mb-2 line-clamp-2">{event.title}</h3>
                                  <div className="flex items-center text-sm text-gray-600 mb-2">
                                    <Building className="h-4 w-4 mr-1" />
                                    {event.organization_name}
                                    {event.organization_verified && (
                                      <CheckCircle className="h-4 w-4 ml-1 text-green-500" />
                                    )}
                                  </div>
                                </div>

                                <div className="space-y-2 mb-4">
                                  <div className="flex items-center text-sm text-gray-600">
                                    <MapPin className="h-4 w-4 mr-2" />
                                    {event.city}, {event.state}
                                    {event.distance && ` (${Math.round(event.distance)} km)`}
                                  </div>
                                  <div className="flex items-center text-sm text-gray-600">
                                    <Calendar className="h-4 w-4 mr-2" />
                                    {formatDate(event.start_date)}
                                  </div>
                                  <div className="flex items-center text-sm text-gray-600">
                                    <Users className="h-4 w-4 mr-2" />
                                    {event.current_volunteers}/{event.max_volunteers} voluntarios
                                  </div>
                                </div>

                                <p className="text-sm text-gray-700 mb-4 line-clamp-3">{event.description}</p>

                                {event.recommendation_reasons.length > 0 && (
                                  <div className="mb-4">
                                    <div className="flex flex-wrap gap-1">
                                      {event.recommendation_reasons.slice(0, 2).map((reason: string, idx: number) => (
                                        <Badge key={idx} variant="secondary" className="text-xs">
                                          {reason}
                                        </Badge>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                <div className="flex justify-between items-center">
                                  <Badge variant="outline" className="flex items-center">
                                    <span className="mr-1">{event.category_icon}</span>
                                    {event.category_name}
                                  </Badge>
                                  <Button size="sm" asChild>
                                    <Link href={`/eventos/${event.id}`}>Ver Detalles</Link>
                                  </Button>
                                </div>
                              </CardContent>
                            </Card>
                          </motion.div>
                        ))}
                      </div>

                      {/* Cargar más */}
                      {hasMore && (
                        <div className="text-center pt-8">
                          <Button onClick={loadMore} disabled={loading} size="lg" variant="outline">
                            {loading ? (
                              <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Cargando...
                              </>
                            ) : (
                              "Cargar más eventos"
                            )}
                          </Button>
                        </div>
                      )}
                    </div>
                  ) : !loading ? (
                    <div className="text-center py-12">
                      <div className="text-gray-400 mb-4">
                        <Search className="h-16 w-16 mx-auto" />
                      </div>
                      <h3 className="text-xl font-semibold text-gray-600 mb-2">No se encontraron eventos</h3>
                      <p className="text-gray-500 mb-6">Intenta ajustar tus filtros o buscar con términos diferentes</p>
                      <Button onClick={clearFilters} variant="outline">
                        Limpiar filtros
                      </Button>
                    </div>
                  ) : null}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AdaptiveLoading>
  )
}
