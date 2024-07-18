import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Like } from './entities/like.entity';
import { User } from '../auth/entities/user.entity';
import { Post } from '../post/entities/post.entity';
import { CreateLikeDto } from './dto/create-like.dto';

@Injectable()
export class LikeService {
  constructor(
    @InjectRepository(Like)
    private likeRepository: Repository<Like>,
    @InjectRepository(Post)
    private postRepository: Repository<Post>,
  ) {}

  async createLike(createLikeDto: CreateLikeDto, user: User): Promise<Like> {
    const post = await this.postRepository.findOne({
      where: { id: createLikeDto.postId },
    });
    if (!post) {
      throw new NotFoundException(
        `Post with ID "${createLikeDto.postId}" not found`,
      );
    }

    const existingLike = await this.likeRepository.findOne({
      where: { user: { id: user.id }, post: { id: post.id } },
    });

    if (existingLike) {
      throw new ConflictException('You have already liked this post');
    }

    const like = this.likeRepository.create({ user, post });
    return this.likeRepository.save(like);
  }

  async removeLike(postId: number, user: User): Promise<void> {
    const result = await this.likeRepository.delete({
      user: { id: user.id },
      post: { id: postId },
    });

    if (result.affected === 0) {
      throw new NotFoundException(`Like not found`);
    }
  }

  async getLikesCount(postId: number): Promise<number> {
    return this.likeRepository.count({
      where: { post: { id: postId } },
    });
  }

  async hasUserLiked(postId: number, user: User): Promise<boolean> {
    const like = await this.likeRepository.findOne({
      where: { user: { id: user.id }, post: { id: postId } },
    });
    return !!like;
  }
}
