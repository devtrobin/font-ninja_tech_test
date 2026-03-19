import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { ScrapperState } from '../scrapper.model';

export class UpdateScrapperDto {
  @ApiProperty({
    description: 'Etat du scrapper',
    enum: ScrapperState,
    example: ScrapperState.RUN,
  })
  @IsEnum(ScrapperState)
  state!: ScrapperState;
}
