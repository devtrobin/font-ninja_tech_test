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
  Query,
} from '@nestjs/common';
import {
  ApiQuery,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Article } from './article.model';
import { ArticlesService } from './articles.service';
import { CreateArticleDto } from './dto/create-article.dto';
import { GetArticlesQueryDto } from './dto/get-articles-query.dto';
import { UpdateArticleDto } from './dto/update-article.dto';

@ApiTags('articles')
@Controller('articles')
export class ArticlesController {
  constructor(private readonly articlesService: ArticlesService) {}

  @Post()
  @ApiCreatedResponse({
    description: 'Crée un article.',
    type: Article,
  })
  create(@Body() createArticleDto: CreateArticleDto): Promise<Article> {
    return this.articlesService.create(createArticleDto);
  }

  @Get()
  @ApiQuery({
    name: 'days',
    required: false,
    type: Number,
    description:
      'Filtre les articles dont la date de publication est antérieure au nombre de jours indiqué',
  })
  @ApiOkResponse({
    description: 'Retourne tous les articles.',
    type: Article,
    isArray: true,
  })
  findAll(@Query() query: GetArticlesQueryDto): Promise<Article[]> {
    return this.articlesService.findAll(query);
  }

  @Get(':id')
  @ApiOkResponse({
    description: 'Retourne un article.',
    type: Article,
  })
  @ApiNotFoundResponse({
    description: "L'article n'existe pas.",
  })
  findOne(@Param('id', ParseIntPipe) id: number): Promise<Article> {
    return this.articlesService.findOne(id);
  }

  @Patch(':id')
  @ApiOkResponse({
    description: 'Met à jour un article.',
    type: Article,
  })
  @ApiNotFoundResponse({
    description: "L'article n'existe pas.",
  })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateArticleDto: UpdateArticleDto,
  ): Promise<Article> {
    return this.articlesService.update(id, updateArticleDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiNoContentResponse({
    description: 'Supprime un article.',
  })
  @ApiNotFoundResponse({
    description: "L'article n'existe pas.",
  })
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.articlesService.remove(id);
  }
}
