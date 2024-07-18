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

@Injectable()
export class PostService {
  constructor(
    @InjectRepository(Post)
    private postRepository: Repository<Post>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private imageService: ImageService,
  ) {}

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

  findAll() {
    return this.postRepository.find({ relations: ['author'] });
  }

  async findOne(id: number) {
    const post = await this.postRepository.findOne({
      where: { id },
      relations: ['author'],
    });
    if (!post) {
      throw new NotFoundException(`ID가 "${id}" 인 게시물을 찾을 수 없습니다.`);
    }
    return post;
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
    return this.postRepository.save(post);
  }

  async remove(userId: number, id: number) {
    const post = await this.findOne(id);
    if (post.author.id !== userId) {
      throw new UnauthorizedException(
        '자신이 작성한 게시물만 삭제할 수 있습니다.',
      );
    }
    return this.postRepository.remove(post);
  }
}
