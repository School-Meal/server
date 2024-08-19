import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { Post } from './entities/post.entity';
import { User } from '../auth/entities/user.entity';
import { ImageService } from '../image/image.service';
import { Like } from 'src/like/entities/like.entity';

@Injectable()
export class PostService {
  constructor(
    @InjectRepository(Post)
    private postRepository: Repository<Post>,
    @InjectRepository(Like)
    private likeRepository: Repository<Like>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private imageService: ImageService,
  ) {}

  private formatPostResponse(post: Post) {
    return {
      id: post.id,
      title: post.title,
      content: post.content,
      imageUrl: post.imageUrl,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
      author: {
        id: post.author.id,
        loginType: post.author.loginType,
        schoolName: post.author.schoolName,
        email: post.author.email,
        nickName: post.author.nickName,
        imageUri: post.author.imageUri,
      },
    };
  }

  async create(
    userId: number,
    createPostDto: CreatePostDto,
    file: Express.Multer.File,
  ) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('사용자를 찾을 수 없습니다.');
    }

    const imageUrl = await this.imageService.upload(
      file.originalname,
      file.buffer,
    );
    const post = this.postRepository.create({
      ...createPostDto,
      imageUrl,
      author: user,
    });
    return this.postRepository.save(post);
  }

  async findAll() {
    const posts = await this.postRepository.find({ relations: ['author'] });
    return posts.map((post) => this.formatPostResponse(post));
  }

  async findOne(id: number) {
    const post = await this.postRepository.findOne({
      where: { id },
      relations: ['author'],
    });
    if (!post) {
      throw new NotFoundException(`ID가 "${id}" 인 게시물을 찾을 수 없습니다.`);
    }
    return this.formatPostResponse(post);
  }

  async update(
    userId: number,
    id: number,
    updatePostDto: UpdatePostDto,
    file: Express.Multer.File,
  ) {
    const post = await this.findOne(id);
    if (post.author.id !== userId) {
      throw new UnauthorizedException(
        '자신의 게시물만 업데이트할 수 있습니다.',
      );
    }

    if (file) {
      const imageUrl = await this.imageService.upload(
        file.originalname,
        file.buffer,
      );
      post.imageUrl = imageUrl;
    }
    Object.assign(post, updatePostDto);
    const updatedPost = await this.postRepository.save(post);
    return this.formatPostResponse(updatedPost);
  }

  async remove(userId: number, id: number) {
    const post = await this.postRepository.findOne({
      where: { id },
      relations: ['author'],
    });
    if (!post) {
      throw new NotFoundException('게시글을 찾을 수 없습니다.');
    }
    if (post.author.id !== userId) {
      throw new UnauthorizedException(
        '자신이 작성한 게시물만 삭제할 수 있습니다.',
      );
    }
    await this.likeRepository.delete({ post: { id } });

    return this.postRepository.remove(post);
  }
}
