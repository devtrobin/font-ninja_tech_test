import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsOptional, IsString, IsUrl, MaxLength } from 'class-validator';

export class CreateArticleDto {
  @ApiProperty({
    description: "Titre de l'article",
    example: 'Breaking news: NestJS and Sequelize',
  })
  @IsString()
  @MaxLength(255)
  title!: string;

  @ApiProperty({
    description: "URL de l'article",
    example: 'https://example.com/articles/nestjs-sequelize',
  })
  @IsUrl()
  @MaxLength(2048)
  url!: string;

  @ApiPropertyOptional({
    description: 'Date de publication au format ISO 8601',
    example: '2026-03-19T10:30:00.000Z',
  })
  @IsOptional()
  @IsDateString()
  publicationDate?: string;

  @ApiProperty({
    description: "Nom du site source de l'article",
    example: 'BBC News',
  })
  @IsString()
  @MaxLength(255)
  source!: string;
}
