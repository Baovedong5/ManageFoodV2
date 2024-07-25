import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SocketIo } from './entities/socket.entity';
import { AuthModule } from 'src/auth/auth.module';
import { EventGateway } from './gateways/event.gateway';

@Module({
  imports: [TypeOrmModule.forFeature([SocketIo]), AuthModule],
  providers: [EventGateway],
  exports: [EventGateway],
})
export class SocketsModule {}
