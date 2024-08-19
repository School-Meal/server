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

  private formatCommentResponse(comment: Comment) {
    const formattedComment = {
      id: comment.id,
      content: comment.content,
      createdAt: comment.createdAt,
      updatedAt: comment.updatedAt,
      author: {
        id: comment.author.id,
        loginType: comment.author.loginType,
        schoolName: comment.author.schoolName,
        email: comment.author.email,
        nickName: comment.author.nickName,
        imageUri: comment.author.imageUri,
      },
      replies: comment.replies
        ? comment.replies.map((reply) => this.formatCommentResponse(reply))
        : [],
    };
    return formattedComment;
  }

  async create(postId: number, createCommentDto: CreateCommentDto, user: User) {
    const post = await this.postRepository.findOne({ where: { id: postId } });
    if (!post) {
      throw new NotFoundException(
        `ID가 "${postId}" 인 게시물을 찾을 수 없습니다.`,
      );
    }

    const comment = this.commentRepository.create({
      content: createCommentDto.content,
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

    await this.commentRepository.save(comment);
    return this.formatCommentResponse(comment);
  }

  async findAll(postId: number) {
    const comments = await this.commentRepository.find({
      where: { post: { id: postId } },
      relations: ['author', 'replies', 'replies.author', 'parentComment'],
      order: { createdAt: 'ASC' },
    });

    // 최상위 댓글만 필터링
    const topLevelComments = comments.filter(
      (comment) => !comment.parentComment,
    );

    // 대댓글을 부모 댓글의 replies 배열에 추가
    const commentMap = new Map(
      comments.map((comment) => [comment.id, { ...comment, replies: [] }]),
    );
    comments.forEach((comment) => {
      if (comment.parentComment) {
        const parentComment = commentMap.get(comment.parentComment.id);
        if (parentComment) {
          parentComment.replies.push(commentMap.get(comment.id));
        }
      }
    });

    return topLevelComments.map((comment) =>
      this.formatCommentResponse(commentMap.get(comment.id)),
    );
  }

  async findOne(postId: number, id: number) {
    const comment = await this.commentRepository.findOne({
      where: { id, post: { id: postId } },
      relations: ['author', 'replies', 'replies.author'],
    });

    if (!comment) {
      throw new NotFoundException(`ID가 "${id}" 인 댓글을 찾을 수 없습니다.`);
    }

    return this.formatCommentResponse(comment);
  }

  async update(
    postId: number,
    id: number,
    updateCommentDto: UpdateCommentDto,
    user: User,
  ) {
    const comment = await this.commentRepository.findOne({
      where: { id, post: { id: postId } },
      relations: ['author'],
    });

    if (!comment) {
      throw new NotFoundException(`ID가 "${id}" 인 댓글을 찾을 수 없습니다.`);
    }

    if (comment.author.id !== user.id) {
      throw new UnauthorizedException('자신의 댓글만 수정할 수 있습니다.');
    }

    if (updateCommentDto.content) {
      comment.content = updateCommentDto.content;
    }

    await this.commentRepository.save(comment);
    return this.formatCommentResponse(comment);
  }

  async remove(postId: number, id: number, user: User) {
    const comment = await this.commentRepository.findOne({
      where: { id, post: { id: postId } },
      relations: ['author'],
    });

    if (!comment) {
      throw new NotFoundException(`ID가 "${id}" 인 댓글을 찾을 수 없습니다.`);
    }

    if (comment.author.id !== user.id) {
      throw new UnauthorizedException(
        '자신이 작성한 댓글만 삭제할 수 있습니다.',
      );
    }

    await this.commentRepository.remove(comment);
    return { deleted: true };
  }
}
