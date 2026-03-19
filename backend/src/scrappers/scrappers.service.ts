import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { CreateScrapperDto } from './dto/create-scrapper.dto';
import { UpdateScrapperDto } from './dto/update-scrapper.dto';
import { Scrapper } from './scrapper.model';

@Injectable()
export class ScrappersService {
  constructor(
    @InjectModel(Scrapper)
    private readonly scrapperModel: typeof Scrapper,
  ) {}

  async create(createScrapperDto: CreateScrapperDto): Promise<Scrapper> {
    return this.scrapperModel.create({
      scrapperId: createScrapperDto.scrapperId,
      dateStatusChange: new Date(createScrapperDto.dateStatusChange),
      state: createScrapperDto.state,
    });
  }

  async findAll(): Promise<Scrapper[]> {
    return this.scrapperModel.findAll({
      order: [
        ['dateStatusChange', 'DESC'],
        ['id', 'ASC'],
      ],
    });
  }

  async findOne(id: number): Promise<Scrapper> {
    const scrapper = await this.scrapperModel.findByPk(id);

    if (!scrapper) {
      throw new NotFoundException(`Scrapper ${id} not found`);
    }

    return scrapper;
  }

  async update(id: number, updateScrapperDto: UpdateScrapperDto): Promise<Scrapper> {
    const scrapper = await this.findOne(id);

    await scrapper.update({
      state: updateScrapperDto.state,
      dateStatusChange: new Date(),
    });

    return scrapper;
  }

  async remove(id: number): Promise<void> {
    const scrapper = await this.findOne(id);
    await scrapper.destroy();
  }
}
