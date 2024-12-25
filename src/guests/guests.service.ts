import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Guest } from './entities/guest.entity';
import { DataSource, In, Repository } from 'typeorm';
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
import { SocketIo } from 'src/sockets/entities/socket.entity';

@Injectable()
export class GuestsService {
  constructor(
    @InjectRepository(Guest)
    private guestRepository: Repository<Guest>,

    @InjectRepository(Table)
    private tableRepository: Repository<Table>,

    @InjectRepository(Order)
    private orderRepository: Repository<Order>,

    @InjectRepository(SocketIo)
    private socketIoRepository: Repository<SocketIo>,

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
      throw new BadRequestException(
        'Bàn không tồn tại hoặc mã token không đúng',
      );
    }

    if (table.status === TableStatus.Hidden) {
      throw new BadRequestException(
        'Bàn này đã bị ẩn, hãy chọn bàn khác để đăng nhập',
      );
    }

    if (table.status === TableStatus.Reserved) {
      throw new BadRequestException(
        'Bàn đã được đặt trước, hãy liên hệ nhân viên để được hỗ trợ',
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
      refresh_token,
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

  async guestRefreshToken(refresh_token: string) {
    try {
      this.jwtService.verify(refresh_token, {
        secret: this.configService.get<string>('JWT_REFRESH_TOKEN_SECRET'),
      });

      let guest = await this.guestRepository.findOne({
        where: {
          refreshToken: refresh_token,
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

        return {
          access_token: this.jwtService.sign(payload),
          refresh_token: guest_refresh_token,
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
        console.log('A');

        throw new BadRequestException('Refresh token is invalid. Please login');
      }
    } catch (error) {
      console.log('B');

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
          'Bàn của bạn đã bị xóa, vui lòng đăng xuất và đăng nhập lại một bàn mới',
        );
      }

      const table = await this.tableRepository.findOneOrFail({
        where: {
          number: guest.tableNumber,
        },
      });

      if (table.status === TableStatus.Hidden) {
        throw new BadRequestException(
          `Bàn ${table.number} đã bị ẩn, vui lòng đăng xuất và chọn bàn khác`,
        );
      }

      if (table.status === TableStatus.Reserved) {
        throw new BadRequestException(
          `Bàn ${table.number} đã được đặt trước, vui lòng đăng xuất và chọn bàn khác`,
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
            throw new BadRequestException(`Món ${dish.name} đã hết`);
          }

          if (dish.status === DishStatus.Hidden) {
            throw new BadRequestException(`Món ${dish.name} không thể đặt`);
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

      // this.eventGateway.handleEmitSocket({
      //   data: orders,
      //   event: 'new-order',
      //   to: ManagerRoom,
      // });

      return orders;
    });
  }

  async guestGetListOrder(user: IUser) {
    return await this.orderRepository.find({
      where: {
        guestId: user.id,
      },
      order: {
        createdAt: 'DESC',
      },
      relations: {
        dishSnapshot: true,
        orderHandler: true,
        guest: true,
      },
    });
  }

  async guestPayment(body: { guestId: number; paymentRef: string }) {
    const { guestId, paymentRef } = body;

    const orders = await this.orderRepository.find({
      where: {
        guestId,
        status: In([
          OrderStatus.Pending,
          OrderStatus.Processing,
          OrderStatus.Delivered,
        ]),
      },
    });

    if (orders.length === 0) {
      throw new BadRequestException('Không có hóa đơn nào cần thanh toán');
    }

    await this.dataSource.transaction(async (manager) => {
      const orderIds = orders.map((order) => order.id);
      await manager.update(
        Order,
        {
          id: In(orderIds),
        },
        {
          paymentRef: paymentRef,
        },
      );
    });

    const [ordersResult, socketRecord] = await Promise.all([
      this.orderRepository.find({
        where: {
          id: In(orders.map((order) => order.id)),
        },
        relations: {
          dishSnapshot: true,
          orderHandler: true,
          guest: true,
        },
        order: {
          createdAt: 'DESC',
        },
      }),
      this.socketIoRepository.findOne({
        where: {
          guestId,
        },
      }),
    ]);

    if (socketRecord?.socketId) {
      this.eventGateway.handleEmitSocketFrom({
        data: ordersResult,
        event: 'payment-vnpay',
        to: socketRecord.socketId,
        from: ManagerRoom,
      });
    } else {
      this.eventGateway.handleEmitSocket({
        data: ordersResult,
        event: 'payment-vnpay',
        to: ManagerRoom,
      });
    }

    return {
      orders: ordersResult,
      paymentRef: paymentRef,
      socketId: socketRecord?.socketId,
    };
  }
}
