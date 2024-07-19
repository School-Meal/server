import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional, IsNumber } from 'class-validator';

export class CreateCommentDto {
  @ApiProperty({ description: '댓글' })
  @IsNotEmpty()
  @IsString()
  content: string;

  @ApiProperty({ description: '대댓글' })
  @IsOptional()
  @IsNumber()
  parentCommentId?: number;
}
