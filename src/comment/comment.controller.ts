import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { CommentService } from './comment.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from 'src/@common/decorators/get-user.decorator';
import { User } from '../auth/entities/user.entity';
import { ApiTags, ApiOperation, ApiParam, ApiBody } from '@nestjs/swagger';

@ApiTags('Comment')
@UseGuards(AuthGuard('jwt'))
@Controller('post/:postId/comments')
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @Post()
  @ApiOperation({ summary: '새 댓글 생성' })
  @ApiParam({ name: 'postId', description: '게시글 ID' })
  @ApiBody({ type: CreateCommentDto })
  create(
    @Param('postId') postId: string,
    @Body() createCommentDto: CreateCommentDto,
    @GetUser() user: User,
  ) {
    return this.commentService.create(+postId, createCommentDto, user);
  }

  @Get()
  @ApiOperation({ summary: '게시글의 모든 댓글 조회' })
  @ApiParam({ name: 'postId', description: '게시글 ID' })
  findAll(@Param('postId') postId: string) {
    return this.commentService.findAll(+postId);
  }

  @Get(':id')
  @ApiOperation({ summary: '특정 댓글 조회' })
  @ApiParam({ name: 'postId', description: '게시글 ID' })
  @ApiParam({ name: 'id', description: '댓글 ID' })
  findOne(@Param('postId') postId: string, @Param('id') id: string) {
    return this.commentService.findOne(+postId, +id);
  }

  @Patch(':id')
  @ApiOperation({ summary: '댓글 수정' })
  @ApiParam({ name: 'postId', description: '게시글 ID' })
  @ApiParam({ name: 'id', description: '댓글 ID' })
  @ApiBody({ type: UpdateCommentDto })
  update(
    @Param('postId') postId: string,
    @Param('id') id: string,
    @Body() updateCommentDto: UpdateCommentDto,
    @GetUser() user: User,
  ) {
    return this.commentService.update(+postId, +id, updateCommentDto, user);
  }

  @Delete(':id')
  @ApiOperation({ summary: '댓글 삭제' })
  @ApiParam({ name: 'postId', description: '게시글 ID' })
  @ApiParam({ name: 'id', description: '댓글 ID' })
  remove(
    @Param('postId') postId: string,
    @Param('id') id: string,
    @GetUser() user: User,
  ) {
    return this.commentService.remove(+postId, +id, user);
  }
}
