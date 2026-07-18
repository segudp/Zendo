import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { OnEvent } from '@nestjs/event-emitter';
import { LogisticsService } from '../logistics/logistics.service';
import { DeliveryService } from '../delivery/delivery.service';
import { Logger } from '@nestjs/common';

@WebSocketGateway({ cors: { origin: '*' } })
export class EventsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;
  private readonly logger = new Logger(EventsGateway.name);

  constructor(
    private readonly jwtService: JwtService,
    private readonly logisticsService: LogisticsService,
    private readonly deliveryService: DeliveryService,
  ) {}

  async handleConnection(client: Socket) {
    try {
      const token = this.extractToken(client);
      if (!token) throw new Error('No token provided');

      const payload = this.jwtService.verify(token);
      client.data.user = payload; 
      
      const role = payload.role;
      const userId = payload.sub || payload.userId || payload.id;

      if (role === 'COMMERCE_OWNER' || role === 'COMMERCE_STAFF') {
        const commerceId = client.handshake.query.commerceId;
        if (commerceId) {
          client.join(`commerce_${commerceId}`);
        }
      } else if (role === 'DRIVER') {
        client.join('drivers_active');
        client.join(`driver_${userId}`);
        await this.deliveryService.setOnlineStatus(userId, true);
      } else if (role === 'CLIENT') {
        const orderId = client.handshake.query.orderId;
        if (orderId) {
          client.join(`order_${orderId}`);
        }
      }
      
      this.logger.log(`Client connected: ${client.id} (User: ${userId}, Role: ${role})`);
    } catch (error) {
      this.logger.error(`Connection failed: ${error.message}`);
      client.emit('error', { message: 'Unauthorized' });
      client.disconnect();
    }
  }

  async handleDisconnect(client: Socket) {
    const user = client.data?.user;
    if (user && user.role === 'DRIVER') {
       const userId = user.sub || user.userId || user.id;
       await this.deliveryService.setOnlineStatus(userId, false);
    }
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  private extractToken(client: Socket): string | null {
    const authHeader = client.handshake.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      return authHeader.substring(7);
    }
    const queryToken = client.handshake.query.token as string;
    if (queryToken) return queryToken;
    const authObj = client.handshake.auth?.token;
    if (authObj) return authObj;
    return null;
  }

  @SubscribeMessage('update_location')
  async handleUpdateLocation(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { orderId?: string; lat: number; lng: number }
  ) {
    try {
      const user = client.data.user;
      if (!user || user.role !== 'DRIVER') return;
      
      const userId = user.sub || user.userId || user.id;
      
      await this.deliveryService.updateDriverLocation(userId, data.lat, data.lng);
      
      if (data.orderId) {
        this.server.to(`order_${data.orderId}`).emit('driver_location', { lat: data.lat, lng: data.lng });
      }
    } catch (error) {
      this.logger.error(`Error updating location: ${error.message}`);
      client.emit('error', { message: 'Failed to update location' });
    }
  }

  @OnEvent('order.created')
  async handleOrderCreated(payload: { order: any; commerceLocation?: { lat: number; lng: number }; commerceName: string }) {
    const { order, commerceLocation, commerceName } = payload;
    
    // 1. Emitir al comercio
    this.server.to(`commerce_${order.commerceId}`).emit('new_order', { orderId: order.id });
    
    // 2. Broadcastear a los drivers cercanos (Hito 1 y 3)
    if (commerceLocation) {
      try {
        const drivers = await this.logisticsService.findNearbyDrivers(commerceLocation.lat, commerceLocation.lng, 3);
        
        for (const driver of drivers) {
           const offerPayload = {
              orderId: order.id,
              commerceName: commerceName,
              pickupLocation: commerceLocation,
              dropoffAddress: order.dropoffAddress,
              deliveryFee: order.deliveryFee,
              distanceToCommerce: driver.distance // metros
           };
           this.server.to(`driver_${driver.userId}`).emit('order_offer', offerPayload);
        }
      } catch(e) {
        this.logger.error(`Error broadcasting order offer: ${e.message}`);
      }
    }
  }
}
