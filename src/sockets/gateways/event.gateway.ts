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

@WebSocketGateway({
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
    credentials: true,
  },
})
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

  handleEmitSocketFrom({ data, event, to, from }) {
    this.server.to(to).to(from).emit(event, data);
  }

  async handleConnection(socket: Socket) {
    const authHeader = socket.handshake.auth.Authorization;

    console.log(authHeader);

    const accessToken = authHeader?.split(' ')[1];

    console.log('accessToken', accessToken);

    if (authHeader && accessToken) {
      try {
        const decoded = this.authService.verifyToken(accessToken);
        console.log(decoded);

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
        socket.disconnect();
      }
    }

    console.log(`🔌 Socket connected: ${socket.id}`);
  }

  handleDisconnect(socket: Socket) {
    console.log(`🔌 Socket disconnected: ${socket.id}`);
  }
}
