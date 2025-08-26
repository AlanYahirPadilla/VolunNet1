# 🚀 Acceso a la Gestión de Eventos para Organizadores

## 📍 **Ubicaciones del Botón "Gestionar"**

### **1. Dashboard Principal de la Organización**
**Ruta:** `/organizaciones/dashboard`

**Pestaña "Mis Eventos":**
- Cada evento que tenga postulaciones muestra un botón **"Gestionar"** verde
- El botón solo aparece cuando `currentVolunteers > 0`
- Ubicación: A la derecha de "Ver Detalles" y "Editar"

**Pestaña "Postulaciones":**
- Vista completa de todos los eventos con botones de gestión
- Botón **"Gestionar"** prominente para cada evento con postulaciones
- Botón **"Ver Todos los Eventos"** en el header

### **2. Página de Detalles del Evento**
**Ruta:** `/eventos/[id]`

**Ubicación:** Sidebar derecho, debajo del botón de postulación
- Solo visible para organizadores dueños del evento
- Botón **"Gestionar Evento"** con icono de usuarios
- Descripción: "Ver participantes y gestionar aplicaciones"

## 🎯 **Flujo de Acceso Recomendado**

### **Opción 1: Desde el Dashboard (Recomendado)**
1. Ir a `/organizaciones/dashboard`
2. Cambiar a la pestaña **"Postulaciones"**
3. Ver todos los eventos con postulaciones pendientes
4. Hacer clic en **"Gestionar"** para el evento deseado

### **Opción 2: Desde Mis Eventos**
1. Ir a `/organizaciones/dashboard`
2. Pestaña **"Mis Eventos"**
3. Buscar eventos con indicador azul de postulaciones pendientes
4. Hacer clic en **"Gestionar"**

### **Opción 3: Desde el Evento Específico**
1. Ir a `/eventos/[id]` (página del evento)
2. Buscar botón **"Gestionar Evento"** en el sidebar
3. Hacer clic para acceder a la gestión

## 🔍 **Indicadores Visuales**

### **En "Mis Eventos":**
- **Punto azul animado** junto al número de postulaciones
- Texto: "X pendiente(s)" en color azul
- Botón "Gestionar" solo aparece cuando hay postulaciones

### **En "Postulaciones":**
- **Header descriptivo** explicando la funcionalidad
- **Botón principal** "Ver Todos los Eventos"
- **Estado de cada evento** con badges de color
- **Contador de postulaciones** pendientes por evento

## 🎨 **Diseño de Botones**

### **Botón "Gestionar" (Activo):**
- Color: Verde a esmeralda (`from-green-600 to-emerald-600`)
- Icono: Usuarios (`<Users />`)
- Texto: "Gestionar"
- Hover: Verde más oscuro

### **Botón "Gestionar" (Inactivo):**
- Color: Gris (`text-gray-600 bg-gray-50`)
- Texto: "Sin Postulaciones"
- Estado: `disabled`
- Cursor: `cursor-not-allowed`

### **Botón "Ver Detalles":**
- Color: Azul a púrpura (`from-blue-600 to-purple-600`)
- Texto: "Ver Detalles"
- Hover: Azul más oscuro

## 📱 **Responsive Design**

- **Desktop:** Botones en línea horizontal
- **Tablet:** Botones apilados verticalmente
- **Mobile:** Botones de ancho completo
- **Hover effects:** Escalado suave (`scale: 1.02`)

## 🔐 **Seguridad y Permisos**

- Solo organizadores pueden ver los botones
- Verificación de propiedad del evento
- Redirección automática si no hay permisos
- Validación en el backend para todas las acciones

## 🚦 **Estados del Botón**

### **Evento sin Postulaciones:**
```
Botón: "Sin Postulaciones" (deshabilitado)
Color: Gris
Estado: No clickeable
```

### **Evento con Postulaciones:**
```
Botón: "Gestionar" (activo)
Color: Verde
Estado: Clickeable
Acción: Redirige a /eventos/[id]/gestionar
```

### **Evento en Borrador:**
```
Botón: "Gestionar" (no aparece)
Estado: Solo eventos publicados muestran gestión
```

## 📊 **Métricas Mostradas**

### **En Cada Evento:**
- Título y descripción
- Fecha y ubicación
- Estado (Activo, Borrador, etc.)
- Número de postulaciones actuales
- Número máximo de voluntarios
- Indicador de postulaciones pendientes

### **En el Dashboard:**
- Total de eventos creados
- Total de postulaciones recibidas
- Total de voluntarios ayudados
- Promedio de calificación

## 🔄 **Actualizaciones en Tiempo Real**

- Los botones aparecen/desaparecen según el estado
- Contadores se actualizan automáticamente
- Indicadores visuales reflejan el estado actual
- Navegación fluida entre vistas

## 💡 **Consejos de Uso**

1. **Revisa regularmente** la pestaña "Postulaciones"
2. **Usa el indicador azul** para identificar eventos con postulaciones
3. **Gestiona pronto** para no perder voluntarios interesados
4. **Navega fácilmente** entre eventos usando los botones
5. **Mantén actualizado** el estado de tus eventos

## 🆘 **Solución de Problemas**

### **Botón no aparece:**
- Verifica que seas organizador del evento
- Confirma que el evento tenga postulaciones
- Revisa que el evento esté publicado

### **Error de permisos:**
- Cierra sesión y vuelve a iniciar
- Verifica tu rol en la organización
- Contacta al administrador si persiste

### **Página no carga:**
- Verifica la conexión a internet
- Refresca la página
- Limpia el caché del navegador


