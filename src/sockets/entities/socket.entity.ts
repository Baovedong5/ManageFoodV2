import { Account } from 'src/accounts/entities/account.entity';
import { Guest } from 'src/guests/entities/guest.entity';
import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';

@Entity()
export class SocketIo {
  @PrimaryColumn()
  socketId: string;

  @Column({ nullable: true, unique: true })
  accountId: number;

  @ManyToOne(() => Account, (user) => user.sockets, {
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'userId' })
  user: Account;

  @Column({ nullable: true, unique: true })
  guestId: number;

  @ManyToOne(() => Guest, (guest) => guest.sockets, {
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'guestId' })
  guest: Guest;
}
