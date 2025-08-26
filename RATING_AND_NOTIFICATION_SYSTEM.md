# 🎯 Sistema de Calificaciones y Notificaciones - VolunNet

## 📋 **Resumen del Sistema**

Este sistema implementa un completo flujo de calificaciones bidireccionales y notificaciones escalables para la plataforma VolunNet. Permite que tanto voluntarios como organizaciones se califiquen mutuamente después de completar eventos, creando una comunidad más transparente y confiable.

## 🏗️ **Arquitectura del Sistema**

### **Componentes Principales:**

1. **Sistema de Calificaciones Bidireccionales**
   - Calificaciones de 1-5 estrellas
   - Feedback opcional
   - Estado de calificación por aplicación
   - Cálculo automático de ratings promedio

2. **Sistema de Notificaciones Escalable**
   - Múltiples categorías y subcategorías
   - Sistema de prioridades
   - Templates dinámicos con variables
   - Envío multicanal (in-app, email, push, SMS)

3. **Sistema de Archivo Automático**
   - Archivo automático de eventos completados
   - Recordatorios escalonados de calificación
   - Limpieza automática de notificaciones expiradas

## 🗄️ **Modelos de Base de Datos**

### **Nuevos Modelos:**

#### **EventRating**
```prisma
model EventRating {
  id        String   @id @default(cuid())
  eventId   String
  event     Event    @relation(fields: [eventId], references: [id], onDelete: Cascade)
  
  raterId   String   // Quien califica
  rater     User     @relation("Rater", fields: [raterId], references: [id], onDelete: Cascade)
  
  ratedId   String   // A quien se califica
  rated     User     @relation("Rated", fields: [ratedId], references: [id], onDelete: Cascade)
  
  rating    Int      // 1-5 estrellas
  feedback  String?  // Comentario opcional
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  @@unique([eventId, raterId, ratedId])
}
```

#### **NotificationTemplate**
```prisma
model NotificationTemplate {
  id          String   @id @default(cuid())
  name        String   @unique
  category    NotificationCategory
  subcategory String?
  
  title       String
  message     String
  actionText  String?
  
  variables   String[] // Variables del template
  priority    NotificationPriority @default(NORMAL)
  expiresIn   Int?                // Días hasta expirar
  
  language    String              @default("es")
  region      String?
  
  active      Boolean             @default(true)
  version     Integer             @default(1)
}
```

#### **UserNotificationPreferences**
```prisma
model UserNotificationPreferences {
  id        String   @id @default(cuid())
  userId    String   @unique
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  preferences Json    // Preferencias por categoría
  
  emailNotifications    Boolean @default(true)
  pushNotifications     Boolean @default(true)
  inAppNotifications    Boolean @default(true)
  smsNotifications      Boolean @default(false)
  
  quietHoursStart       String?
  quietHoursEnd         String?
  timezone              String  @default("UTC")
  digestFrequency       DigestFrequency @default(DAILY)
}
```

### **Enums Nuevos:**

- `NotificationCategory`: EVENT, RATING, MESSAGE, SYSTEM, etc.
- `NotificationSubcategory`: EVENT_CREATED, RATING_REMINDER, etc.
- `NotificationPriority`: LOW, NORMAL, HIGH, URGENT
- `NotificationStatus`: PENDING, SENT, DELIVERED, READ, ACTED, EXPIRED, ARCHIVED
- `RatingStatus`: PENDING, VOLUNTEER_RATED, ORGANIZATION_RATED, BOTH_RATED
- `DigestFrequency`: IMMEDIATE, HOURLY, DAILY, WEEKLY

## 🔧 **Servicios Implementados**

### **1. NotificationService**
- **Propósito**: Gestión centralizada de notificaciones
- **Funcionalidades**:
  - Crear notificaciones desde templates
  - Envío multicanal según preferencias del usuario
  - Gestión de estados de notificación
  - Limpieza automática de notificaciones expiradas

### **2. RatingService**
- **Propósito**: Gestión de calificaciones bidireccionales
- **Funcionalidades**:
  - Crear calificaciones con validaciones
  - Actualizar estados de aplicaciones
  - Calcular ratings promedio automáticamente
  - Enviar notificaciones inteligentes

### **3. EventArchiveService**
- **Propósito**: Archivo automático de eventos
- **Funcionalidades**:
  - Archivar eventos completados automáticamente
  - Programar recordatorios de calificación
  - Gestión de estadísticas de archivo

## 🌐 **APIs Implementadas**

### **Calificaciones:**
- `POST /api/events/[id]/rate` - Crear calificación
- `GET /api/events/[id]/rate` - Obtener calificaciones del evento
- `GET /api/events/rating-pending` - Eventos que necesitan calificación

### **Notificaciones:**
- `GET /api/notifications` - Obtener notificaciones del usuario
- `POST /api/notifications` - Crear notificación
- `PUT /api/notifications/[id]/read` - Marcar como leída
- `PUT /api/notifications/[id]/acted` - Marcar como actuada
- `PUT /api/notifications/mark-all-read` - Marcar todas como leídas
- `DELETE /api/notifications/clear-all` - Limpiar todas
- `GET/PUT /api/notifications/preferences` - Preferencias del usuario

## 🎨 **Componentes de UI**

### **1. NotificationCenter**
- Centro principal de notificaciones
- Filtros por estado, categoría y prioridad
- Acciones en lote (marcar todas como leídas, limpiar todas)

### **2. NotificationItem**
- Item individual de notificación
- Indicadores visuales de estado y prioridad
- Botones de acción contextuales

### **3. NotificationFilters**
- Filtros avanzados para notificaciones
- Filtros activos con badges
- Botón para limpiar filtros

### **4. NotificationSettings**
- Configuración completa de preferencias
- Canales de notificación por categoría
- Horarios de silencio y zona horaria
- Frecuencia de resúmenes

### **5. RatingModal**
- Modal para calificar eventos
- Sistema de estrellas interactivo
- Campo de feedback opcional
- Información del evento y usuario a calificar

### **6. CalificacionesPage**
- Página principal de calificaciones pendientes
- Lista de eventos que necesitan calificación
- Estados visuales claros
- Integración con RatingModal

## 🔄 **Flujo de Calificaciones**

### **1. Evento Completado**
```
Evento → Status: COMPLETED → Fin de evento
```

### **2. Archivo Automático (7 días después)**
```
Evento → Status: ARCHIVED → Notificaciones enviadas
```

### **3. Recordatorios de Calificación**
```
Día 1: Recordatorio suave
Día 3: Recordatorio moderado  
Día 7: Recordatorio urgente
```

### **4. Proceso de Calificación**
```
Usuario A califica a Usuario B → Estado: A_RATED
Usuario B califica a Usuario A → Estado: BOTH_RATED
```

### **5. Completado**
```
Ambas partes calificaron → Evento completamente evaluado
```

## 📱 **Sistema de Notificaciones**

### **Categorías Principales:**
- **EVENT**: Creación, actualización, cancelación, archivo
- **RATING**: Recordatorios, confirmaciones, completado
- **MESSAGE**: Mensajes directos, respuestas
- **SYSTEM**: Mantenimiento, actualizaciones, alertas

### **Prioridades:**
- **LOW**: Informativas, no urgentes
- **NORMAL**: Estándar
- **HIGH**: Importantes
- **URGENT**: Críticas, requieren atención inmediata

### **Canales de Entrega:**
- **In-App**: Dentro de la aplicación
- **Email**: Correo electrónico
- **Push**: Notificaciones del navegador
- **SMS**: Mensajes de texto

## 🚀 **Instalación y Configuración**

### **1. Ejecutar Migración**
```bash
npx prisma migrate dev --name add_rating_and_notification_system
```

### **2. Generar Cliente Prisma**
```bash
npx prisma generate
```

### **3. Configurar Cron Job (Opcional)**
```bash
# Editar crontab
crontab -e

# Agregar línea para ejecutar diariamente a las 2 AM
0 2 * * * cd /path/to/project && node scripts/auto-archive.js
```

### **4. Verificar Templates**
Los templates de notificación se crean automáticamente en la migración:
- `rating_reminder_first`
- `rating_reminder_second`
- `rating_reminder_final`
- `rating_received`
- `rating_completed`
- `event_archived`
- `organization_rating_reminder`

## 🔍 **Uso del Sistema**

### **Para Voluntarios:**
1. Ir a `/calificaciones`
2. Ver eventos que necesitan calificación
3. Hacer clic en "Calificar"
4. Seleccionar rating y agregar feedback
5. Enviar calificación

### **Para Organizaciones:**
1. Acceder desde dashboard
2. Ver eventos archivados
3. Calificar a voluntarios participantes
4. Recibir calificaciones de voluntarios

### **Para Administradores:**
1. Configurar templates de notificación
2. Monitorear estadísticas de archivo
3. Ejecutar script de archivo manualmente
4. Gestionar preferencias globales

## 📊 **Monitoreo y Analytics**

### **Métricas Disponibles:**
- Total de eventos archivados
- Eventos archivados por mes
- Eventos pendientes de archivo
- Notificaciones enviadas por categoría
- Tasa de respuesta a calificaciones

### **Logs del Sistema:**
- Proceso de archivo automático
- Envío de notificaciones
- Errores y excepciones
- Estadísticas de rendimiento

## 🔒 **Seguridad y Validaciones**

### **Validaciones Implementadas:**
- Usuario autenticado para todas las operaciones
- Verificación de permisos para calificar
- Prevención de calificaciones duplicadas
- Validación de rangos de rating (1-5)
- Sanitización de inputs

### **Autorizaciones:**
- Solo participantes pueden calificar
- Solo organizadores pueden calificar voluntarios
- Solo voluntarios pueden calificar organizaciones
- Administradores pueden gestionar todo

## 🧪 **Testing y Debugging**

### **Endpoints de Debug:**
- `/api/events/rating-pending` - Ver eventos pendientes
- `/api/notifications` - Ver notificaciones del usuario
- Script `auto-archive.js` - Proceso manual de archivo

### **Logs de Desarrollo:**
- Console logs en servicios principales
- Errores detallados en APIs
- Estado de notificaciones en tiempo real

## 🚧 **Limitaciones y Consideraciones**

### **Limitaciones Actuales:**
- Envío de email y SMS son placeholders
- Notificaciones push requieren configuración adicional
- Archivo automático requiere cron job o proceso manual

### **Mejoras Futuras:**
- Integración con servicios de email (SendGrid, AWS SES)
- Notificaciones push nativas (Firebase, OneSignal)
- Dashboard de analytics avanzado
- Sistema de badges y gamificación
- Integración con calendarios externos

## 📚 **Recursos Adicionales**

### **Archivos Importantes:**
- `prisma/migrations/20250101000001_add_rating_and_notification_system/`
- `lib/services/NotificationService.ts`
- `lib/services/RatingService.ts`
- `lib/services/EventArchiveService.ts`
- `components/NotificationCenter/`
- `components/RatingModal/`
- `app/calificaciones/`

### **Dependencias:**
- `@prisma/client` - ORM de base de datos
- `framer-motion` - Animaciones
- `date-fns` - Manipulación de fechas
- `lucide-react` - Iconos

## 🎉 **Conclusión**

Este sistema proporciona una base sólida y escalable para las calificaciones bidireccionales y notificaciones en VolunNet. Está diseñado para ser:

- **Escalable**: Arquitectura modular que permite agregar nuevas funcionalidades
- **Profesional**: Sistema robusto con manejo de errores y logging
- **User-Friendly**: Interfaz intuitiva y accesible
- **Mantenible**: Código bien estructurado y documentado

El sistema está listo para producción y puede ser extendido fácilmente para futuras necesidades de la plataforma.


