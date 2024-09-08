import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { genSaltSync, hashSync, compareSync } from 'bcryptjs';
import { Account } from './entities/account.entity';
import { Between, Not, Repository } from 'typeorm';
import { ChangePasswordDto } from './dto/change-password.dto';
import { UpdateMeDto } from './dto/update-me.dto';
import { IUser } from './user.interface';
import { CreateEmployeeAccountDto } from './dto/create-employee-account.dto';
import { Role, TableStatus } from 'src/constants/enum';
import { UpdateAccountEmployeeDto } from './dto/update-account-employee.dto';
import { SocketIo } from 'src/sockets/entities/socket.entity';
import { EventGateway } from 'src/sockets/gateways/event.gateway';
import { CreateGuestAccountDto } from './dto/create-guest-account.dto';
import { Table } from 'src/tables/entities/table.entity';
import { Guest } from 'src/guests/entities/guest.entity';
import { GetGuestListQueryDto } from './dto/guest-query.dto';

@Injectable()
export class AccountsService {
  constructor(
    @InjectRepository(Account)
    private accountRepository: Repository<Account>,

    @InjectRepository(SocketIo)
    private socketRepository: Repository<SocketIo>,

    @InjectRepository(Table)
    private tableRepository: Repository<Table>,

    @InjectRepository(Guest)
    private guestRepository: Repository<Guest>,

    private eventGateway: EventGateway,
  ) {}

  getHashPassword(password: string) {
    const salt = genSaltSync(10);
    const hash = hashSync(password, salt);
    return hash;
  }

  isValidPassword(password: string, hassPassword: string) {
    return compareSync(password, hassPassword);
  }

  async getAllEmployees(user: IUser) {
    const { id } = user;
    const listEmployee = await this.accountRepository.find({
      order: {
        createdAt: 'desc',
      },
      where: { id: Not(id) },
      select: ['id', 'email', 'name', 'role', 'avatar'],
    });

    return listEmployee;
  }

  async getGuestList(query: GetGuestListQueryDto) {
    const { fromDate, toDate } = query;

    if (fromDate && toDate) {
      return await this.guestRepository.find({
        where: {
          createdAt: Between(fromDate, toDate),
        },
        order: {
          createdAt: 'desc',
        },
        select: ['id', 'name', 'tableNumber', 'createdAt', 'updatedAt'],
      });
    } else {
      return await this.guestRepository.find({
        order: {
          createdAt: 'desc',
        },
        select: ['id', 'name', 'tableNumber', 'createdAt', 'updatedAt'],
      });
    }
  }

  async getInformationEmployee(id: number) {
    const account = await this.accountRepository.findOneOrFail({
      where: {
        id,
      },
      select: ['id', 'name', 'email', 'avatar', 'role'],
    });

    return account;
  }

  async findUserByToken(refreshToken: string) {
    return await this.accountRepository.findOne({
      where: {
        refreshToken,
      },
    });
  }

  async findOneByUsername(username: string) {
    return await this.accountRepository.findOne({
      where: {
        email: username,
      },
    });
  }

  async getMe(id: number) {
    const account = await this.accountRepository.findOne({
      where: {
        id,
      },
      select: ['id', 'name', 'email', 'avatar', 'role'],
    });

    if (!account) {
      throw new BadRequestException('Account not found');
    }

    return account;
  }

  async createEmployeeAccount(body: CreateEmployeeAccountDto) {
    try {
      const hashPassword = this.getHashPassword(body.password);
      const account = this.accountRepository.create({
        name: body.name,
        email: body.email,
        password: hashPassword,
        role: Role.Employee,
        avatar: body.avatar,
      });

      await this.accountRepository.save(account);

      return {
        id: account.id,
        name: account.name,
        email: account.email,
        avatar: account.avatar,
        role: account.role,
      };
    } catch (error) {
      if (error.code === '23505') {
        throw new BadRequestException('Email already exists');
      }
      throw error;
    }
  }

  async createGuestAccount(body: CreateGuestAccountDto) {
    const table = await this.tableRepository.findOne({
      where: {
        number: body.tableNumber,
      },
    });

    if (!table) {
      throw new BadRequestException('Table is not exist!');
    }

    if (table.status === TableStatus.Hidden) {
      throw new BadRequestException(
        `Table is ${table.number} hidden, please choose another table!`,
      );
    }

    const guest = await this.guestRepository.save({
      name: body.name,
      tableNumber: body.tableNumber,
    });

    return {
      id: guest.id,
      name: guest.name,
      tableNumber: guest.tableNumber,
      role: Role.Guest,
      createdAt: guest.createdAt,
      updatedAt: guest.updatedAt,
    };
  }

  async updateMe(id: number, body: UpdateMeDto) {
    return await this.accountRepository.save({
      id,
      name: body.name,
      avatar: body.avatar,
    });
  }

  async updateUserRefreshToken(refreshToken: string, id: number) {
    return await this.accountRepository.update(
      { id },
      {
        refreshToken,
      },
    );
  }

  async updateAccountEmployee(id: number, body: UpdateAccountEmployeeDto) {
    try {
      const { changePassword, ...updateData } = body;

      const [socketRecord, oldAccount] = await Promise.all([
        this.socketRepository.findOne({
          where: {
            accountId: id,
          },
        }),
        this.accountRepository.findOne({
          where: {
            id,
          },
        }),
      ]);

      if (!oldAccount) {
        throw new BadRequestException(
          'The account you are trying to update no longer exists!',
        );
      }

      const isChangeRole = oldAccount.role !== updateData.role;

      let account;

      if (changePassword) {
        const hashPassword = this.getHashPassword(updateData.password);

        account = await this.accountRepository.update(
          {
            id,
          },
          {
            name: updateData.name,
            email: updateData.email,
            avatar: updateData.avatar,
            password: hashPassword,
            role: updateData.role,
          },
        );
      } else {
        account = await this.accountRepository.update(
          {
            id,
          },
          {
            name: updateData.name,
            email: updateData.email,
            avatar: updateData.avatar,
            role: updateData.role,
          },
        );
      }

      if (isChangeRole && socketRecord?.socketId) {
        this.eventGateway.handleEmitSocket({
          data: account,
          event: 'refresh-token',
          to: socketRecord?.socketId,
        });
      }

      return account;
    } catch (error) {
      if (error.code === '23505') {
        throw new BadRequestException('Email already exists');
      }
      throw error;
    }
  }

  async changePasswordAccount(id: number, body: ChangePasswordDto) {
    const account = await this.accountRepository.findOneOrFail({
      where: {
        id,
      },
    });

    const isSamePassword = this.isValidPassword(
      body.oldPassword,
      account.password,
    );

    if (!isSamePassword) {
      throw new BadRequestException('Old password is incorrect');
    }

    const hashPassword = this.getHashPassword(body.newPassword);

    const updatePassword = await this.accountRepository.update(
      {
        id,
      },
      {
        password: hashPassword,
      },
    );

    return updatePassword;
  }

  async deleteAccount(id: number) {
    const [socketRecord, account] = await Promise.all([
      this.socketRepository.findOne({
        where: {
          accountId: id,
        },
      }),
      this.accountRepository.delete({
        id,
      }),
    ]);

    if (socketRecord?.socketId) {
      this.eventGateway.handleEmitSocket({
        data: account,
        event: 'logout',
        to: socketRecord?.socketId,
      });
    }

    return account;
  }
}
