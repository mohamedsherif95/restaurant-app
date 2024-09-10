import { Prop, raw, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';


@Schema({timestamps: true})
export class Order {
    @Prop([{
        name: String,
        price: Number,
        quantity: Number
    }])
    items: Array<Record<string, any>>;

    @Prop()
    totalPrice: number;
    
    @Prop(raw({
        name: { type: String },
        phone: { type: String },
        email: { type: String },
    }))
    customer: Record<string, any>;
}

export type OrderDocument = HydratedDocument<Order>;
export const OrderSchema = SchemaFactory.createForClass(Order);