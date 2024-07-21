import { DishStatus } from 'src/constants/enum';
import { DishSnapshot } from 'src/dishsnapshots/entities/dishsnapshot.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Dish {
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

  @Column({
    type: 'enum',
    enum: DishStatus,
    default: DishStatus.Available,
  })
  status: string;

  @OneToMany(() => DishSnapshot, (dishSnapshot) => dishSnapshot.dish)
  dishSnapshots: DishSnapshot[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
