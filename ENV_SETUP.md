# 🔧 Configuración de Variables de Entorno - VolunNet

## 📋 Requisitos Previos

Antes de configurar las variables de entorno, asegúrate de tener:

- [Node.js](https://nodejs.org/) (versión 18 o superior)
- [npm](https://www.npmjs.com/) o [pnpm](https://pnpm.io/)
- Una cuenta en [Neon Database](https://neon.tech) (recomendado)

## 🚀 Configuración Rápida

### 1. Copiar archivo de ejemplo

```bash
# Copia el archivo de ejemplo
cp env.example .env.local
```

### 2. Configurar base de datos

#### Opción A: Neon Database (Recomendado)

1. Ve a [neon.tech](https://neon.tech) y crea una cuenta
2. Crea un nuevo proyecto
3. Ve a "Connection Details"
4. Copia la "Connection string"
5. Pégala en `DATABASE_URL` en tu archivo `.env.local`

#### Opción B: PostgreSQL Local

Si tienes PostgreSQL instalado localmente:

```bash
# Crear base de datos
createdb volunnet

# Configurar en .env.local
DATABASE_URL="postgresql://postgres:tu-password@localhost:5432/volunnet"
```

### 3. Generar secret de autenticación

```bash
# Generar un secret seguro
openssl rand -base64 32
```

Copia el resultado y pégalo en `NEXTAUTH_SECRET` en tu archivo `.env.local`.

### 4. Configurar URL de la aplicación

En tu archivo `.env.local`, asegúrate de que:

```env
NEXTAUTH_URL="http://localhost:3001"
```

## 📝 Variables de Entorno Requeridas

### 🔑 Variables Obligatorias

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `DATABASE_URL` | URL de conexión a PostgreSQL | `postgresql://user:pass@host:port/db` |
| `NEXTAUTH_SECRET` | Secret para autenticación | `generado-con-openssl-rand-base64-32` |
| `NEXTAUTH_URL` | URL de la aplicación | `http://localhost:3001` |

### 🔧 Variables Opcionales

| Variable | Descripción | Uso |
|----------|-------------|-----|
| `NODE_ENV` | Entorno de ejecución | `development`, `production` |
| `PORT` | Puerto del servidor | `3001` |
| `DEBUG` | Modo debug | `true`, `false` |

## 🗄️ Configuración de Base de Datos

### Neon Database (Recomendado)

1. **Crear cuenta**: [neon.tech](https://neon.tech)
2. **Crear proyecto**: Dale un nombre como "volunnet"
3. **Obtener URL**: Ve a "Connection Details" → "Connection string"
4. **Formato**: `postgresql://user:password@ep-host.region.aws.neon.tech/database?sslmode=require`

### Supabase (Alternativa)

1. **Crear cuenta**: [supabase.com](https://supabase.com)
2. **Crear proyecto**: Configura tu proyecto
3. **Obtener URL**: Settings → Database → Connection string
4. **Formato**: `postgresql://postgres:[password]@[host]:5432/postgres`

## 🔐 Generación de Secrets

### NEXTAUTH_SECRET

```bash
# Método 1: OpenSSL
openssl rand -base64 32

# Método 2: Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# Método 3: Online (solo para desarrollo)
# https://generate-secret.vercel.app/32
```

## 🚀 Despliegue

### Desarrollo Local

```bash
# Instalar dependencias
npm install

# Generar cliente de Prisma
npx prisma generate

# Sincronizar base de datos
npx prisma db push

# Iniciar servidor
npm run dev
```

### Producción

Para producción, usa un gestor de secretos:

- **Vercel**: Variables de entorno en el dashboard
- **Railway**: Variables de entorno en el dashboard
- **Heroku**: `heroku config:set VARIABLE=valor`

## 🔍 Verificación

Para verificar que todo está configurado correctamente:

```bash
# Verificar conexión a base de datos
npx prisma db pull

# Verificar variables de entorno
node -e "console.log('DATABASE_URL:', process.env.DATABASE_URL ? '✅ Configurado' : '❌ Faltante')"
```

## 🛠️ Solución de Problemas

### Error: "No database connection string was provided"

1. Verifica que `DATABASE_URL` esté en tu archivo `.env.local`
2. Asegúrate de que el archivo esté en la raíz del proyecto
3. Reinicia el servidor de desarrollo

### Error: "Invalid connection string"

1. Verifica el formato de la URL de conexión
2. Asegúrate de que las credenciales sean correctas
3. Verifica que la base de datos esté activa

### Error: "Secret not configured"

1. Genera un nuevo secret con `openssl rand -base64 32`
2. Actualiza `NEXTAUTH_SECRET` en tu archivo `.env.local`
3. Reinicia el servidor

## 📚 Recursos Adicionales

- [Documentación de Prisma](https://www.prisma.io/docs)
- [Documentación de NextAuth.js](https://next-auth.js.org/)
- [Documentación de Neon Database](https://neon.tech/docs)
- [Guía de variables de entorno en Next.js](https://nextjs.org/docs/basic-features/environment-variables)

## ⚠️ Seguridad

- **NUNCA** subas `.env.local` al repositorio
- **NUNCA** compartas tus secrets en público
- **SIEMPRE** usa diferentes variables para desarrollo y producción
- **ROTULA** tus secrets regularmente en producción

---

¿Necesitas ayuda? Abre un issue en el repositorio o contacta al equipo de desarrollo. 