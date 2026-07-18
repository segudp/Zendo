import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class LogisticsService {
  constructor(private readonly prisma: PrismaService) {}

  async findNearbyCommerces(lat: number, lng: number, radiusKm: number) {
    const radiusMeters = radiusKm * 1000;
    const commerces = await this.prisma.$queryRaw`
      SELECT c.id, c.name, c.address, 
             ST_X(c.location::geometry) as lng, 
             ST_Y(c.location::geometry) as lat,
             ST_DistanceSphere(c.location::geometry, ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326)) as distance
      FROM commerces c
      WHERE c.is_active = true 
        AND c.is_open = true
        AND c.location IS NOT NULL
        AND ST_DWithin(c.location::geography, ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326)::geography, ${radiusMeters})
      ORDER BY distance ASC;
    `;
    return commerces;
  }

  async findNearbyDrivers(commerceLat: number, commerceLng: number, radiusKm: number = 3) {
    const radiusMeters = radiusKm * 1000;
    const drivers = await this.prisma.$queryRaw`
      SELECT d.id, d.user_id as "userId", ST_X(d.current_location::geometry) as lng, ST_Y(d.current_location::geometry) as lat,
             ST_DistanceSphere(d.current_location::geometry, ST_SetSRID(ST_MakePoint(${commerceLng}, ${commerceLat}), 4326)) as distance
      FROM drivers d
      WHERE d.is_online = true
        AND d.current_location IS NOT NULL
        AND ST_DWithin(d.current_location::geography, ST_SetSRID(ST_MakePoint(${commerceLng}, ${commerceLat}), 4326)::geography, ${radiusMeters})
      ORDER BY distance ASC;
    `;
    return drivers as Array<{ id: string, userId: string, lng: number, lat: number, distance: number }>;
  }
}
