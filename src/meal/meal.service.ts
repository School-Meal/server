import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { MealInfo } from './interface/meal.interface';

@Injectable()
export class MealService {
  constructor(
    private httpService: HttpService,
    private configService: ConfigService,
  ) {}

  async getSchoolInfo(schoolName: string) {
    const neis_key = this.configService.get<string>('NEIS_API_KEY');
    const url = 'https://open.neis.go.kr/hub/schoolInfo';

    const params = {
      KEY: neis_key,
      Type: 'json',
      SCHUL_NM: schoolName,
    };

    try {
      const response = await firstValueFrom(
        this.httpService.get(url, { params }),
      );

      if (response.data.RESULT) {
        throw new HttpException('School not found', HttpStatus.NOT_FOUND);
      }

      const schoolInfo = response.data.schoolInfo[1].row[0];
      return {
        ATPT_OFCDC_SC_CODE: schoolInfo.ATPT_OFCDC_SC_CODE,
        SD_SCHUL_CODE: schoolInfo.SD_SCHUL_CODE,
        SCHUL_NM: schoolInfo.SCHUL_NM,
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Failed to fetch school info',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getMeal(params: {
    ATPT_OFCDC_SC_CODE: string;
    SD_SCHUL_CODE: string;
    MLSV_YMD?: string;
  }): Promise<MealInfo> {
    const neis_key = this.configService.get<string>('NEIS_API_KEY');
    const url = 'https://open.neis.go.kr/hub/mealServiceDietInfo';

    const queryParams = {
      KEY: neis_key,
      Type: 'json',
      ...params,
    };

    try {
      const response = await firstValueFrom(
        this.httpService.get(url, { params: queryParams }),
      );

      if (response.data.RESULT) {
        throw new HttpException('No meal data found', HttpStatus.NOT_FOUND);
      }

      const mealData = response.data.mealServiceDietInfo[1].row;
      const schoolName = mealData[0].SCHUL_NM;

      const meals = mealData.map((meal) => ({
        type: this.getMealType(meal.MMEAL_SC_CODE),
        menu: this.cleanMenuItems(meal.DDISH_NM.split('<br/>')),
      }));

      return { schoolName, meals };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Failed to fetch meal data',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  private getMealType(code: string): string {
    switch (code) {
      case '1':
        return '조식';
      case '2':
        return '중식';
      case '3':
        return '석식';
      default:
        return '기타';
    }
  }

  private cleanMenuItems(menuItems: string[]): string[] {
    return menuItems
      .map(
        (item) =>
          item
            .replace(/\([^)]*\)/g, '') // 괄호와 그 안의 내용 제거
            .replace(/[0-9.]/g, '') // 숫자와 점 제거
            .trim(), // 앞뒤 공백 제거
      )
      .filter((item) => item !== ''); // 빈 문자열 제거
  }
}
