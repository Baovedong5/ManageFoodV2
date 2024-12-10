import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
} from '@nestjs/common';
import { VnpayService } from './vnpay.service';
import { CreateVnpayDto } from './dto/create-vnpay.dto';
import { UpdateVnpayDto } from './dto/update-vnpay.dto';
import { Request } from 'express';
import { Public, ResponseMessage } from 'src/decorators/customize';

@Controller('vnpay')
export class VnpayController {
  constructor(private readonly vnpayService: VnpayService) {}

  @Public()
  @ResponseMessage('Tạo url thanh toán thành công')
  @Post('payment-url')
  createPaymentUrl(
    @Body() createVnpayDto: CreateVnpayDto,
    @Req() request: Request,
  ) {
    return this.vnpayService.createUrl(createVnpayDto, request);
  }

  @Post()
  create(@Body() createVnpayDto: CreateVnpayDto) {
    return this.vnpayService.create(createVnpayDto);
  }

  @Get()
  findAll() {
    return this.vnpayService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.vnpayService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateVnpayDto: UpdateVnpayDto) {
    return this.vnpayService.update(+id, updateVnpayDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.vnpayService.remove(+id);
  }
}
