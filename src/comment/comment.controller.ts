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
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Comment')
@Controller('post/:postId/comments')
@UseGuards(AuthGuard())
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @Post()
  create(
    @Param('postId') postId: string,
    @Body() createCommentDto: CreateCommentDto,
    @GetUser() user: User,
  ) {
    return this.commentService.create(+postId, createCommentDto, user);
  }

  @Get()
  findAll(@Param('postId') postId: string) {
    return this.commentService.findAll(+postId);
  }

  @Get(':id')
  findOne(@Param('postId') postId: string, @Param('id') id: string) {
    return this.commentService.findOne(+postId, +id);
  }

  @Patch(':id')
  update(
    @Param('postId') postId: string,
    @Param('id') id: string,
    @Body() updateCommentDto: UpdateCommentDto,
    @GetUser() user: User,
  ) {
    return this.commentService.update(+postId, +id, updateCommentDto, user);
  }

  @Delete(':id')
  remove(
    @Param('postId') postId: string,
    @Param('id') id: string,
    @GetUser() user: User,
  ) {
    return this.commentService.remove(+postId, +id, user);
  }
}
