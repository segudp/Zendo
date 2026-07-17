#!/bin/bash
set -e

echo "======================================"
echo "    SETUP INICIAL DE BASE DE DATOS    "
echo "======================================"

# 1. Levantar la base de datos con Docker
echo "Iniciando contenedores de Docker..."
docker-compose up -d postgres

# 2. Esperar a que la BD esté lista
echo "Esperando a que PostgreSQL inicie correctamente..."
sleep 5

# 3. Habilitar extensión PostGIS manualmente (por si Prisma no tiene los permisos suficientes o falla)
echo "Habilitando extensión PostGIS..."
docker exec -i zendo-postgres psql -U postgres -d zendo -c "CREATE EXTENSION IF NOT EXISTS postgis;"

# 4. Generar el cliente Prisma
echo "Generando Prisma Client..."
npx prisma generate

# 5. Correr la primera migración
echo "Corriendo primera migración..."
npx prisma migrate dev --name init

echo "✅ Setup completado con éxito."
