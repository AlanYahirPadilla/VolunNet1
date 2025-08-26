"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Calendar, Heart, Shield, Zap, Globe, Menu, X } from "lucide-react"
import Link from "next/link"
import { useState, useEffect } from "react"
import { motion } from "framer-motion"

export default function HomePage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 overflow-hidden">
      {/* Header */}
      <header
        className={`fixed w-full z-50 transition-all duration-300 ${mounted && scrolled ? "bg-white/90 backdrop-blur-md shadow-md" : "bg-transparent"}`}
      >
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <button
              className="flex items-center gap-2 focus:outline-none"
              style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
              title="Ir al inicio"
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            >
              <Heart className="h-8 w-8 text-blue-600 fill-blue-200" />
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">VolunNet</span>
            </button>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            {["Eventos", "Organizaciones", "Acerca de"].map((item, index) => (
              <motion.div
                key={item}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.05 }}
              >
                <Link
                  href={`/${item.toLowerCase().replace(" ", "-")}`}
                  className="text-gray-700 hover:text-blue-600 transition-colors relative group"
                >
                  {item}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-600 transition-all duration-300 group-hover:w-full"></span>
                </Link>
              </motion.div>
            ))}
          </nav>

          <div className="hidden md:flex space-x-3">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button variant="outline" className="rounded-full px-6" asChild>
                <Link href="/login">Iniciar Sesión</Link>
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                className="rounded-full px-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 border-0"
                asChild
              >
                <Link href="/registro">Registrarse</Link>
              </Button>
            </motion.div>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label={isMenuOpen ? "Cerrar menú" : "Abrir menú"}
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-t"
          >
            <div className="container mx-auto px-4 py-4 flex flex-col space-y-4">
              {["Eventos", "Organizaciones", "Acerca de"].map((item) => (
                <Link
                  key={item}
                  href={`/${item.toLowerCase().replace(" ", "-")}`}
                  className="text-gray-700 hover:text-blue-600 transition-colors py-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item}
                </Link>
              ))}
              <div className="flex flex-col space-y-2 pt-2 border-t">
                <Button variant="outline" className="w-full" asChild>
                  <Link href="/login">Iniciar Sesión</Link>
                </Button>
                <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600" asChild>
                  <Link href="/registro">Registrarse</Link>
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </header>

      {/* Hero Section with Animated Shapes */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        {/* Animated Background Shapes */}
        <div className="absolute inset-0 overflow-hidden -z-10">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-300/20 rounded-full blur-3xl animate-blob"></div>
          <div className="absolute top-1/3 right-1/4 w-80 h-80 bg-purple-300/20 rounded-full blur-3xl animate-blob animation-delay-2000"></div>
          <div className="absolute bottom-1/4 left-1/3 w-72 h-72 bg-pink-300/20 rounded-full blur-3xl animate-blob animation-delay-4000"></div>
        </div>

        <div className="container mx-auto px-4 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="max-w-4xl mx-auto"
          >
            <h2 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              Conecta con Causas que
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {" "}
                Importan
              </span>
            </h2>
            <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
              VolunNet es la plataforma que conecta voluntarios con organizaciones, utilizando IA para recomendaciones
              personalizadas y tecnología distribuida para una experiencia óptima.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  size="lg"
                  className="text-lg px-8 py-6 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg shadow-blue-500/20"
                  asChild
                >
                  <Link href="/registro">Comenzar como Voluntario</Link>
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  size="lg"
                  variant="outline"
                  className="text-lg px-8 py-6 rounded-full border-2 hover:bg-blue-50 transition-colors"
                  asChild
                >
                  <Link href="/organizaciones/registro">Registrar Organización</Link>
                </Button>
              </motion.div>
            </div>
          </motion.div>

          {/* Floating Illustration */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="mt-16 relative"
          >
            <div className="relative mx-auto max-w-4xl">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10 rounded-3xl transform rotate-1"></div>
              <div className="relative bg-white/80 backdrop-blur-sm shadow-xl rounded-3xl p-4 border border-white/50 overflow-hidden">
                <img
                  src="/placeholder.svg?height=500&width=900"
                  alt="VolunNet Dashboard Preview"
                  className="w-full h-auto rounded-2xl shadow-inner"
                />
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-t from-black/20 to-transparent rounded-2xl"></div>
              </div>

              {/* Floating Elements */}
              <motion.div
                initial={{ x: -20, y: -10 }}
                animate={{ x: 0, y: 0 }}
                transition={{
                  repeat: Number.POSITIVE_INFINITY,
                  repeatType: "reverse",
                  duration: 2,
                }}
                className="absolute -top-8 -left-8 bg-white rounded-2xl shadow-lg p-3"
              >
                <Heart className="h-8 w-8 text-red-500" />
              </motion.div>

              <motion.div
                initial={{ x: 20, y: 10 }}
                animate={{ x: 0, y: 0 }}
                transition={{
                  repeat: Number.POSITIVE_INFINITY,
                  repeatType: "reverse",
                  duration: 2.5,
                }}
                className="absolute -bottom-6 -right-6 bg-white rounded-2xl shadow-lg p-3"
              >
                <Calendar className="h-8 w-8 text-blue-500" />
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-50/50 to-transparent -z-10"></div>

        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <h3 className="text-3xl font-bold text-gray-900 mb-4">Características Principales</h3>
            <div className="w-24 h-1 bg-gradient-to-r from-blue-600 to-purple-600 mx-auto rounded-full"></div>
          </motion.div>

          <motion.div
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {[
              {
                icon: <Users className="h-12 w-12 text-blue-600" />,
                title: "Recomendaciones IA",
                description:
                  "Algoritmos de Machine Learning (KNN, Random Forest) para recomendaciones personalizadas basadas en tus intereses y ubicación.",
              },
              {
                icon: <Calendar className="h-12 w-12 text-green-600" />,
                title: "Gestión de Eventos",
                description:
                  "Publica, descubre y participa en eventos de voluntariado con notificaciones en tiempo real y seguimiento completo.",
              },
              {
                icon: <Shield className="h-12 w-12 text-purple-600" />,
                title: "Seguridad OWASP",
                description:
                  "Implementación de estándares OWASP e ISO/IEC 25010 para garantizar la seguridad y calidad del software.",
              },
              {
                icon: <Zap className="h-12 w-12 text-yellow-600" />,
                title: "Tiempo Real",
                description:
                  "Notificaciones instantáneas con WebSockets y actualizaciones en tiempo real de eventos y mensajes.",
              },
              {
                icon: <Globe className="h-12 w-12 text-indigo-600" />,
                title: "Arquitectura Distribuida",
                description:
                  "Microservicios escalables con balanceo de carga y despliegue en la nube para máximo rendimiento.",
              },
              {
                icon: <Heart className="h-12 w-12 text-red-600" />,
                title: "Impacto Social",
                description:
                  "Métricas de impacto, historial de participación y reconocimientos para medir tu contribución social.",
              },
            ].map((feature, index) => (
              <motion.div key={index} variants={item}>
                <Card className="border-0 bg-white/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 h-full overflow-hidden group">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 to-purple-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
                  <CardHeader className="text-center pt-8">
                    <motion.div
                      whileHover={{ rotate: [0, -10, 10, -10, 0] }}
                      transition={{ duration: 0.5 }}
                      className="mx-auto mb-4 p-3 rounded-full bg-blue-50 w-20 h-20 flex items-center justify-center"
                    >
                      {feature.icon}
                    </motion.div>
                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-gray-600 text-center">{feature.description}</CardDescription>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 skew-y-3 -z-10"></div>
        <div className="absolute inset-0 bg-blue-900/30 backdrop-blur-sm -z-10"></div>

        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ staggerChildren: 0.1, delayChildren: 0.3 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center"
          >
            {[
              { value: "1,000+", label: "Voluntarios Activos" },
              { value: "500+", label: "Organizaciones" },
              { value: "2,500+", label: "Eventos Realizados" },
              { value: "50,000+", label: "Horas de Voluntariado" },
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white/70 backdrop-blur-md rounded-2xl p-6 border border-white/40 shadow-xl"
              >
                <motion.div
                  initial={{ scale: 0.5 }}
                  whileInView={{ scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ type: "spring", stiffness: 100, delay: 0.2 + index * 0.1 }}
                  className="text-4xl font-bold mb-2 text-gray-900"
                >
                  {stat.value}
                </motion.div>
                <div className="text-gray-700 font-medium">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <h3 className="text-3xl font-bold text-gray-900 mb-4">Testimonios</h3>
            <div className="w-24 h-1 bg-gradient-to-r from-blue-600 to-purple-600 mx-auto rounded-full"></div>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: "María González",
                role: "Voluntaria",
                image: "/placeholder.svg?height=100&width=100",
                quote:
                  "VolunNet me ha permitido encontrar oportunidades de voluntariado que realmente coinciden con mis intereses y disponibilidad. ¡La plataforma es increíblemente intuitiva!",
              },
              {
                name: "Fundación Ayuda",
                role: "Organización",
                image: "/placeholder.svg?height=100&width=100",
                quote:
                  "Desde que usamos VolunNet, hemos aumentado nuestra base de voluntarios en un 200%. La plataforma nos ha ayudado a conectar con personas realmente comprometidas.",
              },
              {
                name: "Carlos Méndez",
                role: "Voluntario",
                image: "/placeholder.svg?height=100&width=100",
                quote:
                  "Las recomendaciones personalizadas son asombrosas. Cada evento sugerido se alinea perfectamente con mis habilidades y los horarios que tengo disponibles.",
              },
            ].map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className="h-full border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-white to-blue-50/50">
                  <CardContent className="p-8 flex flex-col items-center text-center">
                    <div className="mb-6 relative">
                      <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 blur-md"></div>
                      <img
                        src={testimonial.image || "/placeholder.svg"}
                        alt={testimonial.name}
                        className="w-20 h-20 rounded-full object-cover border-4 border-white relative z-10"
                      />
                    </div>
                    <div className="text-gray-600 italic mb-6">"{testimonial.quote}"</div>
                    <div className="mt-auto">
                      <div className="font-semibold text-gray-900">{testimonial.name}</div>
                      <div className="text-sm text-blue-600">{testimonial.role}</div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-100 to-purple-100 -z-10"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200%] aspect-square bg-blue-600/5 rounded-full blur-3xl -z-10"></div>

        <div className="container mx-auto px-4 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="max-w-2xl mx-auto bg-white/80 backdrop-blur-sm rounded-3xl p-10 shadow-xl border border-white/50"
          >
            <h3 className="text-3xl font-bold text-gray-900 mb-6">¿Listo para hacer la diferencia?</h3>
            <p className="text-xl text-gray-600 mb-8">
              Únete a nuestra comunidad y comienza a generar impacto positivo hoy mismo.
            </p>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                size="lg"
                className="text-lg px-10 py-6 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg shadow-blue-500/20"
                asChild
              >
                <Link href="/registro">Comenzar Ahora</Link>
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white pt-20 pb-10 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(59,130,246,0.2),transparent)] -z-10"></div>

        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <div className="flex items-center space-x-2 mb-6">
                <Heart className="h-6 w-6 text-blue-400 fill-blue-900" />
                <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  VolunNet
                </span>
              </div>
              <p className="text-gray-400">
                Conectando voluntarios con causas que importan, impulsado por IA y tecnología distribuida.
              </p>
            </motion.div>

            {[
              {
                title: "Plataforma",
                links: [
                  { name: "Eventos", href: "/eventos" },
                  { name: "Organizaciones", href: "/organizaciones" },
                  { name: "Voluntarios", href: "/voluntarios" },
                ],
              },
              {
                title: "Soporte",
                links: [
                  { name: "Centro de Ayuda", href: "/ayuda" },
                  { name: "Contacto", href: "/contacto" },
                  { name: "Términos", href: "/terminos" },
                ],
              },
              {
                title: "Tecnología",
                items: ["React.js & TypeScript", "Node.js & PostgreSQL", "Machine Learning", "Microservicios"],
              },
            ].map((column, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 * index }}
              >
                <h4 className="font-semibold mb-6 text-lg">{column.title}</h4>
                <ul className="space-y-3">
                  {column.links
                    ? column.links.map((link, i) => (
                        <li key={i}>
                          <Link href={link.href} className="text-gray-400 hover:text-blue-400 transition-colors">
                            {link.name}
                          </Link>
                        </li>
                      ))
                    : column.items?.map((item, i) => (
                        <li key={i} className="text-gray-400">
                          {item}
                        </li>
                      ))}
                </ul>
              </motion.div>
            ))}
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 VolunNet - CUCEI. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
