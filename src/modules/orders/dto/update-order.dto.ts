import { IsArray, IsInt, IsNumber, IsObject, IsOptional, IsPhoneNumber, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { CustomerDto, ItemDto } from './create-order.dto';

export class UpdateOrderDto {
    @ApiProperty({
        description: 'List of items in the order',
        example: [
          { name: 'Item A', price: 25, quantity: 2 },
          { name: 'Item B', price: 15, quantity: 1 }
        ],
        required: false
      })
      @IsOptional()
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
        required: false
      })
      @IsOptional()
      @IsObject()
      @ValidateNested()
      @Type(() => CustomerDto)
      customer: CustomerDto;
}
