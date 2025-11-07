import { Controller, Post, Get, Body, Param, UseGuards, Request } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('orders')
export class OrdersController {
  constructor(private ordersService: OrdersService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(@Body() createOrderDto: CreateOrderDto, @Request() req) {
    return this.ordersService.create(req.user.sub, req.user.email, createOrderDto);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async findOne(@Param('id') id: string) {
    return this.ordersService.findById(id);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  async findByUser(@Request() req) {
    return this.ordersService.findByUserId(req.user.sub);
  }
}
