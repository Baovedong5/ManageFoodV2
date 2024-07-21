import { Dish } from 'src/dishs/entities/dish.entity';
import { Order } from 'src/orders/entities/order.entity';
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
export class DishSnapshot {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  price: number;

  @Column()
  description: string;

  @Column()
  image: string;

  @Column({ default: 'Available' })
  status: string;

  @Column({ nullable: true })
  dishId: number;

  @ManyToOne(() => Dish, (dish) => dish.dishSnapshots, {
    onDelete: 'SET NULL',
    onUpdate: 'NO ACTION',
  })
  @JoinColumn({ name: 'dishId' })
  dish: Dish;

  @OneToOne(() => Order, (order) => order.dishSnapshot, {
    onDelete: 'SET NULL',
  })
  order: Order;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
