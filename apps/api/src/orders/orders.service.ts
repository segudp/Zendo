import { Injectable, BadRequestException, NotFoundException, ForbiddenException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { ProductsService } from '../products/products.service';
import { OrderStatus } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { UserPayload } from '../common/interfaces/user-payload.interface';

@Injectable()
export class OrdersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly productsService: ProductsService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async create(clientId: string, createOrderDto: CreateOrderDto) {
    const { commerceId, items, dropoffAddress, dropoffLocation } = createOrderDto;

    if (!items || items.length === 0) {
      throw new BadRequestException('Order must contain at least one item');
    }

    // 1. Check if Commerce exists and is open (using queryRaw to get PostGIS coordinates)
    const commerceData = await this.prisma.$queryRaw<
      Array<{
        id: string;
        name: string;
        isActive: boolean;
        isOpen: boolean;
        lng: number;
        lat: number;
      }>
    >`
      SELECT id, name, is_active as "isActive", is_open as "isOpen",
             ST_X(location::geometry) as lng,
             ST_Y(location::geometry) as lat
      FROM commerces
      WHERE id = ${commerceId}::uuid
    `;

    if (!commerceData || !commerceData[0]) {
      throw new NotFoundException('Commerce not found');
    }

    const commerce = commerceData[0];

    if (!commerce.isActive || !commerce.isOpen) {
      throw new BadRequestException('Commerce is closed or inactive');
    }

    // 2. Fetch real products using ProductsService to calculate prices
    const productIds = items.map((item) => item.productId);
    const realProducts = await this.productsService.getProductsByIds(productIds, commerceId);

    // Mapeo rápido para calcular el precio total y armar el detalle de la base de datos
    const productMap = new Map(realProducts.map((p) => [p.id, p]));

    let totalAmount = new Decimal(0);
    const orderItemsData = items.map((item) => {
      const product = productMap.get(item.productId);
      if (!product || !product.isAvailable) {
        throw new BadRequestException(`Product ${item.productId} is not available or does not belong to this commerce`);
      }

      const unitPrice = product.price;
      totalAmount = totalAmount.add(unitPrice.mul(item.quantity));

      return {
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: unitPrice,
      };
    });

    // Simularemos un costo de envío base de $5.00 por ahora
    const deliveryFee = new Decimal(5.00);

    // 3. Transaction for order creation and initial status
    return this.prisma.$transaction(async (prisma) => {
      const order = await prisma.order.create({
        data: {
          commerceId,
          clientId,
          totalAmount,
          deliveryFee,
          dropoffAddress,
          status: OrderStatus.PENDING,
          items: {
            create: orderItemsData,
          },
          statusHistory: {
            create: {
              status: OrderStatus.PENDING,
              notes: 'Order placed by client',
            },
          },
        },
        include: {
          items: true,
        },
      });

      // El punto geográfico de destino no lo soporta el `create` tipado de Prisma (Unsupported type)
      if (dropoffLocation) {
        await prisma.$executeRaw`
          UPDATE orders
          SET dropoff_location = ST_SetSRID(ST_MakePoint(${dropoffLocation.lng}, ${dropoffLocation.lat}), 4326)
          WHERE id = ${order.id}::uuid
        `;
      }

      // Emit event
      this.eventEmitter.emit('order.created', {
        order,
        commerceName: commerce.name,
        commerceLocation: commerce.lat && commerce.lng ? { lat: commerce.lat, lng: commerce.lng } : undefined
      });

      return order;
    });
  }

  async findAllForClient(clientId: string) {
    return this.prisma.order.findMany({
      where: { clientId },
      include: {
        commerce: { select: { id: true, name: true, logoUrl: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findAllForCommerce(commerceId: string) {
    return this.prisma.order.findMany({
      where: { commerceId },
      include: {
        client: { select: { id: true, firstName: true, lastName: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, user: UserPayload) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: {
        items: { include: { product: true } },
        commerce: true,
        client: { select: { id: true, firstName: true, lastName: true, phone: true } },
        delivery: { include: { driver: true } },
      },
    });

    if (!order) {
      throw new NotFoundException(`Order ${id} not found`);
    }

    const isOwnerClient = user.role === 'CLIENT' && order.clientId === user.id;
    const isOwnerCommerce = user.role === 'COMMERCE_OWNER' && order.commerceId === user.commerce?.id;
    const isAssignedDriver = user.role === 'DRIVER' && order.delivery?.driver.userId === user.id;
    const isAdmin = user.role === 'SUPER_ADMIN';

    if (!isOwnerClient && !isOwnerCommerce && !isAssignedDriver && !isAdmin) {
      throw new ForbiddenException('You do not have access to this order');
    }

    return order;
  }

  async updateStatus(id: string, updateOrderStatusDto: UpdateOrderStatusDto, userRole: string, commerceId?: string) {
    const { status: newStatus } = updateOrderStatusDto;

    const order = await this.prisma.order.findUnique({
      where: { id },
    });

    if (!order) {
      throw new NotFoundException(`Order ${id} not found`);
    }

    // Role isolation validation
    if (userRole === 'COMMERCE_OWNER' && order.commerceId !== commerceId) {
      throw new ForbiddenException('You can only update orders for your commerce');
    }

    // State machine logic
    this.validateStateTransition(order.status, newStatus, userRole);

    const updatedOrder = await this.prisma.$transaction(async (prisma) => {
      return prisma.order.update({
        where: { id },
        data: {
          status: newStatus,
          statusHistory: {
            create: {
              status: newStatus,
              notes: `Status changed to ${newStatus} by ${userRole}`,
            },
          },
        },
      });
    });

    this.eventEmitter.emit('order.status.changed', {
      orderId: updatedOrder.id,
      commerceId: updatedOrder.commerceId,
      newStatus: updatedOrder.status,
    });

    return updatedOrder;
  }

  // Un repartidor toma una oferta de pedido. Debe resolver condiciones de carrera:
  // sólo el primero que llega gana la asignación (Hito de Logística).
  async claim(orderId: string, driverUserId: string) {
    const driver = await this.prisma.driver.findUnique({ where: { userId: driverUserId } });
    if (!driver) {
      throw new NotFoundException('Driver profile not found for this user');
    }

    const order = await this.prisma.$transaction(async (prisma) => {
      // Update condicional: sólo transiciona si sigue READY. Si otro repartidor ya lo tomó, count será 0.
      const result = await prisma.order.updateMany({
        where: { id: orderId, status: OrderStatus.READY },
        data: { status: OrderStatus.DRIVER_ASSIGNED },
      });

      if (result.count === 0) {
        const existing = await prisma.order.findUnique({ where: { id: orderId } });
        if (!existing) throw new NotFoundException(`Order ${orderId} not found`);
        throw new ConflictException('This order was already claimed by another driver');
      }

      await prisma.orderDelivery.create({
        data: { orderId, driverId: driver.id },
      });

      await prisma.orderStatusHistory.create({
        data: {
          orderId,
          status: OrderStatus.DRIVER_ASSIGNED,
          notes: `Claimed by driver ${driver.id}`,
        },
      });

      return prisma.order.findUnique({ where: { id: orderId } });
    });

    this.eventEmitter.emit('order.status.changed', {
      orderId: order!.id,
      commerceId: order!.commerceId,
      newStatus: order!.status,
    });

    return order;
  }

  private validateStateTransition(currentStatus: OrderStatus, newStatus: OrderStatus, role: string) {
    // Definimos las transiciones permitidas desde cada estado
    const validTransitions: Record<OrderStatus, OrderStatus[]> = {
      PAYMENT_PENDING: [OrderStatus.PENDING, OrderStatus.CANCELLED],
      PENDING: [OrderStatus.ACCEPTED, OrderStatus.CANCELLED],
      ACCEPTED: [OrderStatus.PREPARING, OrderStatus.CANCELLED],
      PREPARING: [OrderStatus.READY],
      READY: [OrderStatus.DRIVER_ASSIGNED],
      DRIVER_ASSIGNED: [OrderStatus.PICKED_UP],
      PICKED_UP: [OrderStatus.DELIVERED],
      DELIVERED: [],
      CANCELLED: [],
    };

    const allowed = validTransitions[currentStatus] || [];

    if (!allowed.includes(newStatus)) {
      throw new BadRequestException(`Cannot transition order from ${currentStatus} to ${newStatus}`);
    }

    // Adicionalmente podríamos agregar validaciones por ROL
    const logisticsOnlyStatuses: OrderStatus[] = [OrderStatus.DELIVERED, OrderStatus.PICKED_UP];
    if (role === 'COMMERCE_OWNER' && logisticsOnlyStatuses.includes(newStatus)) {
      throw new ForbiddenException('Commerce owner cannot set logistics states directly');
    }
  }
}
