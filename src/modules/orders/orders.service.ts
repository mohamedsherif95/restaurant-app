import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Order } from './schemas/order.schema';
import { Model } from 'mongoose';
import * as moment from 'moment';
import { CacheService } from '../cache/cache.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { CacheInvalidatedEvent } from '../../types/events';
import { redisKeys } from '../../configs/constants';

@Injectable()
export class OrdersService {
  constructor(
    @InjectModel(Order.name) private orderModel: Model<Order>,
    private readonly eventEmmitter: EventEmitter2,
  ) {}

  async findAll() {
    return this.orderModel.find();
  }

  async findOne(id: string) {
    return this.orderModel.findById(id);
  }
  
  async create(createOrderDto: CreateOrderDto) {
    const documentData: Order = {
      ...createOrderDto,
      totalPrice: createOrderDto.items.reduce((acc, curr) => acc += (curr.price * curr.quantity), 0),
    }
    const order = await this.orderModel.create(documentData);
    this.eventEmmitter.emitAsync(CacheInvalidatedEvent.eventName, new CacheInvalidatedEvent(redisKeys.SALES_REPORT));
    
    return order;
  }

  async update(id: string, updateOrderDto: UpdateOrderDto) {
    const updateData: Partial<Order> = {...updateOrderDto};
    if (updateOrderDto.items?.length) updateData.totalPrice = updateOrderDto.items.reduce((acc, curr) => acc += (curr.price * curr.quantity), 0);

    const updatedOrder = await this.orderModel.findByIdAndUpdate(id, updateData, { new: true });

  if (!updatedOrder) {
    throw new NotFoundException(`Order with ID ${id} not found`);
  }
  this.eventEmmitter.emitAsync(CacheInvalidatedEvent.eventName, new CacheInvalidatedEvent(redisKeys.SALES_REPORT));

  return updatedOrder;
  }

  async generateDailySalesReport(date?: Date): Promise<any> {
    const reportDate = date ? new Date(date) : new Date();

    const startOfDay = moment(reportDate).startOf('day').toDate();
    const endOfDay = moment(reportDate).endOf('day').toDate();

    const report = await this.orderModel.aggregate([
      {
          $match: {
              createdAt: {
                  $gte: startOfDay,
                  $lt: endOfDay
              }
          }
      },
      {
          $facet: {
              salesStats: [
                  {
                      $group: {
                          _id: null,
                          totalOrders: { $sum: 1 },
                          totalRevenue: { $sum: "$totalPrice" }
                      }
                  }
              ],
              topSellingItems: [
                  { $unwind: "$items" },
                  {
                      $group: {
                          _id: "$items.name",
                          totalQuantity: { $sum: "$items.quantity" }
                      }
                  },
                  { $sort: { totalQuantity: -1 } },
                  { $limit: 10 },
                  { 
                    $project: {
                      _id: 0,
                      name: "$_id",
                      totalQuantity: 1
                    }
                  }
              ]
          }
      },
      {
        $project: {
            totalOrders: { $arrayElemAt: ["$salesStats.totalOrders", 0] },
            totalRevenue: { $arrayElemAt: ["$salesStats.totalRevenue", 0] },
            topSellingItems: 1
        }
      }
    ]);

    return {
      date: startOfDay.toISOString().slice(0, 10),
      totalRevenue: report[0]?.totalRevenue || 0,
      totalOrders: report[0]?.totalOrders || 0,
      topSellingItems: report[0]?.topSellingItems || [],
    };
  }
}
