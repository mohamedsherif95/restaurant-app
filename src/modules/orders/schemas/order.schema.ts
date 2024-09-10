import { Prop, raw, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

@Schema({ timestamps: true })
export class Order {
  
  @ApiProperty({
    description: 'List of items in the order',
    example: [
      { name: 'Item A', price: 25, quantity: 2 },
      { name: 'Item B', price: 15, quantity: 1 }
    ],
  })
  @Prop([{
    name: String,
    price: Number,
    quantity: Number
  }])
  items: Array<Record<string, any>>;

  @ApiProperty({
    description: 'Total price of the order',
    example: 65,
  })
  @Prop()
  totalPrice: number;

  @ApiProperty({
    description: 'Customer details',
    example: {
      name: 'John Doe',
      phone: '01012345678',
      email: 'johndoe@example.com'
    },
  })
  @Prop(raw({
    name: { type: String },
    phone: { type: String },
    email: { type: String },
  }))
  customer: Record<string, any>;
}

export type OrderDocument = HydratedDocument<Order>;
export const OrderSchema = SchemaFactory.createForClass(Order);