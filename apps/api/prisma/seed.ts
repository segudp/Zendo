// Seed de datos de prueba. No hay pantalla de registro en ninguna app todavía,
// así que esta es la única forma de tener usuarios con los que loguearse.
//
// Uso: npm run db:seed (desde apps/api)
import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const DEMO_PASSWORD = 'Password123!';

async function upsertUser(params: {
  email: string;
  firstName: string;
  lastName: string;
  role: Role;
}) {
  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);
  return prisma.user.upsert({
    where: { email: params.email },
    update: {},
    create: {
      email: params.email,
      passwordHash,
      firstName: params.firstName,
      lastName: params.lastName,
      role: params.role,
    },
  });
}

async function main() {
  const admin = await upsertUser({
    email: 'admin@zendo.com',
    firstName: 'Admin',
    lastName: 'Zendo',
    role: Role.SUPER_ADMIN,
  });

  const owner = await upsertUser({
    email: 'comercio@zendo.com',
    firstName: 'Dueño',
    lastName: 'Comercio',
    role: Role.COMMERCE_OWNER,
  });

  const driverUser = await upsertUser({
    email: 'repartidor@zendo.com',
    firstName: 'Juan',
    lastName: 'Repartidor',
    role: Role.DRIVER,
  });

  const client = await upsertUser({
    email: 'cliente@zendo.com',
    firstName: 'Ana',
    lastName: 'Cliente',
    role: Role.CLIENT,
  });

  await prisma.driver.upsert({
    where: { userId: driverUser.id },
    update: {},
    create: {
      userId: driverUser.id,
      vehicleType: 'Moto',
      plateNumber: 'AB123CD',
    },
  });

  const commerce = await prisma.commerce.upsert({
    where: { ownerId: owner.id },
    update: {},
    create: {
      ownerId: owner.id,
      name: 'La Esquina',
      description: 'Comida rápida y casera',
      address: 'Av. Siempre Viva 742',
      isActive: true,
      isOpen: true,
    },
  });

  // Ubicación del comercio (PostGIS no soporta el `create` tipado de Prisma)
  await prisma.$executeRaw`
    UPDATE commerces
    SET location = ST_SetSRID(ST_MakePoint(-58.3816, -34.6037), 4326)
    WHERE id = ${commerce.id}::uuid
  `;

  const category = await prisma.category.upsert({
    where: { id: '00000000-0000-0000-0000-000000000001' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000001',
      commerceId: commerce.id,
      name: 'Hamburguesas',
    },
  });

  await prisma.product.upsert({
    where: { id: '00000000-0000-0000-0000-000000000002' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000002',
      commerceId: commerce.id,
      categoryId: category.id,
      name: 'Hamburguesa Doble',
      description: 'Doble carne, cheddar y panceta',
      price: 12.5,
      isAvailable: true,
    },
  });

  console.log('✅ Seed completado. Usuarios de prueba (contraseña para todos: %s):', DEMO_PASSWORD);
  console.log(`   SUPER_ADMIN     -> ${admin.email}`);
  console.log(`   COMMERCE_OWNER  -> ${owner.email}`);
  console.log(`   DRIVER          -> ${driverUser.email}`);
  console.log(`   CLIENT          -> ${client.email}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
