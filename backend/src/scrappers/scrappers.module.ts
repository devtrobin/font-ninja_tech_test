import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Scrapper } from './scrapper.model';
import { ScrappersController } from './scrappers.controller';
import { ScrappersService } from './scrappers.service';

@Module({
  imports: [SequelizeModule.forFeature([Scrapper])],
  controllers: [ScrappersController],
  providers: [ScrappersService],
})
export class ScrappersModule {}
