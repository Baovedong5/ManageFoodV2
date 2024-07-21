import { Order } from 'src/orders/entities/order.entity';
import { SocketIo } from 'src/sockets/entities/socket.entity';
import { Table } from 'src/tables/entities/table.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Guest {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @ManyToOne(() => Table, (table) => table.guests, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'tableNumber' })
  table: Table;

  @Column({ nullable: true })
  tableNumber: number;

  @OneToMany(() => Order, (order) => order.guest)
  orders: Order[];

  @OneToMany(() => SocketIo, (socket) => socket.guest)
  sockets: SocketIo[];

  @Column({ nullable: true })
  refreshToken: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
