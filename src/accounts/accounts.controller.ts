import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { AccountsService } from './accounts.service';
import { ResponseMessage, Roles, User } from 'src/decorators/customize';
import { Role } from 'src/constants/enum';
import { CreateEmployeeAccountDto } from './dto/create-employee-account.dto';
import { IUser } from './user.interface';
import { UpdateAccountEmployeeDto } from './dto/update-account-employee.dto';
import { CreateGuestAccountDto } from './dto/create-guest-account.dto';
import { GetGuestListQueryDto } from './dto/guest-query.dto';

@Controller('accounts')
export class AccountsController {
  constructor(private readonly accountsService: AccountsService) {}

  @Roles(Role.Owner)
  @ResponseMessage('Lấy danh sách nhân viên thành công')
  @Get()
  getAllEmployees() {
    return this.accountsService.getAllEmployees();
  }

  @Roles(Role.Owner, Role.Employee)
  @ResponseMessage('Lấy danh sách khách thành công')
  @Get('/guests')
  getGuestList(@Query() query: GetGuestListQueryDto) {
    return this.accountsService.getGuestList(query);
  }

  @Roles(Role.Owner)
  @ResponseMessage('Lấy thông tin nhân viên thành công')
  @Get(':id')
  getInfoEmployee(@Param('id') id: string) {
    return this.accountsService.getInformationEmployee(+id);
  }

  @Roles(Role.Owner)
  @ResponseMessage('Tạo tài khoản thành công')
  @Post()
  create(@Body() body: CreateEmployeeAccountDto) {
    return this.accountsService.createEmployeeAccount(body);
  }

  @Roles(Role.Owner, Role.Employee)
  @ResponseMessage('Tạo tài khoản khách thành công')
  @Post('/guests')
  createGuestAccount(@Body() body: CreateGuestAccountDto) {
    return this.accountsService.createGuestAccount(body);
  }

  @Roles(Role.Owner)
  @ResponseMessage('Cập nhật tài khoản thành công')
  @Patch(':id')
  updateEmployee(
    @Param('id') id: string,
    @Body() updatEmployeeDto: UpdateAccountEmployeeDto,
  ) {
    return this.accountsService.updateAccountEmployee(+id, updatEmployeeDto);
  }

  @Roles(Role.Owner)
  @ResponseMessage('Xóa tài khoản thành công')
  @Delete(':id')
  deleteAccount(@Param('id') id: string) {
    return this.accountsService.deleteAccount(+id);
  }
}
