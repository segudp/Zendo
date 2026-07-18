# 02-Architecture-Guidelines.md

## ARCHITECTURE GUIDELINES: MODULAR MONOLITH & TENANCY

### 1. PATRÓN DE ARQUITECTURA: MONOLITO MODULAR (DDD)
La aplicación de backend (NestJS) se estructurará siguiendo los principios de Domain-Driven Design. Todo convive en el mismo repositorio y proceso, pero con fronteras estrictas.

#### 1.1. Dominios (Módulos de NestJS)
- **Identity (Auth/Users):** Gestión de usuarios, roles, JWT, recuperación de cuentas.
- **Catalog (Commerces/Products):** Gestión de tiendas, sucursales, horarios, categorías y productos.
- **Transacting (Orders):** Motor de pedidos, carritos, cálculo de precios e impuestos.
- **Logistics (Drivers/Tracking):** Gestión de repartidores, cálculo de rutas PostGIS y estado `Online/Offline`.
- **Billing (Payments):** Pasarelas de pago, liquidaciones y comisiones.

#### 1.2. Reglas de Desacoplamiento (Anti-Spaghetti)
- **PROHIBIDO:** Inyectar el `Repository` o `PrismaService` de un dominio directamente en otro.
- **Interfaces Internas:** Si `Orders` necesita el precio de un producto, inyecta `ProductService.getProductPrice()`, NO hace la query a Prisma.
- **Event-Driven:** Las transiciones de estado complejas se manejan vía `@nestjs/event-emitter`. Ejemplo: Cuando `Orders` cambia el estado a `READY`, emite un evento interno. `Logistics` escucha ese evento y acciona los WebSockets.

### 2. ESTRATEGIA MULTI-TENANT (Aislamiento de Datos)
El sistema utiliza un enfoque de **Tenencia Lógica (Logical Isolation)** con una base de datos única y columnas discriminadoras (`commerce_id`).

#### 2.1. Reglas de Escritura (Escudo Anti-Fugas)
Todo endpoint de administración de comercio DEBE inyectar el Tenant ID desde el JWT.
```typescript
// MAL (Vulnerable a Insecure Direct Object Reference)
prisma.product.update({ where: { id: dto.productId }, data: dto });

// BIEN (Aislado)
prisma.product.update({
  where: { id: dto.productId, commerceId: currentUser.commerceId },
  data: dto
});