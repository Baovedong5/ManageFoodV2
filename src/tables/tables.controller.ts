import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { TablesService } from './tables.service';
import { CreateTableDto } from './dto/create-table.dto';
import { UpdateTableDto } from './dto/update-table.dto';
import { Public, ResponseMessage, Roles } from 'src/decorators/customize';
import { Role } from 'src/constants/enum';

@Controller('tables')
export class TablesController {
  constructor(private readonly tablesService: TablesService) {}

  @Roles(Role.Owner, Role.Employee)
  @ResponseMessage('Create table successfully')
  @Post()
  create(@Body() createTableDto: CreateTableDto) {
    return this.tablesService.create(createTableDto);
  }

  @Public()
  @ResponseMessage('Get list table successfully')
  @Get()
  findAll() {
    return this.tablesService.findAll();
  }

  @Public()
  @ResponseMessage("Get table's detail successfully")
  @Get(':number')
  findOne(@Param('number') number: string) {
    return this.tablesService.findOne(+number);
  }

  @Roles(Role.Owner, Role.Employee)
  @ResponseMessage('Update table successfully')
  @Patch(':number')
  update(
    @Param('number') number: string,
    @Body() updateTableDto: UpdateTableDto,
  ) {
    return this.tablesService.update(+number, updateTableDto);
  }

  @Roles(Role.Owner, Role.Employee)
  @ResponseMessage('Delete table successfully')
  @Delete(':number')
  remove(@Param('number') number: string) {
    return this.tablesService.remove(+number);
  }
}
