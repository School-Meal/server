import {
  Controller,
  Post,
  Delete,
  Param,
  UseGuards,
  Body,
  Get,
} from '@nestjs/common';
import { LikeService } from './like.service';
import { CreateLikeDto } from './dto/create-like.dto';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from 'src/@common/decorators/get-user.decorator';
import { User } from '../auth/entities/user.entity';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('Like')
@Controller('like')
@UseGuards(AuthGuard())
export class LikeController {
  constructor(private readonly likeService: LikeService) {}

  @Post()
  @ApiOperation({ summary: '좋아요 생성' })
  @ApiResponse({
    status: 201,
    description: '좋아요가 성공적으로 생성되었습니다.',
  })
  createLike(@Body() createLikeDto: CreateLikeDto, @GetUser() user: User) {
    return this.likeService.createLike(createLikeDto, user);
  }

  @Delete(':postId')
  @ApiOperation({ summary: '좋아요 지우기' })
  @ApiResponse({
    status: 200,
    description: '좋아요가 성공적으로 제거되었습니다.',
  })
  removeLike(@Param('postId') postId: string, @GetUser() user: User) {
    return this.likeService.removeLike(+postId, user);
  }

  @Get('count/:postId')
  @ApiOperation({ summary: '게시물에 대한 좋아요 수 얻기' })
  @ApiResponse({
    status: 200,
    description: '게시물에 대한 좋아요 수를 반환합니다.',
  })
  getLikesCount(@Param('postId') postId: string) {
    return this.likeService.getLikesCount(+postId);
  }

  @Get('user-liked/:postId')
  @ApiOperation({ summary: '사용자가 게시물에 좋아요를 표시했는지 확인' })
  @ApiResponse({
    status: 200,
    description: '사용자가 게시물에 좋아요를 표시했는지 여부를 반환합니다.',
  })
  hasUserLiked(@Param('postId') postId: string, @GetUser() user: User) {
    return this.likeService.hasUserLiked(+postId, user);
  }
}
