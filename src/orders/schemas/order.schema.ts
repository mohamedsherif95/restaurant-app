import { Prop, raw, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';


@Schema({timestamps: true})
export class Order {
    @Prop([String])
    items: string[];
    
    @Prop()
    price: number;
    
    @Prop(raw({
        name: { type: String },
        phone: { type: Number },
        email: { type: String },
    }))
    customer: Record<string, any>;
}

export type OrderDocument = HydratedDocument<Order>;
export const OrderSchema = SchemaFactory.createForClass(Order);