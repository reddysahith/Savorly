import {MealPlan} from '../types/planner'; import {recipes} from './mockData';
export const plannerService={async getWeek():Promise<MealPlan>{return {id:'p1',householdId:'h1',weekStartDate:'2026-09-21',entries:{'2026-09-21':{dinner:recipes[0].id},'2026-09-22':{dinner:recipes[1].id},'2026-09-24':{dinner:recipes[2].id}}}},async update(plan:MealPlan):Promise<MealPlan>{return plan}};
