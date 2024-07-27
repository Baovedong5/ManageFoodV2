import { Injectable } from '@nestjs/common';
import { QueryIndicatorDto } from './dto/query-indicator.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Order } from 'src/orders/entities/order.entity';
import { Between, Repository } from 'typeorm';
import { Guest } from 'src/guests/entities/guest.entity';
import { Dish } from 'src/dishs/entities/dish.entity';
import { OrderStatus } from 'src/constants/enum';
import { format } from 'date-fns';

@Injectable()
export class IndicatorService {
  constructor(
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,

    @InjectRepository(Guest)
    private guestRepository: Repository<Guest>,

    @InjectRepository(Dish)
    private dishRepository: Repository<Dish>,
  ) {}

  async dashboardIndicator(query: QueryIndicatorDto) {
    const { fromDate, toDate } = query;

    const [orders, guests, dishes] = await Promise.all([
      this.orderRepository.find({
        where: {
          createdAt: Between(fromDate, toDate),
        },
        relations: {
          dishSnapshot: true,
          table: true,
        },
        order: {
          createdAt: 'DESC',
        },
      }),
      this.guestRepository.find({
        where: {
          createdAt: Between(fromDate, toDate),
          orders: {
            status: OrderStatus.Paid,
          },
        },
      }),
      this.dishRepository.find(),
    ]);

    //Doanh thu
    let revenue = 0;
    //Số lượng khách gọi món thành công
    const guestCount = guests.length;
    //Số lượng đơn
    const orderCount = orders.length;
    //Thống kê món ăn
    const dishIndicatorObj: Record<
      number,
      {
        id: number;
        name: string;
        price: number;
        description: string;
        status: string;
        createdAt: Date;
        updatedAt: Date;
        successOrders: number; // Số lượng đã đặt thành công
      }
    > = dishes.reduce((acc, dish) => {
      acc[dish.id] = { ...dish, successOrders: 0 };
      return acc;
    }, {});

    //Doanh thu theo ngày
    // Tạo object revenueByDateObj với key là ngày từ fromDate -> toDate và value là doanh thu
    const revenueByDateObj: { [key: string]: number } = {};

    // Lặp từ fromDate -> toDate
    for (let i = new Date(fromDate); i <= toDate; i.setDate(i.getDate() + 1)) {
      revenueByDateObj[format(i, 'dd/MM/yyyy')] = 0;
    }

    // Số lượng bàn đang được sử dụng
    const tableNumberObj: { [key: number]: boolean } = {};
    orders.forEach((order) => {
      if (order.status === OrderStatus.Paid) {
        revenue += order.dishSnapshot.price * order.quantity;
        if (
          order.dishSnapshot.dishId &&
          dishIndicatorObj[order.dishSnapshot.dishId]
        ) {
          dishIndicatorObj[order.dishSnapshot.dishId].successOrders++;
        }

        const date = format(order.createdAt, 'dd/MM/yyyy');
        revenueByDateObj[date] += order.dishSnapshot.price * order.quantity;
      }
      if (
        [
          OrderStatus.Processing,
          OrderStatus.Pending,
          OrderStatus.Delivered,
        ].includes(order.status as OrderStatus) &&
        order.tableNumber !== null
      ) {
        tableNumberObj[order.tableNumber] = true;
      }
    });

    //Số lượng bàn đang sử dụng
    const servingTableCount = Object.keys(tableNumberObj).length;

    // Doanh thu theo ngày
    const revenueByDate = Object.keys(revenueByDateObj).map((date) => {
      return {
        date,
        revenue: revenueByDateObj[date],
      };
    });

    const dishIndicator = Object.values(dishIndicatorObj);

    return {
        revenue,
        guestCount,
        orderCount,
        servingTableCount,
        dishIndicator,
        revenueByDate
      }
  }
}
