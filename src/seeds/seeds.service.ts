import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { AccountsService } from 'src/accounts/accounts.service';
import { Account } from 'src/accounts/entities/account.entity';
import { Role } from 'src/constants/enum';
import { Repository } from 'typeorm';

@Injectable()
export class SeedsService implements OnModuleInit {
  private readonly logger = new Logger(SeedsService.name);

  constructor(
    @InjectRepository(Account)
    private userRepository: Repository<Account>,

    private accountService: AccountsService,

    private configService: ConfigService,
  ) {}

  async onModuleInit() {
    const isInit = this.configService.get<string>('SHOULD_INIT');

    if (Boolean(isInit)) {
      const countUser = await this.userRepository.count({});

      if (countUser === 0) {
        await this.userRepository.save([
          {
            name: 'Owner',
            email: 'admin@gmail.com',
            password: this.accountService.getHashPassword(
              this.configService.get<string>('INIT_PASSWORD'),
            ),
            role: Role.Owner,
          },
          {
            name: 'Employee',
            email: 'employee@gmail.com',
            password: this.accountService.getHashPassword(
              this.configService.get<string>('INIT_PASSWORD'),
            ),
            role: Role.Employee,
          },
        ]);
      }

      if (countUser > 0) {
        this.logger.log('>>> ALREADY INITIALIZED SAMPLE DATA...');
      }
    }
  }
}
