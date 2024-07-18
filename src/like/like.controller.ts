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
  @ApiOperation({ summary: 'Create a like' })
  @ApiResponse({
    status: 201,
    description: 'The like has been successfully created.',
  })
  createLike(@Body() createLikeDto: CreateLikeDto, @GetUser() user: User) {
    return this.likeService.createLike(createLikeDto, user);
  }

  @Delete(':postId')
  @ApiOperation({ summary: 'Remove a like' })
  @ApiResponse({
    status: 200,
    description: 'The like has been successfully removed.',
  })
  removeLike(@Param('postId') postId: string, @GetUser() user: User) {
    return this.likeService.removeLike(+postId, user);
  }

  @Get('count/:postId')
  @ApiOperation({ summary: 'Get likes count for a post' })
  @ApiResponse({
    status: 200,
    description: 'Returns the number of likes for the post.',
  })
  getLikesCount(@Param('postId') postId: string) {
    return this.likeService.getLikesCount(+postId);
  }

  @Get('user-liked/:postId')
  @ApiOperation({ summary: 'Check if user has liked a post' })
  @ApiResponse({
    status: 200,
    description: 'Returns whether the user has liked the post.',
  })
  hasUserLiked(@Param('postId') postId: string, @GetUser() user: User) {
    return this.likeService.hasUserLiked(+postId, user);
  }
}
