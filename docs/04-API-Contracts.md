# 04-API-Contracts.md

## API REST & WEBSOCKET CONTRACTS (v1)

### 1. IDENTITY DOMAIN (`/api/v1/auth`)
- `POST /login/email` -> Login con email/pass. Retorna JWT + Refresh. (Public)
- `POST /login/oauth` -> Login con Google/Apple. (Public)
- `POST /refresh` -> Renueva access token. (Public)
- `GET /me` -> Retorna perfil del usuario logueado. (All Authenticated)

### 2. CATALOG DOMAIN (`/api/v1/catalog`)
- `GET /commerces` -> Lista comercios. Query: `?lat=&lng=&radius=`. (Public/Client)
- `GET /commerces/:id/products` -> Menú del comercio. (Public/Client)
- `POST /products` -> Crea producto. Fuerza inyección de `commerceId`. (Commerce)
- `PUT /products/:id` -> Actualiza producto. (Commerce)
- `PATCH /commerces/status` -> Abre/Cierra comercio. (Commerce)

### 3. ORDERS DOMAIN (`/api/v1/orders`)
- `POST /` -> Crea pedido (Checkout). (Client)
- `GET /` -> Lista pedidos. (Commerce ve los suyos; Client ve los suyos; Admin ve todos).
- `GET /:id` -> Detalle del pedido. (Client, Commerce, Admin)
- `PATCH /:id/status` -> Avanza estado del pedido (ej. PENDING -> PREPARING). (Commerce)

### 4. LOGISTICS DOMAIN (`/api/v1/logistics`)
- `PATCH /driver/status` -> Cambia estado ONLINE/OFFLINE del repartidor. (Driver)
- `PATCH /orders/:id/claim` -> Acepta un pedido ofrecido (Race condition resolution). (Driver)

---

### 5. WEBSOCKETS (Namespace: `/`, Authenticated via Handshake)

#### Emisiones del Backend al Cliente (Escucha el Frontend):
- `order.status.updated`: Payload `{ orderId, newStatus }`. (Rooms: `order_{id}`, `commerce_{id}`)
- `order.offer`: Payload `{ orderId, pickup, dropoff, fee }`. (Rooms: Repartidores cercanos)
- `driver.location.updated`: Payload `{ lat, lng, bearing }`. (Rooms: `order_{id}`)
- `new.order.received`: Payload `{ orderData }`. (Rooms: `commerce_{id}`)

#### Emisiones del Cliente al Backend (Escucha el Backend):
- `driver.update_location`: Payload `{ lat, lng, heading, speed }`. Emitido por la app del repartidor cada 10s. Actualiza PostGIS y retransmite a la sala de la orden activa.