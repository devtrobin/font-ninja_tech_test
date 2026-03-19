import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, Min } from 'class-validator';

export class GetArticlesQueryDto {
  @ApiPropertyOptional({
    description:
      'Retourne uniquement les articles dont la date de publication est antérieure à N jours',
    example: 7,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  days?: number;
}
