import { TableStatus } from 'src/constants/enum';
import { Guest } from 'src/guests/entities/guest.entity';
import { Order } from 'src/orders/entities/order.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Table {
  @PrimaryColumn()
  number: number;

  @Column()
  capacity: number;

  @OneToMany(() => Order, (order) => order.table)
  orders: Order[];

  @OneToMany(() => Guest, (guest) => guest.table)
  guests: Guest[];

  @Column({
    type: 'enum',
    enum: TableStatus,
    default: TableStatus.Available,
  })
  status: string;

  @Column()
  token: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
