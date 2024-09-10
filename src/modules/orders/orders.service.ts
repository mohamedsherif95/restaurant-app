import {
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateOrderDto, ItemDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Order } from './schemas/order.schema';
import { Model } from 'mongoose';
import * as moment from 'moment';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { CacheInvalidatedEvent } from '../../types/events';
import { redisConfigs, reportsConfig } from '../../configs/constants';

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
    try {
      const documentData: Order = {
        ...createOrderDto,
        totalPrice: this.calculateOrderTotalPrice(createOrderDto.items),
      };
      const order = await this.orderModel.create(documentData);
      this.eventEmmitter.emitAsync(
        CacheInvalidatedEvent.eventName,
        new CacheInvalidatedEvent(redisConfigs.keys.SALES_REPORT),
      );

      return order;
    } catch (err) {
      const msg = 'Something went wrong while adding the order data';
      console.error(msg, err);
      throw new HttpException(msg, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async update(id: string, updateOrderDto: UpdateOrderDto) {
    const updateData: Partial<Order> = { ...updateOrderDto };
    if (updateOrderDto.items?.length) updateData.totalPrice = this.calculateOrderTotalPrice(updateOrderDto.items);

    const updatedOrder = await this.orderModel.findByIdAndUpdate(
      id,
      updateData,
      { new: true },
    );

    if (!updatedOrder) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }
    this.eventEmmitter.emitAsync(
      CacheInvalidatedEvent.eventName,
      new CacheInvalidatedEvent(redisConfigs.keys.SALES_REPORT),
    );

    return updatedOrder;
  }

  async generateDailySalesReport(date?: Date) {
    const reportDate = date ? new Date(date) : new Date();

    const startOfDay = moment(reportDate).startOf('day').toDate();
    const endOfDay = moment(reportDate).endOf('day').toDate();
    try {
      const report = await this.orderModel.aggregate([
        {
          $match: {
            createdAt: {
              $gte: startOfDay,
              $lt: endOfDay,
            },
          },
        },
        {
          $facet: {
            salesStats: [
              {
                $group: {
                  _id: null,
                  totalOrders: { $sum: 1 },
                  totalRevenue: { $sum: '$totalPrice' },
                },
              },
            ],
            topSellingItems: [
              { $unwind: '$items' },
              {
                $group: {
                  _id: '$items.name',
                  totalQuantity: { $sum: '$items.quantity' },
                },
              },
              { $sort: { totalQuantity: -1 } },
              { $limit: reportsConfig.topSellingItemsCount },
              {
                $project: {
                  _id: 0,
                  name: '$_id',
                  totalQuantity: 1,
                },
              },
            ],
          },
        },
        {
          $project: {
            totalOrders: { $arrayElemAt: ['$salesStats.totalOrders', 0] },
            totalRevenue: { $arrayElemAt: ['$salesStats.totalRevenue', 0] },
            topSellingItems: 1,
          },
        },
      ]);

      return {
        date: startOfDay.toISOString().slice(0, 10),
        totalRevenue: report[0]?.totalRevenue || 0,
        totalOrders: report[0]?.totalOrders || 0,
        topSellingItems: report[0]?.topSellingItems || [],
      };
    } catch (err) {
      const msg = 'Something went wrong while calculating the sales report';
      console.error(msg, err);
      throw new HttpException(msg, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  calculateOrderTotalPrice(items: ItemDto[]) {
    return items.reduce(
      (acc, curr) => (acc += curr.price * curr.quantity),
      0,
    )
  }
}
