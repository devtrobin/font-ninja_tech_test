import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';
import {
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CreateScrapperDto } from './dto/create-scrapper.dto';
import { UpdateScrapperDto } from './dto/update-scrapper.dto';
import { Scrapper } from './scrapper.model';
import { ScrappersService } from './scrappers.service';

@ApiTags('scrappers')
@Controller('scrappers')
export class ScrappersController {
  constructor(private readonly scrappersService: ScrappersService) {}

  @Post()
  @ApiCreatedResponse({
    description: 'Crée un scrapper.',
    type: Scrapper,
  })
  create(@Body() createScrapperDto: CreateScrapperDto): Promise<Scrapper> {
    return this.scrappersService.create(createScrapperDto);
  }

  @Get()
  @ApiOkResponse({
    description: 'Retourne tous les scrappers.',
    type: Scrapper,
    isArray: true,
  })
  findAll(): Promise<Scrapper[]> {
    return this.scrappersService.findAll();
  }

  @Get(':id')
  @ApiOkResponse({
    description: 'Retourne un scrapper.',
    type: Scrapper,
  })
  @ApiNotFoundResponse({
    description: "Le scrapper n'existe pas.",
  })
  findOne(@Param('id', ParseIntPipe) id: number): Promise<Scrapper> {
    return this.scrappersService.findOne(id);
  }

  @Patch(':id')
  @ApiOkResponse({
    description: 'Met à jour un scrapper.',
    type: Scrapper,
  })
  @ApiNotFoundResponse({
    description: "Le scrapper n'existe pas.",
  })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateScrapperDto: UpdateScrapperDto,
  ): Promise<Scrapper> {
    return this.scrappersService.update(id, updateScrapperDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiNoContentResponse({
    description: 'Supprime un scrapper.',
  })
  @ApiNotFoundResponse({
    description: "Le scrapper n'existe pas.",
  })
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.scrappersService.remove(id);
  }
}
