import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Order } from './entities/order.entity';
import { Between, DataSource, In, Repository } from 'typeorm';
import { IUser } from 'src/accounts/user.interface';
import { Guest } from 'src/guests/entities/guest.entity';
import { Table } from 'src/tables/entities/table.entity';
import { DishStatus, OrderStatus, TableStatus } from 'src/constants/enum';
import { Dish } from 'src/dishs/entities/dish.entity';
import { DishSnapshot } from 'src/dishsnapshots/entities/dishsnapshot.entity';
import { SocketIo } from 'src/sockets/entities/socket.entity';
import { EventGateway } from 'src/sockets/gateways/event.gateway';
import { ManagerRoom } from 'src/constants/type';
import { queryOrderDto } from './dto/query-order.dto';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,

    @InjectRepository(Guest)
    private guestRepository: Repository<Guest>,

    @InjectRepository(Table)
    private tableRepository: Repository<Table>,

    @InjectRepository(Dish)
    private dishRepository: Repository<Dish>,

    @InjectRepository(SocketIo)
    private socketIoRepository: Repository<SocketIo>,

    @InjectRepository(DishSnapshot)
    private dishSnapshotRepository: Repository<DishSnapshot>,

    private dataSource: DataSource,

    private eventGateway: EventGateway,
  ) {}

  async create(body: CreateOrderDto, user: IUser) {
    const { guestId, orders } = body;

    const guest = await this.guestRepository.findOneOrFail({
      where: {
        id: guestId,
      },
    });

    if (guest.tableNumber === null) {
      throw new BadRequestException(
        'The table associated with this customer has been deleted, please choose another customer!',
      );
    }

    const table = await this.tableRepository.findOneOrFail({
      where: {
        number: guest.tableNumber,
      },
    });

    if (table.status === TableStatus.Hidden) {
      throw new BadRequestException(
        'The table associated with this customer has been hidden, please choose another customer!',
      );
    }

    const [ordersRecord, socketRecord] = await Promise.all([
      this.dataSource.transaction(async (manager) => {
        const ordersRecord = await Promise.all(
          orders.map(async (order) => {
            const dish = await this.dishRepository.findOneOrFail({
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

            const dishSnapshot = await this.dishSnapshotRepository.save({
              description: dish.description,
              name: dish.name,
              price: dish.price,
              image: dish.image,
              dishId: dish.id,
              status: dish.status,
            });

            const orderRecord = await this.orderRepository.save({
              dishSnapshotId: dishSnapshot.id,
              guestId,
              quantity: order.quantity,
              tableNumber: guest.tableNumber,
              orderHandlerId: user.id,
              status: OrderStatus.Pending,
            });

            type OrderRecord = typeof orderRecord;
            return orderRecord as OrderRecord & {
              status: (typeof OrderStatus)[keyof typeof OrderStatus];
              dishSnapshot: OrderRecord['dishSnapshot'] & {
                status: (typeof DishStatus)[keyof typeof DishStatus];
              };
            };
          }),
        );

        return ordersRecord;
      }),
      this.socketIoRepository.findOne({
        where: {
          guestId,
        },
      }),
    ]);

    if (socketRecord?.socketId) {
      this.eventGateway.handleEmitSocketFrom({
        data: ordersRecord,
        event: 'new-order',
        to: ManagerRoom,
        from: socketRecord.socketId,
      });
    } else {
      this.eventGateway.handleEmitSocket({
        data: ordersRecord,
        event: 'new-order',
        to: ManagerRoom,
      });
    }

    return {
      orders: ordersRecord,
      socketId: socketRecord?.socketId,
    };
  }

  async getListOrder(query: queryOrderDto) {
    const { fromDate, toDate } = query;

    const orders = await this.orderRepository.find({
      where: {
        createdAt: Between(fromDate, toDate),
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

    return orders;
  }

  async getOrderDetail(orderId: number) {
    const order = await this.orderRepository.findOneOrFail({
      where: {
        id: orderId,
      },
      relations: {
        dishSnapshot: true,
        orderHandler: true,
        guest: true,
      },
    });
  }

  async updateOrder(
    orderId: number,
    body: UpdateOrderDto,
    orderHandler: IUser,
  ) {
    const { dishId, quantity, status } = body;

    const result = await this.dataSource.transaction(async (manager) => {
      const order = await this.orderRepository.findOneOrFail({
        where: {
          id: orderId,
        },
        relations: {
          dishSnapshot: true,
        },
      });

      let dishSnapshotId = order.dishSnapshotId;

      if (order.dishSnapshot.dishId !== dishId) {
        const dish = await this.dishRepository.findOneOrFail({
          where: {
            id: dishId,
          },
        });

        const dishSnapshot = await this.dishSnapshotRepository.save({
          description: dish.description,
          name: dish.name,
          price: dish.price,
          image: dish.image,
          dishId: dish.id,
          status: dish.status,
        });

        dishSnapshotId = dishSnapshot.id;
      }

      await this.orderRepository.update(
        {
          id: orderId,
        },
        {
          status,
          quantity,
          dishSnapshotId,
          orderHandlerId: orderHandler.id,
        },
      );

      return this.orderRepository.findOneOrFail({
        where: {
          id: orderId,
        },
        relations: {
          dishSnapshot: true,
          orderHandler: true,
          guest: true,
        },
      });
    });

    const socketRecord = await this.socketIoRepository.findOne({
      where: {
        guestId: result.guestId,
      },
    });

    if (socketRecord?.socketId) {
      this.eventGateway.handleEmitSocketFrom({
        data: result,
        event: 'update-order',
        to: socketRecord.socketId,
        from: ManagerRoom,
      });
    } else {
      this.eventGateway.handleEmitSocket({
        data: result,
        event: 'update-order',
        to: ManagerRoom,
      });
    }

    return {
      order: result,
      socketId: socketRecord?.socketId,
    };
  }

  async paymentOrder(guestId: number, orderHandler: IUser) {
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
      throw new BadRequestException('No orders to pay');
    }

    await this.dataSource.transaction(async (manager) => {
      const orderIds = orders.map((order) => order.id);
      await manager.update(
        Order,
        {
          id: In(orderIds),
        },
        {
          status: OrderStatus.Paid,
          orderHandlerId: orderHandler.id,
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
        event: 'payment',
        to: socketRecord.socketId,
        from: ManagerRoom,
      });
    } else {
      this.eventGateway.handleEmitSocket({
        data: ordersResult,
        event: 'payment',
        to: ManagerRoom,
      });
    }

    return {
      orders: ordersResult,
      socketId: socketRecord?.socketId,
    };
  }
}
