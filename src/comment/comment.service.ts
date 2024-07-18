import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { Comment } from './entities/comment.entity';
import { Post } from '../post/entities/post.entity';
import { User } from '../auth/entities/user.entity';

@Injectable()
export class CommentService {
  constructor(
    @InjectRepository(Comment)
    private commentRepository: Repository<Comment>,
    @InjectRepository(Post)
    private postRepository: Repository<Post>,
  ) {}

  async create(postId: number, createCommentDto: CreateCommentDto, user: User) {
    const post = await this.postRepository.findOne({ where: { id: postId } });
    if (!post) {
      throw new NotFoundException(
        `ID가 "${postId}" 인 게시물을 찾을 수 없습니다.`,
      );
    }

    const comment = this.commentRepository.create({
      ...createCommentDto,
      author: user,
      post,
    });

    if (createCommentDto.parentCommentId) {
      const parentComment = await this.commentRepository.findOne({
        where: { id: createCommentDto.parentCommentId },
      });
      if (!parentComment) {
        throw new NotFoundException(
          `ID가 "${createCommentDto.parentCommentId}" 인 부모 댓글을 찾을 수 없습니다.`,
        );
      }
      comment.parentComment = parentComment;
    }

    return this.commentRepository.save(comment);
  }

  async findAll(postId: number) {
    return this.commentRepository.find({
      where: { post: { id: postId }, parentComment: null },
      relations: ['author', 'replies', 'replies.author'],
    });
  }

  async findOne(postId: number, id: number) {
    const comment = await this.commentRepository.findOne({
      where: { id, post: { id: postId } },
      relations: ['author', 'replies', 'replies.author'],
    });

    if (!comment) {
      throw new NotFoundException(`ID가 "${id}" 인 댓글을 찾을 수 없습니다.`);
    }

    return comment;
  }

  async update(
    postId: number,
    id: number,
    updateCommentDto: UpdateCommentDto,
    user: User,
  ) {
    const comment = await this.findOne(postId, id);

    if (comment.author.id !== user.id) {
      throw new UnauthorizedException('자신의 댓글만 수정할 수 있습니다.');
    }

    if (updateCommentDto.content) {
      comment.content = updateCommentDto.content;
    }

    return this.commentRepository.save(comment);
  }

  async remove(postId: number, id: number, user: User) {
    const comment = await this.findOne(postId, id);

    if (comment.author.id !== user.id) {
      throw new UnauthorizedException(
        '자신이 작성한 댓글만 삭제할 수 있습니다.',
      );
    }

    await this.commentRepository.remove(comment);
    return { deleted: true };
  }
}
