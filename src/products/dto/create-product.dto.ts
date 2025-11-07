import { IsString, IsNumber, IsOptional, IsPositive } from 'class-validator';

export class CreateProductDto {
  @IsString()
  name: string;

  @IsString()
  description: string;

  @IsNumber()
  @IsPositive()
  price: number;

  @IsString()
  category: string;

  @IsNumber()
  @IsPositive()
  stock: number;

  @IsString()
  @IsOptional()
  imageUrl?: string;
}
