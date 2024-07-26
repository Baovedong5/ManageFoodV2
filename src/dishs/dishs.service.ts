import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateDishDto } from './dto/create-dish.dto';
import { UpdateDishDto } from './dto/update-dish.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Dish } from './entities/dish.entity';
import { Repository } from 'typeorm';

@Injectable()
export class DishsService {
  constructor(
    @InjectRepository(Dish)
    private dishRepository: Repository<Dish>,
  ) {}

  async create(createDishDto: CreateDishDto) {
    return await this.dishRepository.save({ ...createDishDto });
  }

  async findAll() {
    return await this.dishRepository.find({
      order: {
        createdAt: 'DESC',
      },
    });
  }

  async findOne(id: number) {
    const dish = await this.dishRepository.findOne({
      where: {
        id,
      },
    });

    if (!dish) {
      throw new BadRequestException('Dish not found');
    }

    return dish;
  }

  async update(id: number, updateDishDto: UpdateDishDto) {
    return await this.dishRepository.update(id, { ...updateDishDto });
  }

  async remove(id: number) {
    return await this.dishRepository.delete(id);
  }
}
