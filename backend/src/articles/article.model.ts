import { ApiProperty } from '@nestjs/swagger';
import { CreationOptional, InferAttributes, InferCreationAttributes } from 'sequelize';
import {
  AllowNull,
  AutoIncrement,
  Column,
  DataType,
  Model,
  PrimaryKey,
  Table,
} from 'sequelize-typescript';

@Table({
  tableName: 'articles',
  timestamps: false,
})
export class Article extends Model<InferAttributes<Article>, InferCreationAttributes<Article>> {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  @ApiProperty({
    description: "Identifiant de l'article",
    example: 1,
  })
  declare id: CreationOptional<number>;

  @AllowNull(false)
  @Column(DataType.STRING(255))
  @ApiProperty({
    description: "Titre de l'article",
    example: 'Breaking news: NestJS and Sequelize',
  })
  declare title: string;

  @AllowNull(false)
  @Column(DataType.STRING(2048))
  @ApiProperty({
    description: "URL de l'article",
    example: 'https://example.com/articles/nestjs-sequelize',
  })
  declare url: string;

  @AllowNull(true)
  @Column({
    type: DataType.DATE,
    field: 'publication_date',
  })
  @ApiProperty({
    description: 'Date de publication de l article',
    example: '2026-03-19T10:30:00.000Z',
    nullable: true,
  })
  declare publicationDate: CreationOptional<Date | null>;

  @AllowNull(false)
  @Column(DataType.STRING(255))
  @ApiProperty({
    description: "Nom du site source de l'article",
    example: 'BBC News',
  })
  declare source: string;
}
