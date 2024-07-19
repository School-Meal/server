import {
  Controller,
  // FileTypeValidator,
  // MaxFileSizeValidator,
  ParseFilePipe,
  Post,
  UploadedFile,
  UseFilters,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ImageService } from './image.service';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { HtmlExceptionFilter } from 'src/exception/html-exception.filter';

AuthGuard('jwt');
@ApiTags('Image')
@Controller('image')
@UseFilters(HtmlExceptionFilter)
export class ImageController {
  constructor(private readonly imageService: ImageService) {}

  @ApiResponse({
    status: 200,
    description: '성공',
  })
  @ApiResponse({
    status: 500,
    description: '서버 에러',
  })
  @ApiOperation({ summary: '이미지 업로드' })
  @Post()
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          // new MaxFileSizeValidator({ maxSize: 1000 }),
          // new FileTypeValidator({ fileType: 'image/jpg' }),
        ],
      }),
    )
    file: Express.Multer.File,
  ) {
    await this.imageService.upload(file.originalname, file.buffer);
  }
}
