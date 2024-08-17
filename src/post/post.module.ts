import { Module } from '@nestjs/common';
import { PostController } from './post.controller';
import { PostService } from './post.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Post } from './entities/post.entity';
import { AuthModule } from 'src/auth/auth.module';
import { ImageModule } from 'src/image/image.module';
import { LikeModule } from 'src/like/like.module';
import { Like } from 'src/like/entities/like.entity';
import { User } from 'src/auth/entities/user.entity';
import { Comment } from 'src/comment/entities/comment.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Post, Like, User, Comment]),
    AuthModule,
    ImageModule,
    LikeModule,
  ],
  controllers: [PostController],
  providers: [PostService],
})
export class PostModule {}
