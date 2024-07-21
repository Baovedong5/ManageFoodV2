import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { genSaltSync, hashSync, compareSync } from 'bcryptjs';
import { Account } from './entities/account.entity';
import { Repository } from 'typeorm';
import { ChangePasswordDto } from './dto/change-password.dto';
import { UpdateMeDto } from './dto/update-me.dto';

@Injectable()
export class AccountsService {
  constructor(
    @InjectRepository(Account)
    private accountRepository: Repository<Account>,
  ) {}

  getHashPassword(password: string) {
    const salt = genSaltSync(10);
    const hash = hashSync(password, salt);
    return hash;
  }

  isValidPassword(password: string, hassPassword: string) {
    return compareSync(password, hassPassword);
  }

  async findUserByToken(refreshToken: string) {
    return await this.accountRepository.findOne({
      where: {
        refreshToken,
      },
    });
  }

  async findOneByUsername(username: string) {
    return await this.accountRepository.findOne({
      where: {
        email: username,
      },
    });
  }

  async updateMe(id: number, body: UpdateMeDto) {
    return await this.accountRepository.update(
      { id },
      {
        ...body,
      },
    );
  }

  async updateUserRefreshToken(refreshToken: string, id: number) {
    return await this.accountRepository.update(
      { id },
      {
        refreshToken,
      },
    );
  }

  async changePasswordAccount(id: number, body: ChangePasswordDto) {
    const account = await this.accountRepository.findOneOrFail({
      where: {
        id,
      },
    });

    const isSamePassword = this.isValidPassword(
      body.oldPassword,
      account.password,
    );

    if (!isSamePassword) {
      throw new BadRequestException('Old password is incorrect');
    }

    const hashPassword = this.getHashPassword(body.newPassword);

    const updatePassword = await this.accountRepository.update(
      {
        id,
      },
      {
        password: hashPassword,
      },
    );

    return updatePassword;
  }
}
