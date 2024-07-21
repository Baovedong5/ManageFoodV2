import { Controller } from '@nestjs/common';
import { SocketsService } from './sockets.service';

@Controller('sockets')
export class SocketsController {
  constructor(private readonly socketsService: SocketsService) {}
}
