# 01-PRD-Business-Rules.md

## PRODUCT REQUIREMENTS DOCUMENT (PRD)
**Project:** Plataforma de Delivery (MVP a Escala Nacional)
**Context:** Ciudad inicial 20.000 habitantes. Arquitectura para soportar escalabilidad nacional.

### 1. FLUJOS PRINCIPALES DEL NEGOCIO

#### 1.1. Flujo de Compra (Cliente)
1. **Descubrimiento:** El cliente abre la app. El frontend obtiene sus coordenadas (lat/lng) y solicita al backend los comercios disponibles.
2. **Filtrado Geoespacial:** El backend retorna únicamente los comercios activos cuyo polígono de cobertura o radio máximo incluya la ubicación del cliente.
3. **Carrito (Single-Tenant Estricto):** El cliente agrega productos. Si intenta agregar un producto de un `Comercio B` teniendo ítems del `Comercio A`, el sistema exige vaciar el carrito.
4. **Checkout:** Se calcula subtotal, costo de envío (basado en distancia) y se selecciona método de pago.
5. **Creación:** Se genera la orden en estado `PENDING`.

#### 1.2. Flujo de Asignación Logística (Repartidor)
1. **Trigger:** La orden cambia a `READY` (o `PREPARING` dependiendo del tiempo de cocción estimado).
2. **Broadcasting (Radio Pinging):** El backend ejecuta una consulta PostGIS buscando repartidores con estado `ONLINE` a un radio de `X` km del comercio.
3. **Notificación:** Se emite evento WebSocket (`order.offer`) a los repartidores encontrados.
4. **Race Condition (El primero que acepta):** Varios repartidores pueden ver la oferta. El primero en hacer POST a `/orders/:id/claim` se asigna. El backend usa transacciones (bloqueo optimista/pesimista) para asignar al ganador. Los demás reciben un HTTP 409 (Conflict).
5. **Tracking:** El repartidor transmite su ubicación cada 10s. El cliente la visualiza en tiempo real.

#### 1.3. Flujo de Pagos
- **Efectivo:** Transacción validada en la entrega. Genera una deuda del comercio/repartidor con la plataforma (comisiones).
- **Online (MercadoPago/Stripe):** Orden se crea en estado `PAYMENT_PENDING`. El Webhook de la pasarela actualiza el estado a `PENDING` (pagado) y recién ahí se notifica al comercio.

### 2. LOGÍSTICA GEOESPACIAL Y REGLAS
- **Fórmula de Distancias:** Todo cálculo de distancia y radio se realiza en la base de datos utilizando `PostGIS` (`ST_DistanceSphere` o `ST_DWithin`), NUNCA en memoria de Node.js.
- **SRID:** Todas las coordenadas se guardan en el sistema de referencia espacial WGS 84 (`SRID 4326`).

### 3. MÁQUINA DE ESTADOS DEL PEDIDO (Order States)
El ciclo de vida de una orden es estrictamente secuencial:
1. `PAYMENT_PENDING` (Opcional, si paga online).
2. `PENDING` (Recibido, esperando confirmación del comercio).
3. `ACCEPTED` (Comercio acepta el pedido).
4. `PREPARING` (Comercio comienza preparación).
5. `READY` (Listo para retirar. Dispara búsqueda de repartidor).
6. `DRIVER_ASSIGNED` (Repartidor aceptó el viaje).
7. `PICKED_UP` (Repartidor retiró el pedido del local).
8. `DELIVERED` (Entregado al cliente - Estado Final).
9. `CANCELLED` (Puede ocurrir antes de `PICKED_UP`. Requiere motivo).