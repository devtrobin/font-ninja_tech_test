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

export enum ScrapperState {
  RUN = 'run',
  PAUSE = 'pause',
  ERROR = 'error',
}

@Table({
  tableName: 'scrappers',
  timestamps: false,
})
export class Scrapper extends Model<InferAttributes<Scrapper>, InferCreationAttributes<Scrapper>> {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  @ApiProperty({
    description: 'Identifiant du scrapper',
    example: 1,
  })
  declare id: CreationOptional<number>;

  @AllowNull(false)
  @Column({
    type: DataType.INTEGER,
    field: 'scrapper_id',
  })
  @ApiProperty({
    description: 'Identifiant fonctionnel du scrapper',
    example: 42,
  })
  declare scrapperId: number;

  @AllowNull(false)
  @Column({
    type: DataType.DATE,
    field: 'date_status_change',
  })
  @ApiProperty({
    description: 'Date de changement de statut au format ISO 8601',
    example: '2026-03-19T10:30:00.000Z',
  })
  declare dateStatusChange: Date;

  @AllowNull(false)
  @Column(DataType.ENUM(...Object.values(ScrapperState)))
  @ApiProperty({
    description: 'Etat du scrapper',
    enum: ScrapperState,
    example: ScrapperState.RUN,
  })
  declare state: ScrapperState;
}
