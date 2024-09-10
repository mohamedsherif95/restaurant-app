import { IsArray, IsInt, IsNumber, IsObject, IsPhoneNumber, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class ItemDto {
  @IsString()
  name: string;

  @IsNumber()
  price: number;

  @IsNumber()
  @IsInt()
  quantity: number;
}

class CustomerDto {
  @IsString()
  name: string;

  @IsString()
  @IsPhoneNumber('EG')
  phone: string;

  @IsString()
  email: string;
}

export class CreateOrderDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ItemDto)
  items: ItemDto[];

  @IsObject()
  @ValidateNested()
  @Type(() => CustomerDto)
  customer: CustomerDto;
}
