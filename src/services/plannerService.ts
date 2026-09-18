import {MealPlan} from '../types/planner';
import {supabase} from '../lib/supabase';

export const plannerService={
  async getWeek(startDate: string = '2026-09-21'):Promise<MealPlan>{
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    const { data, error } = await supabase
      .from('meal_plans')
      .select('*')
      .eq('user_id', user.id)
      .eq('week_start_date', startDate)
      .maybeSingle();

    if (error) throw error;
    
    if (data) {
      return {
        id: data.id,
        householdId: data.user_id,
        weekStartDate: data.week_start_date,
        entries: data.entries
      };
    }
    
    // Return empty plan if none exists
    return {
      id: 'draft',
      householdId: user.id,
      weekStartDate: startDate,
      entries: {}
    };
  },
  
  async update(plan:MealPlan):Promise<MealPlan>{
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    const planData = {
      user_id: user.id,
      week_start_date: plan.weekStartDate,
      entries: plan.entries
    };

    if (plan.id === 'draft' || !plan.id) {
      const { data, error } = await supabase
        .from('meal_plans')
        .insert(planData)
        .select()
        .single();
      if (error) throw error;
      return { ...plan, id: data.id };
    } else {
      const { error } = await supabase
        .from('meal_plans')
        .update(planData)
        .eq('id', plan.id);
      if (error) throw error;
      return plan;
    }
  }
};
