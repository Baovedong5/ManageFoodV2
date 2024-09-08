import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateTableDto } from './dto/create-table.dto';
import { UpdateTableDto } from './dto/update-table.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Table } from './entities/table.entity';
import { Repository, DataSource } from 'typeorm';
import { randomId } from 'src/utils/helper';
import { Guest } from 'src/guests/entities/guest.entity';

@Injectable()
export class TablesService {
  constructor(
    @InjectRepository(Table)
    private tableRepository: Repository<Table>,

    @InjectRepository(Guest)
    private guestRepository: Repository<Guest>,

    private dataSource: DataSource,
  ) {}

  async create(createTableDto: CreateTableDto) {
    const token = randomId();

    const tableExist = await this.tableRepository.findOne({
      where: {
        number: createTableDto.number,
      },
    });

    if (tableExist) {
      throw new BadRequestException('Table already exists');
    }

    const table = await this.tableRepository.save({
      ...createTableDto,
      token,
    });

    return table;
  }

  async findAll() {
    return await this.tableRepository.find({
      order: {
        createdAt: 'DESC',
      },
    });
  }

  async findOne(number: number) {
    const table = await this.tableRepository.findOne({
      where: {
        number,
      },
    });

    if (!table) {
      throw new BadRequestException('Table does not exist');
    }

    return table;
  }

  async update(number: number, updateTableDto: UpdateTableDto) {
    const { changeToken, ...dataUpdate } = updateTableDto;

    if (changeToken) {
      const token = randomId();

      return this.dataSource.transaction(async (manager) => {
        const tableRepository = manager.getRepository(Table);
        const guestRepository = manager.getRepository(Guest);

        const [table] = await Promise.all([
          tableRepository.update(
            {
              number,
            },
            {
              status: dataUpdate.status,
              capacity: dataUpdate.capacity,
              token,
            },
          ),
          guestRepository.update(
            {
              tableNumber: number,
            },
            {
              refreshToken: null,
            },
          ),
        ]);

        return table;
      });
    }

    return await this.tableRepository.update(
      {
        number,
      },
      {
        status: dataUpdate.status,
        capacity: dataUpdate.capacity,
      },
    );
  }

  async remove(number: number) {
    return this.tableRepository.delete({ number });
  }
}
