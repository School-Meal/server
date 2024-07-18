import {
  Controller,
  Get,
  Query,
  HttpException,
  HttpStatus,
  UseFilters,
  UseGuards,
} from '@nestjs/common';
import { MealService } from './meal.service';
import { MealInfo } from './interface/meal.interface';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { HtmlExceptionFilter } from 'src/exception/html-exception.filter';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from 'src/@common/decorators/get-user.decorator';
import { User } from '../auth/entities/user.entity';

@ApiTags('Meal')
@UseFilters(HtmlExceptionFilter)
@Controller('meal')
@UseGuards(AuthGuard()) // 인증된 사용자만 접근 가능하도록 추가
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
  @ApiOperation({ summary: 'Meal' })
  @Get()
  async getMeal(
    @GetUser() user: User,
    @Query('date') date?: string,
  ): Promise<MealInfo> {
    if (!user.schoolName) {
      throw new HttpException(
        'School name is not set for this user',
        HttpStatus.BAD_REQUEST,
      );
    }

    // 학교 정보 조회
    const schoolInfo = await this.mealService.getSchoolInfo(user.schoolName);

    // 급식 정보 조회
    return this.mealService.getMeal({
      ATPT_OFCDC_SC_CODE: schoolInfo.ATPT_OFCDC_SC_CODE,
      SD_SCHUL_CODE: schoolInfo.SD_SCHUL_CODE,
      MLSV_YMD: date,
    });
  }
}
