import { Module } from '@nestjs/common';
import { SocketsService } from './sockets.service';
import { SocketsController } from './sockets.controller';

@Module({
  controllers: [SocketsController],
  providers: [SocketsService],
})
export class SocketsModule {}
