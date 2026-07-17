import { PartialType } from '@nestjs/mapped-types';
import { CreateCommerceDto } from './create-commerce.dto';
import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateCommerceDto extends PartialType(CreateCommerceDto) {
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsBoolean()
  @IsOptional()
  isOpen?: boolean;
}
