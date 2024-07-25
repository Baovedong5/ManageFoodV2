import { InjectRepository } from '@nestjs/typeorm';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';
import { SocketIo } from '../entities/socket.entity';
import { Repository } from 'typeorm';
import { AuthService } from 'src/auth/auth.service';
import { Role } from 'src/constants/enum';
import { ManagerRoom } from 'src/constants/type';

@WebSocketGateway()
export class EventGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(
    @InjectRepository(SocketIo)
    private socketRepository: Repository<SocketIo>,

    private authService: AuthService,
  ) {}

  handleEmitSocket({ data, event, to }) {
    this.server.to(to).emit(event, data);
  }

  async handleConnection(socket: Socket) {
    const authHeader = socket.handshake.headers.authorization;

    const accessToken = authHeader.split(' ')[1];

    if (authHeader && accessToken) {
      try {
        const decoded = this.authService.verifyToken(accessToken);

        const { id, role } = decoded;

        if (role === Role.Guest) {
          await this.socketRepository.upsert(
            {
              socketId: socket.id,
              guestId: id,
            },
            ['guestId'],
          );
        } else {
          await this.socketRepository.upsert(
            {
              socketId: socket.id,
              accountId: id,
            },
            ['accountId'],
          );

          socket.join(ManagerRoom);
        }

        socket.handshake.auth.decoded = decoded;
      } catch (error) {
        throw error;
      }
    }
  }

  handleDisconnect(socket: Socket) {
    console.log(`🔌 Socket disconnected: ${socket.id}`);
  }
}
