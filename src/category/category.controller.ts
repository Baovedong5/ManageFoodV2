import { Controller, Get } from '@nestjs/common';
import { CategoryService } from './category.service';

import { Public, ResponseMessage } from 'src/decorators/customize';

@Controller('category')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Public()
  @ResponseMessage('Lấy danh sách danh mục thành công')
  @Get()
  findAll() {
    return this.categoryService.findAll();
  }
}
