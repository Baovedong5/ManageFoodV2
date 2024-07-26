import { Module } from '@nestjs/common';
import { TablesService } from './tables.service';
import { TablesController } from './tables.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Table } from './entities/table.entity';
import { Guest } from 'src/guests/entities/guest.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Table, Guest])],
  controllers: [TablesController],
  providers: [TablesService],
})
export class TablesModule {}
