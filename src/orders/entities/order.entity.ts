import { Account } from 'src/accounts/entities/account.entity';
import { OrderStatus } from 'src/constants/enum';
import { DishSnapshot } from 'src/dishsnapshots/entities/dishsnapshot.entity';
import { Guest } from 'src/guests/entities/guest.entity';
import { Table } from 'src/tables/entities/table.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Order {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  guestId: number;

  @ManyToOne(() => Guest, (guest) => guest.orders, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'guestId' })
  guest: Guest;

  @Column({ nullable: true })
  tableNumber: number;

  @ManyToOne(() => Table, (table) => table.orders, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'tableNumber' })
  table: Table;

  @OneToOne(() => DishSnapshot, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'dishSnapshotId' })
  dishSnapshot: DishSnapshot;

  @Column()
  dishSnapshotId: number;

  @Column()
  quantity: number;

  @Column({ nullable: true })
  orderHandlerId: number;

  @ManyToOne(() => Account, (account) => account.orders, {
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'orderHandlerId' })
  orderHandler: Account;

  @Column({
    type: 'enum',
    enum: OrderStatus,
    default: OrderStatus.Pending,
  })
  status: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
