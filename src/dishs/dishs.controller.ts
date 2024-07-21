import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { DishsService } from './dishs.service';
import { CreateDishDto } from './dto/create-dish.dto';
import { UpdateDishDto } from './dto/update-dish.dto';

@Controller('dishs')
export class DishsController {
  constructor(private readonly dishsService: DishsService) {}

  @Post()
  create(@Body() createDishDto: CreateDishDto) {
    return this.dishsService.create(createDishDto);
  }

  @Get()
  findAll() {
    return this.dishsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.dishsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDishDto: UpdateDishDto) {
    return this.dishsService.update(+id, updateDishDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.dishsService.remove(+id);
  }
}
