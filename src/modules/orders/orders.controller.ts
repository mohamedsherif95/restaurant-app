import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors } from '@nestjs/common';
import { CacheInterceptor, CacheKey } from '@nestjs/cache-manager';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { Order } from './schemas/order.schema';
import { redisConfigs } from '../../configs/constants';
import { ApiBody, ApiOperation, ApiParam, ApiResponse, ApiTags, PartialType } from '@nestjs/swagger';


@ApiTags('orders')
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @ApiOperation({ summary: 'Create an order' })
  @ApiBody({
    type: CreateOrderDto,
    description: "Create order input data"
  })
  @ApiResponse({
    status: 201,
    description: 'The created order data',
    type: Order,
  })
  @Post()
  async create(@Body() createOrderDto: CreateOrderDto): Promise<Order>  {
    return this.ordersService.create(createOrderDto);
  }

  @ApiOperation({ summary: 'Get all orders' })
  @ApiResponse({
    status: 200,
    description: 'Get all orders',
    type: [Order],
  })
  @Get()
  async findAll(): Promise<Order[]> {
    return this.ordersService.findAll();
  }

  @ApiOperation({ summary: 'Get a single order' })
  @ApiParam({name: 'id', type: String})
  @ApiResponse({
    status: 200,
    description: 'Get a single order',
    type: Order,
  })
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.ordersService.findOne(id);
  }

  @ApiOperation({ summary: 'Update a single order' })
  @ApiParam({name: 'id', type: String})
  @ApiBody({
    type: UpdateOrderDto,
    description: "Update order input data"
  })
  @ApiResponse({
    status: 200,
    description: 'Update a single order',
    type: Order,
  })
  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateOrderDto: UpdateOrderDto) {
    return this.ordersService.update(id, updateOrderDto);
  }

  @ApiOperation({ summary: 'Generate the daily sales report' })
  @ApiResponse({
    status: 200,
    description: 'Generate the daily sales report',
    example: {
      "date": "2024-09-10",
      "totalRevenue": 7500,
      "totalOrders": 3,
      "topSellingItems": [
        {
            "totalQuantity": 2,
            "name": "soup"
        }
      ]
    },
  })
  @Get('/reports/salesDaily')
  @UseInterceptors(CacheInterceptor)
  @CacheKey(redisConfigs.keys.SALES_REPORT)
  async generateDailySalesReport() {
    return this.ordersService.generateDailySalesReport();
  }
}
