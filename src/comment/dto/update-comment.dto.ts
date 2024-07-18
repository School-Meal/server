import { IsString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateCommentDto {
  @ApiProperty({ description: '수정할 댓글 내용' })
  @IsOptional()
  @IsString()
  content?: string;
}
