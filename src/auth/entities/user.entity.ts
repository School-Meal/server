import { Post } from 'src/post/entities/post.entity';
import { Comment } from 'src/comment/entities/comment.entity';
import {
  BaseEntity,
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { Like } from 'src/like/entities/like.entity';

@Entity()
@Unique(['email'])
export class User extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  loginType: 'email';

  @Column({ default: '경북소프트웨어고등학교' })
  schoolName: string;

  @Column()
  email: string;

  @Column()
  password: string;

  @Column()
  nickName: string;

  @Column({ nullable: true })
  imageUri?: string;

  @Column({ nullable: true })
  hashedRefreshToken?: string;

  @OneToMany(() => Post, (post) => post.author)
  posts: Post[];

  @OneToMany(() => Comment, (comment) => comment.author)
  comments: Comment[];

  @OneToMany(() => Like, (like) => like.user)
  likes: Like[];
}
