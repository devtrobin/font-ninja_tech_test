import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsInt } from 'class-validator';
import { ScrapperState } from '../scrapper.model';

export class CreateScrapperDto {
  @ApiProperty({
    description: 'Identifiant fonctionnel du scrapper',
    example: 42,
  })
  @IsInt()
  scrapperId!: number;

  @ApiProperty({
    description: 'Date de changement de statut au format ISO 8601',
    example: '2026-03-19T10:30:00.000Z',
  })
  @IsDateString()
  dateStatusChange!: string;

  @ApiProperty({
    description: 'Etat du scrapper',
    enum: ScrapperState,
    example: ScrapperState.RUN,
  })
  @IsEnum(ScrapperState)
  state!: ScrapperState;
}
