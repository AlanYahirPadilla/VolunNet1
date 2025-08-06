#!/usr/bin/env node

/**
 * Script de configuración automática de variables de entorno para VolunNet
 * Uso: node setup-env.js
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('🔧 Configuración de Variables de Entorno - VolunNet\n');

// Función para generar secret
function generateSecret() {
  return crypto.randomBytes(32).toString('base64');
}

// Función para preguntar al usuario
function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer.trim());
    });
  });
}

// Función para crear archivo .env.local
async function createEnvFile() {
  const envPath = path.join(process.cwd(), '.env.local');
  
  // Verificar si ya existe
  if (fs.existsSync(envPath)) {
    const overwrite = await askQuestion('⚠️  El archivo .env.local ya existe. ¿Quieres sobrescribirlo? (y/N): ');
    if (overwrite.toLowerCase() !== 'y' && overwrite.toLowerCase() !== 'yes') {
      console.log('❌ Configuración cancelada.');
      rl.close();
      return;
    }
  }

  console.log('\n📝 Configurando variables de entorno...\n');

  // Preguntar por la base de datos
  console.log('🗄️  Configuración de Base de Datos:');
  console.log('1. Neon Database (recomendado)');
  console.log('2. PostgreSQL local');
  console.log('3. Supabase');
  console.log('4. Configurar manualmente después\n');

  const dbChoice = await askQuestion('Selecciona una opción (1-4): ');
  
  let databaseUrl = '';
  
  switch (dbChoice) {
    case '1':
      console.log('\n🌐 Neon Database:');
      console.log('1. Ve a https://neon.tech');
      console.log('2. Crea una cuenta y un proyecto');
      console.log('3. Ve a "Connection Details"');
      console.log('4. Copia la "Connection string"\n');
      databaseUrl = await askQuestion('Pega tu DATABASE_URL de Neon: ');
      break;
    case '2':
      console.log('\n🏠 PostgreSQL Local:');
      const host = await askQuestion('Host (default: localhost): ') || 'localhost';
      const port = await askQuestion('Puerto (default: 5432): ') || '5432';
      const user = await askQuestion('Usuario (default: postgres): ') || 'postgres';
      const password = await askQuestion('Contraseña: ');
      const database = await askQuestion('Base de datos (default: volunnet): ') || 'volunnet';
      databaseUrl = `postgresql://${user}:${password}@${host}:${port}/${database}`;
      break;
    case '3':
      console.log('\n☁️  Supabase:');
      console.log('1. Ve a https://supabase.com');
      console.log('2. Crea una cuenta y un proyecto');
      console.log('3. Ve a Settings → Database');
      console.log('4. Copia la "Connection string"\n');
      databaseUrl = await askQuestion('Pega tu DATABASE_URL de Supabase: ');
      break;
    case '4':
      console.log('\n📝 Configuración manual:');
      console.log('Configura DATABASE_URL manualmente en el archivo .env.local después de la instalación.\n');
      databaseUrl = 'postgresql://username:password@hostname:port/database?sslmode=require';
      break;
    default:
      console.log('❌ Opción inválida. Usando configuración manual.');
      databaseUrl = 'postgresql://username:password@hostname:port/database?sslmode=require';
  }

  // Preguntar por el puerto
  const port = await askQuestion('Puerto del servidor (default: 3001): ') || '3001';

  // Generar secret automáticamente
  const secret = generateSecret();

  // Crear contenido del archivo
  const envContent = `# ========================================
# VOLUNNET - CONFIGURACIÓN AUTOMÁTICA
# ========================================
# Generado automáticamente el ${new Date().toISOString()}

# ========================================
# BASE DE DATOS
# ========================================

DATABASE_URL="${databaseUrl}"

# ========================================
# AUTENTICACIÓN Y SEGURIDAD
# ========================================

# Secret generado automáticamente
NEXTAUTH_SECRET="${secret}"

# URL de la aplicación
NEXTAUTH_URL="http://localhost:${port}"

# ========================================
# ENTORNO
# ========================================

NODE_ENV="development"

# ========================================
# CONFIGURACIÓN DE DESARROLLO
# ========================================

PORT="${port}"
DEBUG="true"

# ========================================
# NOTAS
# ========================================
# ✅ Archivo generado automáticamente
# 🔧 Revisa y ajusta las configuraciones según necesites
# 🚀 Ejecuta 'npm run dev' para iniciar el servidor
`;

  // Escribir archivo
  try {
    fs.writeFileSync(envPath, envContent);
    console.log('\n✅ Archivo .env.local creado exitosamente!');
    console.log(`📁 Ubicación: ${envPath}`);
    
    console.log('\n🔑 Variables configuradas:');
    console.log(`   DATABASE_URL: ${databaseUrl.substring(0, 50)}...`);
    console.log(`   NEXTAUTH_SECRET: ${secret.substring(0, 20)}...`);
    console.log(`   NEXTAUTH_URL: http://localhost:${port}`);
    console.log(`   PORT: ${port}`);
    
    console.log('\n🚀 Próximos pasos:');
    console.log('1. Revisa y ajusta las configuraciones en .env.local');
    console.log('2. Ejecuta: npx prisma generate');
    console.log('3. Ejecuta: npx prisma db push');
    console.log('4. Ejecuta: npm run dev');
    
    console.log('\n📚 Para más información, consulta ENV_SETUP.md');
    
  } catch (error) {
    console.error('❌ Error al crear el archivo:', error.message);
  }

  rl.close();
}

// Función principal
async function main() {
  try {
    await createEnvFile();
  } catch (error) {
    console.error('❌ Error durante la configuración:', error.message);
    rl.close();
  }
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  main();
}

module.exports = { createEnvFile, generateSecret }; 