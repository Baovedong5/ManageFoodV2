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
  @ResponseMessage('Create dish successfully!')
  @Post()
  create(@Body() createDishDto: CreateDishDto) {
    return this.dishsService.create(createDishDto);
  }

  @Public()
  @ResponseMessage('Get list dish successfully!')
  @Get()
  findAll() {
    return this.dishsService.findAll();
  }

  @Public()
  @ResponseMessage('Get infomation dish successfully!')
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.dishsService.findOne(+id);
  }

  @Roles(Role.Owner, Role.Employee)
  @ResponseMessage('Update dish successfully!')
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDishDto: UpdateDishDto) {
    return this.dishsService.update(+id, updateDishDto);
  }

  @Roles(Role.Owner, Role.Employee)
  @ResponseMessage('Delete dish successfully!')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.dishsService.remove(+id);
  }
}
