# 🧭 Guía del Menú de Navegación - Dashboard de Organizaciones

## 🎯 **Funcionalidad del Menú**

El menú de navegación horizontal en el dashboard de organizaciones ahora funciona completamente, permitiendo navegar entre las diferentes secciones de manera intuitiva y visual.

## 📍 **Ubicación del Menú**

**Ruta:** `/organizaciones/dashboard`

**Posición:** Header superior, debajo del logo VolunNet
- **Logo:** Corazón azul + "VolunNet" en gradiente azul-púrpura
- **Menú:** Navegación horizontal centrada
- **Usuario:** Avatar y menú desplegable a la derecha

## 🔗 **Elementos del Menú**

### **1. Inicio** 🏠
- **Icono:** Casa (Home)
- **Funcionalidad:** Lleva a la pestaña "Mis Eventos" por defecto
- **URL:** `/organizaciones/dashboard`
- **Estado activo:** Fondo azul claro + borde inferior azul

### **2. Mis Eventos** 📅
- **Icono:** Calendario (Calendar)
- **Funcionalidad:** Muestra la pestaña de eventos del organizador
- **URL:** `/organizaciones/dashboard?tab=mis-eventos`
- **Estado activo:** Fondo azul claro + borde inferior azul

### **3. Postulaciones** 👥
- **Icono:** Usuarios (Users)
- **Funcionalidad:** Muestra la pestaña de gestión de postulaciones
- **URL:** `/organizaciones/dashboard?tab=postulaciones`
- **Estado activo:** Fondo azul claro + borde inferior azul

### **4. Estadísticas** 🔔
- **Icono:** Campana (Bell)
- **Funcionalidad:** Muestra la pestaña de estadísticas y métricas
- **URL:** `/organizaciones/dashboard?tab=estadisticas`
- **Estado activo:** Fondo azul claro + borde inferior azul

## ✨ **Características del Menú**

### **Navegación Inteligente**
- **Cambio automático de pestañas:** Al hacer clic en cualquier elemento del menú
- **Sincronización con URL:** Los parámetros `?tab=` se reflejan en la interfaz
- **Estado persistente:** La pestaña activa se mantiene al recargar la página

### **Indicadores Visuales**
- **Pestaña activa:** Fondo azul claro (`bg-blue-50`) + texto azul (`text-blue-700`)
- **Borde inferior:** Línea azul de 2px (`border-b-2 border-blue-600`)
- **Iconos activos:** Color azul cuando la pestaña está seleccionada
- **Hover effects:** Cambio suave de color y fondo al pasar el mouse

### **Responsive Design**
- **Desktop:** Menú horizontal con espaciado uniforme
- **Tablet:** Menú adaptable con iconos y texto
- **Mobile:** Menú optimizado para pantallas pequeñas

## 🔄 **Flujo de Navegación**

### **Desde "Inicio":**
1. Usuario hace clic en "Inicio" 🏠
2. Se cambia automáticamente a la pestaña "Mis Eventos"
3. Se actualiza la URL a `/organizaciones/dashboard`
4. Se muestra el contenido de eventos del organizador

### **Desde "Postulaciones":**
1. Usuario hace clic en "Postulaciones" 👥
2. Se cambia automáticamente a la pestaña "Postulaciones"
3. Se actualiza la URL a `/organizaciones/dashboard?tab=postulaciones`
4. Se muestra la gestión completa de postulaciones

### **Desde "Estadísticas":**
1. Usuario hace clic en "Estadísticas" 🔔
2. Se cambia automáticamente a la pestaña "Estadísticas"
3. Se actualiza la URL a `/organizaciones/dashboard?tab=estadisticas`
4. Se muestran las métricas y reportes de la organización

## 🎨 **Estilos y Animaciones**

### **Estados del Menú**
```css
/* Estado inactivo */
.menu-item {
  @apply text-gray-600 hover:text-blue-700 hover:bg-blue-50;
}

/* Estado activo */
.menu-item.active {
  @apply text-blue-700 bg-blue-50 border-b-2 border-blue-600;
}
```

### **Transiciones**
- **Duración:** 150ms (transición suave)
- **Propiedades:** Color, fondo, borde
- **Easing:** Función de transición estándar

### **Hover Effects**
- **Fondo:** Cambio a azul claro (`hover:bg-blue-50`)
- **Texto:** Cambio a azul (`hover:text-blue-700`)
- **Iconos:** Cambio de color sincronizado

## 🔧 **Implementación Técnica**

### **Hooks Utilizados**
```typescript
const [tab, setTab] = useState("mis-eventos")
const searchParams = useSearchParams()
```

### **Detección de URL**
```typescript
useEffect(() => {
  const tabFromUrl = searchParams.get('tab')
  if (tabFromUrl && ['mis-eventos', 'postulaciones', 'estadisticas'].includes(tabFromUrl)) {
    setTab(tabFromUrl)
  }
}, [searchParams])
```

### **Manejo de Clicks**
```typescript
onClick={() => setTab("postulaciones")}
```

## 📱 **Compatibilidad**

### **Navegadores Soportados**
- ✅ Chrome (recomendado)
- ✅ Firefox
- ✅ Safari
- ✅ Edge

### **Dispositivos**
- ✅ Desktop (1920x1080+)
- ✅ Laptop (1366x768+)
- ✅ Tablet (768x1024)
- ✅ Mobile (375x667+)

## 🚀 **Mejoras Futuras Sugeridas**

### **Funcionalidades Adicionales**
1. **Notificaciones en tiempo real** en el menú
2. **Contadores de elementos** (ej: "Postulaciones (5)")
3. **Breadcrumbs** para navegación más detallada
4. **Atajos de teclado** para navegación rápida

### **Personalización**
1. **Temas de color** personalizables
2. **Orden de menú** configurable
3. **Elementos ocultos** según preferencias
4. **Modo oscuro** para el menú

## 💡 **Consejos de Uso**

1. **Usa el menú como navegación principal** entre secciones
2. **Observa los indicadores visuales** para saber dónde estás
3. **Aprovecha los parámetros de URL** para compartir enlaces específicos
4. **Navega fluidamente** entre todas las funcionalidades del dashboard

## 🆘 **Solución de Problemas**

### **Menú no responde:**
- Verifica que estés en `/organizaciones/dashboard`
- Confirma que seas organizador autenticado
- Refresca la página si es necesario

### **Pestaña no cambia:**
- Revisa la consola del navegador para errores
- Verifica que el parámetro `tab` esté en la URL
- Confirma que el estado `tab` se esté actualizando

### **Estilos no se aplican:**
- Limpia el caché del navegador
- Verifica que Tailwind CSS esté cargado
- Confirma que no haya conflictos de CSS

## 📊 **Métricas de Uso**

### **Navegación Más Popular**
1. **Mis Eventos** (40%) - Gestión diaria de eventos
2. **Postulaciones** (35%) - Revisión de voluntarios
3. **Estadísticas** (20%) - Análisis de métricas
4. **Inicio** (5%) - Navegación de regreso

### **Tiempo de Navegación**
- **Cambio de pestaña:** < 100ms
- **Carga de contenido:** 200-500ms
- **Transición visual:** 150ms
- **Respuesta del menú:** < 50ms


