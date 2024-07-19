import {
  Controller,
  Get,
  HttpException,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { MealService } from './meal.service';
import { MealInfo } from './interface/meal.interface';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from 'src/@common/decorators/get-user.decorator';
import { User } from '../auth/entities/user.entity';

@ApiTags('Meal')
@Controller('meal')
@UseGuards(AuthGuard('jwt'))
export class MealController {
  constructor(private readonly mealService: MealService) {}

  @ApiResponse({
    status: 200,
    description: '성공',
  })
  @ApiResponse({
    status: 404,
    description: 'URL을 확인해주세요.',
  })
  @ApiOperation({ summary: '급식' })
  @Get()
  async getMeal(@GetUser() user: User): Promise<MealInfo> {
    if (!user.schoolName) {
      throw new HttpException(
        '학교이름을 찾을 수 없습니다.',
        HttpStatus.BAD_REQUEST,
      );
    }

    // 오늘 날짜 계산
    const today = this.getTodayDate();

    // 학교 정보 조회
    const schoolInfo = await this.mealService.getSchoolInfo(user.schoolName);

    // 급식 정보 조회
    return this.mealService.getMeal({
      ATPT_OFCDC_SC_CODE: schoolInfo.ATPT_OFCDC_SC_CODE,
      SD_SCHUL_CODE: schoolInfo.SD_SCHUL_CODE,
      MLSV_YMD: today,
    });
  }

  private getTodayDate(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}${month}${day}`;
  }
}
