import { Type } from 'class-transformer';
import { IsString, IsNotEmpty, IsArray, ValidateNested, IsNumber, Min, IsOptional } from 'class-validator';

export class OrderItemDto {
  @IsString()
  @IsNotEmpty()
  productId: string;

  @IsNumber()
  @Min(1)
  quantity: number;
}

export class DropoffLocationDto {
  @IsNumber()
  lat: number;

  @IsNumber()
  lng: number;
}

export class CreateOrderDto {
  @IsString()
  @IsNotEmpty()
  commerceId: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];

  @IsString()
  @IsNotEmpty()
  dropoffAddress: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => DropoffLocationDto)
  dropoffLocation?: DropoffLocationDto;
}
