# Funcionalidades de Gestión de Eventos para Organizadores

## Descripción General

Se han implementado nuevas funcionalidades que permiten a los organizadores gestionar completamente los eventos que crean, incluyendo la gestión de participantes, aplicaciones y perfiles de voluntarios.

## Nuevas APIs Implementadas

### 1. API de Participantes del Evento
**Endpoint:** `GET /api/events/[id]/participants`

**Funcionalidad:** Obtiene todos los participantes de un evento específico, incluyendo:
- Información básica del voluntario (nombre, email, avatar)
- Estado de la aplicación (pendiente, aceptada, rechazada)
- Habilidades e intereses del voluntario
- Estadísticas (horas completadas, eventos participados)
- Calificación del voluntario
- Mensaje de aplicación

**Seguridad:** Solo el organizador dueño del evento puede acceder a esta información.

### 2. API de Gestión de Aplicaciones
**Endpoint:** `PUT /api/events/[id]/applications/[applicationId]`

**Acciones disponibles:**
- `accept`: Aceptar la aplicación de un voluntario
- `reject`: Rechazar la aplicación de un voluntario
- `remove`: Remover completamente al voluntario del evento

**Funcionalidades:**
- Actualiza automáticamente el contador de voluntarios del evento
- Crea notificaciones para los voluntarios
- Valida permisos y límites del evento

### 3. API de Perfil de Voluntario
**Endpoint:** `GET /api/volunteers/[id]`

**Información incluida:**
- Perfil completo del voluntario
- Historial de eventos participados
- Disponibilidad semanal
- Estadísticas de participación
- Habilidades, intereses y experiencia

## Nueva Página de Gestión

### Ruta: `/eventos/[id]/gestionar`

**Características principales:**

1. **Panel de Estadísticas**
   - Contador de voluntarios actuales vs. máximos
   - Número de aplicaciones pendientes
   - Número de voluntarios aceptados
   - Total de aplicaciones recibidas

2. **Sistema de Pestañas**
   - **Aceptados:** Voluntarios confirmados para el evento
   - **Pendientes:** Aplicaciones por revisar
   - **Rechazados:** Aplicaciones rechazadas

3. **Filtros y Búsqueda**
   - Búsqueda por nombre o email
   - Filtro por estado de aplicación
   - Filtro por habilidades específicas
   - Limpieza de filtros

4. **Gestión de Participantes**
   - Ver perfil completo del voluntario
   - Aceptar/rechazar aplicaciones pendientes
   - Remover voluntarios del evento
   - Acciones en tiempo real con feedback visual

5. **Modal de Perfil**
   - Vista detallada del voluntario
   - Estadísticas de participación
   - Habilidades e intereses
   - Mensaje de aplicación

## Componentes Creados

### 1. `EventStats`
Muestra estadísticas visuales del evento con tarjetas coloridas y métricas clave.

### 2. `ParticipantFilters`
Sistema de filtrado avanzado para buscar y filtrar participantes por diferentes criterios.

### 3. `ParticipantCard`
Tarjeta individual para cada participante con información resumida y acciones disponibles.

### 4. `VolunteerProfileModal`
Modal completo para ver el perfil detallado de un voluntario.

## Integración con la Página de Eventos

Se agregó un botón "Gestionar Evento" en la página de detalles del evento (`/eventos/[id]`) que solo aparece para organizadores dueños del evento.

**Ubicación:** En el sidebar derecho, debajo del botón de postulación.

## Flujo de Trabajo para Organizadores

1. **Crear Evento:** El organizador crea un evento desde su dashboard
2. **Recibir Aplicaciones:** Los voluntarios se postulan al evento
3. **Revisar Aplicaciones:** El organizador ve las aplicaciones pendientes
4. **Evaluar Voluntarios:** Revisa perfiles y decide aceptar/rechazar
5. **Gestionar Participantes:** Monitorea voluntarios aceptados y puede remover si es necesario
6. **Seguimiento:** Mantiene control del estado del evento y participantes

## Características de Seguridad

- **Autenticación:** Solo usuarios autenticados pueden acceder
- **Autorización:** Solo organizadores dueños del evento pueden gestionarlo
- **Validación:** Se valida que las acciones no excedan límites del evento
- **Auditoría:** Todas las acciones se registran y notifican a los usuarios afectados

## Notificaciones Automáticas

- **Aceptación:** El voluntario recibe notificación de que su aplicación fue aceptada
- **Rechazo:** El voluntario recibe notificación de que su aplicación fue rechazada
- **Remoción:** El voluntario es notificado si es removido del evento

## Responsive Design

La interfaz está completamente optimizada para dispositivos móviles y de escritorio, con:
- Layout adaptativo
- Componentes móviles
- Navegación táctil
- Diseño fluido

## Tecnologías Utilizadas

- **Frontend:** React, TypeScript, Tailwind CSS
- **Backend:** Next.js API Routes, Prisma
- **Base de Datos:** PostgreSQL
- **UI Components:** Shadcn/ui
- **Animaciones:** Framer Motion
- **Estado:** React Hooks

## Próximas Mejoras Sugeridas

1. **Exportación de Datos:** Permitir exportar listas de participantes
2. **Comunicación Masiva:** Enviar mensajes a todos los participantes
3. **Calificaciones Post-Evento:** Sistema de evaluación de voluntarios
4. **Reportes Avanzados:** Estadísticas detalladas de participación
5. **Integración con Calendario:** Sincronización con calendarios externos
6. **Notificaciones Push:** Alertas en tiempo real para aplicaciones importantes

## Instalación y Configuración

Las nuevas funcionalidades se integran automáticamente con el sistema existente. No se requieren configuraciones adicionales más allá de:

1. Asegurar que la base de datos tenga las tablas necesarias
2. Verificar que los permisos de usuario estén configurados correctamente
3. Confirmar que las rutas de API estén accesibles

## Soporte y Mantenimiento

Para reportar problemas o solicitar nuevas funcionalidades:
1. Crear un issue en el repositorio del proyecto
2. Describir detalladamente el problema o solicitud
3. Incluir pasos para reproducir el problema
4. Adjuntar logs o capturas de pantalla si es necesario



