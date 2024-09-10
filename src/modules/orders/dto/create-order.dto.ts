import { IsArray, IsInt, IsNumber, IsObject, IsPhoneNumber, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class ItemDto {
  @IsString()
  name: string;

  @IsNumber()
  price: number;

  @IsNumber()
  @IsInt()
  quantity: number;
}

export class CustomerDto {
  @IsString()
  name: string;

  @IsString()
  @IsPhoneNumber('EG')
  phone: string;

  @IsString()
  email: string;
}

export class CreateOrderDto {
  @ApiProperty({
    description: 'List of items in the order',
    example: [
      { name: 'Item A', price: 25, quantity: 2 },
      { name: 'Item B', price: 15, quantity: 1 }
    ],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ItemDto)
  items: ItemDto[];

  @ApiProperty({
    description: 'Customer details',
    example: {
      name: 'John Doe',
      phone: '01012345678',
      email: 'johndoe@example.com'
    },
  })
  @IsObject()
  @ValidateNested()
  @Type(() => CustomerDto)
  customer: CustomerDto;
}
