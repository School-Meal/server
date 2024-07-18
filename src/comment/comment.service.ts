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
      throw new NotFoundException(`Post with ID "${postId}" not found`);
    }

    const comment = this.commentRepository.create({
      ...createCommentDto,
      author: user,
      post,
    });

    return this.commentRepository.save(comment);
  }

  async findAll(postId: number) {
    return this.commentRepository.find({
      where: { post: { id: postId } },
      relations: ['author'],
    });
  }

  async findOne(postId: number, id: number) {
    const comment = await this.commentRepository.findOne({
      where: { id, post: { id: postId } },
      relations: ['author'],
    });

    if (!comment) {
      throw new NotFoundException(`Comment with ID "${id}" not found`);
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
      throw new UnauthorizedException('You can only update your own comments');
    }

    Object.assign(comment, updateCommentDto);
    return this.commentRepository.save(comment);
  }

  async remove(postId: number, id: number, user: User) {
    const comment = await this.findOne(postId, id);

    if (comment.author.id !== user.id) {
      throw new UnauthorizedException('You can only delete your own comments');
    }

    await this.commentRepository.remove(comment);
    return { deleted: true };
  }
}
