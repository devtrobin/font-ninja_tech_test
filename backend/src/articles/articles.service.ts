import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import moment from 'moment';
import { Op, type WhereOptions } from 'sequelize';
import { Article } from './article.model';
import { CheckArticleResponseDto } from './dto/check-article-response.dto';
import { CreateArticleDto } from './dto/create-article.dto';
import { GetArticlesQueryDto } from './dto/get-articles-query.dto';
import { UpdateArticleDto } from './dto/update-article.dto';

@Injectable()
export class ArticlesService {
  constructor(
    @InjectModel(Article)
    private readonly articleModel: typeof Article,
  ) {}

  async create(createArticleDto: CreateArticleDto): Promise<Article> {
    return this.articleModel.create({
      title: createArticleDto.title,
      url: createArticleDto.url,
      publicationDate: createArticleDto.publicationDate
        ? new Date(createArticleDto.publicationDate)
        : null,
      source: createArticleDto.source,
    });
  }

  async checkExists(articleDto: CreateArticleDto): Promise<CheckArticleResponseDto> {
    const article = await this.articleModel.findOne({
      where: {
        url: articleDto.url,
      },
    });

    return {
      exists: article !== null,
      articleId: article?.id ?? null,
    };
  }

  async findAll(query: GetArticlesQueryDto): Promise<Article[]> {
    const where: WhereOptions<Article> = {};

    if (query.days !== undefined) {
      where.publicationDate = {
        [Op.lt]: moment().subtract(query.days, 'days').toDate(),
      };
    }

    return this.articleModel.findAll({
      where,
      order: [
        ['publicationDate', 'DESC'],
        ['id', 'ASC'],
      ],
    });
  }

  async findOne(id: number): Promise<Article> {
    const article = await this.articleModel.findByPk(id);

    if (!article) {
      throw new NotFoundException(`Article ${id} not found`);
    }

    return article;
  }

  async update(id: number, updateArticleDto: UpdateArticleDto): Promise<Article> {
    const article = await this.findOne(id);

    await article.update({
      ...(updateArticleDto.title !== undefined ? { title: updateArticleDto.title } : {}),
      ...(updateArticleDto.url !== undefined ? { url: updateArticleDto.url } : {}),
      ...(updateArticleDto.publicationDate !== undefined
        ? {
            publicationDate: updateArticleDto.publicationDate
              ? new Date(updateArticleDto.publicationDate)
              : null,
          }
        : {}),
      ...(updateArticleDto.source !== undefined ? { source: updateArticleDto.source } : {}),
    });

    return article;
  }

  async remove(id: number): Promise<void> {
    const article = await this.findOne(id);
    await article.destroy();
  }
}
