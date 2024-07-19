import { ApiProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';

export class CreateLikeDto {
  @ApiProperty({ description: '게시글 ID' })
  @IsNumber()
  postId: number;
}
