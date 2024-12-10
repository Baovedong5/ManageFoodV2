import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { DishsService } from './dishs.service';
import { CreateDishDto } from './dto/create-dish.dto';
import { UpdateDishDto } from './dto/update-dish.dto';
import { Public, ResponseMessage, Roles } from 'src/decorators/customize';
import { Role } from 'src/constants/enum';

@Controller('dishs')
export class DishsController {
  constructor(private readonly dishsService: DishsService) {}

  @Roles(Role.Owner, Role.Employee)
  @ResponseMessage('Tạo món ăn thành công!')
  @Post()
  create(@Body() createDishDto: CreateDishDto) {
    return this.dishsService.create(createDishDto);
  }

  @Public()
  @ResponseMessage('Lấy danh sách món ăn thành công!')
  @Get()
  findAll() {
    return this.dishsService.findAll();
  }

  @Public()
  @ResponseMessage('Lấy thông tin món ăn thành công!')
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.dishsService.findOne(+id);
  }

  @Roles(Role.Owner, Role.Employee)
  @ResponseMessage('Cập nhật món ăn thành công!')
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDishDto: UpdateDishDto) {
    return this.dishsService.update(+id, updateDishDto);
  }

  @Roles(Role.Owner, Role.Employee)
  @ResponseMessage('Xóa món ăn thành công!')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.dishsService.remove(+id);
  }
}
