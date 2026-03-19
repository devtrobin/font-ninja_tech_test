import { ApiProperty } from '@nestjs/swagger';

export class CheckArticleResponseDto {
  @ApiProperty({
    description: "Indique si l'article existe deja en base",
    example: true,
  })
  exists!: boolean;

  @ApiProperty({
    description: "Identifiant de l'article s'il existe deja",
    example: 12,
    nullable: true,
  })
  articleId!: number | null;
}
