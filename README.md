# 🌟 VolunNet - Plataforma de Voluntariado Inteligente

Una plataforma moderna para conectar voluntarios con organizaciones, impulsada por Next.js 14, Prisma y Machine Learning.

## 🚀 Características

- **🔐 Autenticación Segura**: Sistema de login/registro con NextAuth.js
- **👥 Perfiles Dinámicos**: Diferentes perfiles para voluntarios y organizaciones
- **🎯 Recomendaciones Inteligentes**: ML para conectar voluntarios con eventos
- **📱 Diseño Responsivo**: Interfaz moderna con Tailwind CSS y Framer Motion
- **🗄️ Base de Datos Robusta**: PostgreSQL con Prisma ORM
- **⚡ Rendimiento Optimizado**: Next.js 14 con App Router

## 📋 Requisitos Previos

- Node.js 18+ 
- npm o pnpm
- Cuenta en [Neon Database](https://neon.tech) (recomendado)

## 🛠️ Instalación Rápida

### 1. Clonar el repositorio

```bash
git clone <tu-repositorio>
cd VolunNetv1-main
```

### 2. Instalar dependencias

```bash
npm install
# o
pnpm install
```

### 3. Configurar variables de entorno

#### Opción A: Configuración Automática (Recomendado)

```bash
npm run setup
```

Este comando te guiará paso a paso para configurar:
- Base de datos (Neon, PostgreSQL local, Supabase)
- Secret de autenticación
- Puerto del servidor

#### Opción B: Configuración Manual

```bash
# Copiar archivo de ejemplo
cp env.example .env.local

# Editar variables de entorno
nano .env.local
```

### 4. Configurar base de datos

```bash
# Generar cliente de Prisma
npm run db:generate

# Sincronizar esquema con la base de datos
npm run db:push
```

### 5. Iniciar servidor de desarrollo

```bash
npm run dev
```

¡Listo! Tu aplicación estará disponible en `http://localhost:3001`

## 📁 Estructura del Proyecto

```
VolunNetv1-main/
├── app/                    # App Router de Next.js 14
│   ├── auth/              # Acciones de autenticación
│   ├── dashboard/         # Panel principal
│   ├── eventos/           # Gestión de eventos
│   ├── login/             # Página de login
│   └── registro/          # Página de registro
├── components/            # Componentes reutilizables
│   ├── ui/               # Componentes base (shadcn/ui)
│   └── dashboard/        # Componentes específicos del dashboard
├── hooks/                # Custom hooks
├── lib/                  # Utilidades y configuraciones
├── prisma/               # Esquema de base de datos
├── public/               # Archivos estáticos
└── types/                # Definiciones de TypeScript
```

## 🔧 Scripts Disponibles

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Iniciar servidor de desarrollo |
| `npm run build` | Construir para producción |
| `npm run start` | Iniciar servidor de producción |
| `npm run setup` | Configurar variables de entorno |
| `npm run db:generate` | Generar cliente de Prisma |
| `npm run db:push` | Sincronizar esquema con BD |
| `npm run db:pull` | Obtener esquema de BD |
| `npm run db:studio` | Abrir Prisma Studio |
| `npm run db:reset` | Resetear base de datos |

## 🗄️ Configuración de Base de Datos

### Neon Database (Recomendado)

1. Ve a [neon.tech](https://neon.tech)
2. Crea una cuenta y un proyecto
3. Ve a "Connection Details"
4. Copia la "Connection string"
5. Pégala en `DATABASE_URL` en tu `.env.local`

### PostgreSQL Local

```bash
# Instalar PostgreSQL
# Crear base de datos
createdb volunnet

# Configurar en .env.local
DATABASE_URL="postgresql://postgres:password@localhost:5432/volunnet"
```

### Supabase

1. Ve a [supabase.com](https://supabase.com)
2. Crea una cuenta y un proyecto
3. Ve a Settings → Database
4. Copia la "Connection string"

## 🔐 Variables de Entorno

### Obligatorias

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `DATABASE_URL` | URL de conexión a PostgreSQL | `postgresql://user:pass@host:port/db` |
| `NEXTAUTH_SECRET` | Secret para autenticación | `generado-con-openssl` |
| `NEXTAUTH_URL` | URL de la aplicación | `http://localhost:3001` |

### Opcionales

| Variable | Descripción | Uso |
|----------|-------------|-----|
| `NODE_ENV` | Entorno de ejecución | `development`, `production` |
| `PORT` | Puerto del servidor | `3001` |
| `DEBUG` | Modo debug | `true`, `false` |

## 🎨 Tecnologías Utilizadas

### Frontend
- **Next.js 14** - Framework de React
- **TypeScript** - Tipado estático
- **Tailwind CSS** - Framework de CSS
- **Framer Motion** - Animaciones
- **shadcn/ui** - Componentes UI
- **Lucide React** - Iconos

### Backend
- **Next.js API Routes** - API endpoints
- **Prisma** - ORM para PostgreSQL
- **NextAuth.js** - Autenticación
- **bcryptjs** - Hash de contraseñas
- **Zod** - Validación de esquemas

### Base de Datos
- **PostgreSQL** - Base de datos principal
- **Neon Database** - PostgreSQL en la nube

### Herramientas
- **ESLint** - Linting
- **Prettier** - Formateo de código
- **Prisma Studio** - GUI para base de datos

## 🚀 Despliegue

### Vercel (Recomendado)

1. Conecta tu repositorio a Vercel
2. Configura las variables de entorno en el dashboard
3. Deploy automático en cada push

### Railway

1. Conecta tu repositorio a Railway
2. Configura las variables de entorno
3. Deploy automático

### Docker

```dockerfile
# Dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## 🛠️ Desarrollo

### Estructura de Commits

```
feat: nueva característica
fix: corrección de bug
docs: documentación
style: formato de código
refactor: refactorización
test: pruebas
chore: tareas de mantenimiento
```

### Flujo de Trabajo

1. Crear rama desde `main`
2. Desarrollar feature
3. Ejecutar tests
4. Crear Pull Request
5. Code review
6. Merge a `main`

## 📚 Documentación Adicional

- [Configuración de Variables de Entorno](ENV_SETUP.md)
- [Esquema de Base de Datos](prisma/schema.prisma)
- [Componentes UI](components/ui/)
- [API Routes](app/api/)

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 🆘 Soporte

- 📧 Email: soporte@volunnet.com
- 💬 Discord: [Servidor de VolunNet](https://discord.gg/volunnet)
- 📖 Documentación: [docs.volunnet.com](https://docs.volunnet.com)

## 🙏 Agradecimientos

- [Next.js](https://nextjs.org/) - Framework de React
- [Prisma](https://prisma.io/) - ORM moderno
- [shadcn/ui](https://ui.shadcn.com/) - Componentes UI
- [Neon Database](https://neon.tech) - PostgreSQL en la nube
- [Tailwind CSS](https://tailwindcss.com/) - Framework de CSS

---

⭐ Si este proyecto te ayuda, ¡dale una estrella al repositorio!
