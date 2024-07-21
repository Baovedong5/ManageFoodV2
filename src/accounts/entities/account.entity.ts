import { Role } from 'src/constants/enum';
import { Order } from 'src/orders/entities/order.entity';
import { SocketIo } from 'src/sockets/entities/socket.entity';
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
export class Account {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({ nullable: true })
  avatar: string;

  @Column({
    type: 'enum',
    enum: Role,
    default: Role.Employee,
  })
  role: Role;

  @OneToMany(() => Order, (order) => order.orderHandler)
  orders: Order[];

  @Column({ nullable: true })
  refreshToken: string;

  @ManyToOne(() => Account, (account) => account.employees, {
    nullable: true,
    onDelete: 'SET NULL',
    onUpdate: 'NO ACTION',
  })
  @JoinColumn({
    name: 'ownerId',
  })
  owner: Account;

  @Column({ nullable: true })
  ownerId: number;

  @OneToMany(() => Account, (user) => user.owner)
  employees: Account[];

  @OneToMany(() => SocketIo, (socket) => socket.user)
  sockets: SocketIo[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
