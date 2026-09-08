import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DeliveryService {
  constructor(private readonly prisma: PrismaService) {}

  async updateDriverLocation(userId: string, lat: number, lng: number) {
    // Utilizamos $executeRaw ya que Prisma no soporta actualizaciones con PostGIS de forma nativa
    await this.prisma.$executeRaw`
      UPDATE drivers
      SET current_location = ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326)
      WHERE user_id = ${userId}::uuid;
    `;
    return { lat, lng };
  }

  async setOnlineStatus(userId: string, isOnline: boolean) {
    return this.prisma.driver.update({
      where: { userId },
      data: { isOnline },
    });
  }
}
