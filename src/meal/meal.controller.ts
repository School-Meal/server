import {
  Controller,
  Get,
  Query,
  HttpException,
  HttpStatus,
  UseFilters,
} from '@nestjs/common';
import { MealService } from './meal.service';
import { MealInfo } from './interface/meal.interface';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { HtmlExceptionFilter } from 'src/exception/html-exception.filter';

@ApiTags('Meal')
@UseFilters(HtmlExceptionFilter)
@Controller('meal')
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
    @Query('schoolName') schoolName: string,
    @Query('date') date?: string,
  ): Promise<MealInfo> {
    if (!schoolName) {
      throw new HttpException(
        'School name is required',
        HttpStatus.BAD_REQUEST,
      );
    }

    // 학교 정보 조회
    const schoolInfo = await this.mealService.getSchoolInfo(schoolName);

    // 급식 정보 조회
    return this.mealService.getMeal({
      ATPT_OFCDC_SC_CODE: schoolInfo.ATPT_OFCDC_SC_CODE,
      SD_SCHUL_CODE: schoolInfo.SD_SCHUL_CODE,
      MLSV_YMD: date,
    });
  }
}
