import { IsString, IsOptional, IsBoolean, IsUrl, IsNotEmpty } from 'class-validator';

export class CreateCommerceDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsUrl()
  @IsOptional()
  logoUrl?: string;

  @IsString()
  @IsNotEmpty()
  address: string;
}
