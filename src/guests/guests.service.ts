import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Guest } from './entities/guest.entity';
import { DataSource, Repository } from 'typeorm';
import { GuestLoginDto } from './dto/guest-login.dto';
import { Table } from 'src/tables/entities/table.entity';
import { DishStatus, OrderStatus, Role, TableStatus } from 'src/constants/enum';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import ms from 'ms';
import { Response } from 'express';
import { IUser } from 'src/accounts/user.interface';
import { guestCreateOrderDto } from './dto/guest-create-order.dto';
import { Order } from 'src/orders/entities/order.entity';
import { Dish } from 'src/dishs/entities/dish.entity';
import { DishSnapshot } from 'src/dishsnapshots/entities/dishsnapshot.entity';
import { EventGateway } from 'src/sockets/gateways/event.gateway';
import { ManagerRoom } from 'src/constants/type';

@Injectable()
export class GuestsService {
  constructor(
    @InjectRepository(Guest)
    private guestRepository: Repository<Guest>,

    @InjectRepository(Table)
    private tableRepository: Repository<Table>,

    @InjectRepository(Order)
    private orderRepository: Repository<Order>,

    private jwtService: JwtService,

    private configService: ConfigService,

    private dataSource: DataSource,

    private eventGateway: EventGateway,
  ) {}

  async guestLogin(body: GuestLoginDto, response: Response) {
    const table = await this.tableRepository.findOne({
      where: {
        number: body.tableNumber,
        token: body.token,
      },
    });

    if (!table) {
      throw new BadRequestException('Table does not exist or token is invalid');
    }

    if (table.status === TableStatus.Hidden) {
      throw new BadRequestException(
        'Table is hidden, please choose another table',
      );
    }

    if (table.status === TableStatus.Reserved) {
      throw new BadRequestException(
        'The table has been previously installed, please contact staff for assistance',
      );
    }

    let guest = await this.guestRepository.save({
      name: body.name,
      tableNumber: body.tableNumber,
    });

    const payload = {
      sub: 'guest login',
      iss: 'from server',
      id: guest.id,
      role: Role.Guest,
    };

    //create access token
    const access_token = this.jwtService.sign(payload);

    //create refresh token for guest
    const refresh_token = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_REFRESH_TOKEN_SECRET'),
      expiresIn:
        ms(this.configService.get<string>('GUEST_JWT_REFRESH_EXPIRE')) / 1000,
    });

    //set refresh token in cookie
    response.cookie('guest_refresh_token', refresh_token, {
      httpOnly: true,
      maxAge: ms(this.configService.get<string>('GUEST_JWT_REFRESH_EXPIRE')),
    });

    //update guest with refresh token
    await this.guestRepository.update(
      {
        id: guest.id,
      },
      {
        refreshToken: refresh_token,
      },
    );

    return {
      access_token,
      guest: {
        id: guest.id,
        name: guest.name,
        tableNumber: guest.tableNumber,
        role: Role.Guest,
        createdAt: guest.createdAt,
        updatedAt: guest.updatedAt,
      },
    };
  }

  async guestLogout(response: Response, user: IUser) {
    await this.guestRepository.update(
      {
        id: user.id,
      },
      {
        refreshToken: null,
      },
    );

    response.clearCookie('guest_refresh_token');

    return {
      message: 'success',
    };
  }

  async guestRefreshToken(guestRefreshToken: string, response: Response) {
    try {
      this.jwtService.verify(guestRefreshToken, {
        secret: this.configService.get<string>('JWT_REFRESH_TOKEN_SECRET'),
      });

      let guest = await this.guestRepository.findOne({
        where: {
          refreshToken: guestRefreshToken,
        },
      });

      if (guest) {
        const payload = {
          sub: 'guest token refresh',
          iss: 'from server',
          id: guest.id,
          role: Role.Guest,
        };

        const guest_refresh_token = this.jwtService.sign(payload, {
          secret: this.configService.get<string>('JWT_REFRESH_TOKEN_SECRET'),
          expiresIn:
            ms(this.configService.get<string>('GUEST_JWT_REFRESH_EXPIRE')) /
            1000,
        });

        await this.guestRepository.update(
          { id: guest.id },
          { refreshToken: guest_refresh_token },
        );

        //clear old refresh token
        response.clearCookie('guest_refresh_token');

        //set cookie with new refresh token
        response.cookie('guest_refresh_token', guest_refresh_token, {
          httpOnly: true,
          maxAge: ms(
            this.configService.get<string>('GUEST_JWT_REFRESH_EXPIRE'),
          ),
        });

        return {
          access_token: this.jwtService.sign(payload),
          guest: {
            id: guest.id,
            name: guest.name,
            tableNumber: guest.tableNumber,
            role: Role.Guest,
            createdAt: guest.createdAt,
            updatedAt: guest.updatedAt,
          },
        };
      } else {
        throw new BadRequestException('Refresh token is invalid. Please login');
      }
    } catch (error) {
      throw new BadRequestException('Refresh token is invalid. Please login');
    }
  }

  async guestCreateOrder(body: guestCreateOrderDto[], user: IUser) {
    return await this.dataSource.transaction(async (manager) => {
      const orderRepository = manager.getRepository(Order);
      const dishRepository = manager.getRepository(Dish);
      const dishSnapshotRepository = manager.getRepository(DishSnapshot);

      const guest = await this.guestRepository.findOneOrFail({
        where: {
          id: user.id,
        },
      });

      if (guest.tableNumber === null) {
        throw new BadRequestException(
          'Your table has been deleted, please log out and log in again to a new table',
        );
      }

      const table = await this.tableRepository.findOneOrFail({
        where: {
          number: guest.tableNumber,
        },
      });

      if (table.status === TableStatus.Hidden) {
        throw new BadRequestException(
          'Table is hidden, please log out and choose another table',
        );
      }

      if (table.status === TableStatus.Reserved) {
        throw new BadRequestException(
          'Table is reserved, please log out and contact staff for assistance',
        );
      }

      const orders = await Promise.all(
        body.map(async (order) => {
          const dish = await dishRepository.findOneOrFail({
            where: {
              id: order.dishId,
            },
          });

          if (dish.status === DishStatus.Unavailable) {
            throw new BadRequestException(`Dish ${dish.name} is unavailable`);
          }

          if (dish.status === DishStatus.Hidden) {
            throw new BadRequestException(`Dish ${dish.name} is hidden`);
          }

          const dishSnapshot = await dishSnapshotRepository.save({
            description: dish.description,
            image: dish.image,
            name: dish.name,
            price: dish.price,
            dishId: dish.id,
            status: dish.status,
          });

          const orderRecord = await orderRepository.save({
            dishSnapshotId: dishSnapshot.id,
            guestId: guest.id,
            quantity: order.quantity,
            tableNumber: guest.tableNumber,
            orderHandlerId: null,
            status: OrderStatus.Pending,
          });

          return {
            ...orderRecord,
            status: orderRecord.status,
            guest: {
              ...guest,
            },
            dishSnapshot: {
              ...dishSnapshot,
              status: dishSnapshot.status,
            },
          };
        }),
      );

      this.eventGateway.handleEmitSocket({
        data: orders,
        event: 'new-order',
        to: ManagerRoom,
      });

      return orders;
    });
  }

  async guestGetListOrder(user: IUser) {
    return this.orderRepository.find({
      where: {
        guestId: user.id,
      },
      relations: {
        dishSnapshot: true,
        orderHandler: true,
        guest: true,
      },
    });
  }
}
