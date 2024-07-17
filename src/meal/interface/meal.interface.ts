export interface MealInfo {
  schoolName: string;
  meals: {
    type: string;
    menu: string[];
  }[];
}
