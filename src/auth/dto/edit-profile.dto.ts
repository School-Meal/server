import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength, MinLength } from 'class-validator';

export class EditProfileDto {
  @ApiProperty({ description: '이름' })
  @IsString()
  @MinLength(1)
  @MaxLength(20)
  nickname: string;

  @ApiProperty({ description: '이미지 URI' })
  @IsString()
  imageUri: string;
}
