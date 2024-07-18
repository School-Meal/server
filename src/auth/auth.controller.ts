import {
  Body,
  Controller,
  Delete,
  Get,
  Patch,
  Post,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthDto } from './dto/auth.dto';
import { User } from './entities/user.entity';
import { GetUser } from 'src/@common/decorators/get-user.decorator';
import { AuthGuard } from '@nestjs/passport';
import { EditProfileDto } from './dto/edit-profile.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('/signup')
  // 회원가입 엔드포인트. ValidationPipe를 사용하여 입력 데이터 검증
  signup(@Body(ValidationPipe) authDto: AuthDto) {
    return this.authService.signup(authDto);
  }

  @Post('/signin')
  // 로그인 엔드포인트. ValidationPipe를 사용하여 입력 데이터 검증
  signin(@Body(ValidationPipe) authDto: AuthDto) {
    return this.authService.signin(authDto);
  }

  @Get('/refresh')
  @UseGuards(AuthGuard()) // 인증된 사용자만 접근 가능
  // 토큰 갱신 엔드포인트
  refresh(@GetUser() user: User) {
    return this.authService.refreshToken(user);
  }

  @Get('/me')
  @UseGuards(AuthGuard()) // 인증된 사용자만 접근 가능
  // 현재 사용자 프로필 조회 엔드포인트
  getProfile(@GetUser() user: User) {
    return this.authService.getProfile(user);
  }

  @Patch('/me')
  @UseGuards(AuthGuard()) // 인증된 사용자만 접근 가능
  // 사용자 프로필 수정 엔드포인트
  editProfile(@Body() editProfileDto: EditProfileDto, @GetUser() user: User) {
    return this.authService.editProfile(editProfileDto, user);
  }

  @Post('/logout')
  @UseGuards(AuthGuard()) // 인증된 사용자만 접근 가능
  // 로그아웃 엔드포인트. 리프레시 토큰 삭제
  logout(@GetUser() user: User) {
    return this.authService.deleteRefreshToken(user);
  }

  @Delete('/me')
  @UseGuards(AuthGuard()) // 인증된 사용자만 접근 가능
  // 계정 삭제 엔드포인트
  deleteAccount(@GetUser() user: User) {
    return this.authService.deleteAccount(user);
  }
}
