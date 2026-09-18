import {GroceryItem} from '../types/grocery'; 
import {supabase} from '../lib/supabase';

export const groceryService={
  async list():Promise<GroceryItem[]>{
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    const { data, error } = await supabase
      .from('grocery_items')
      .select('*')
      .eq('user_id', user.id);

    if (error) throw error;

    return data.map(item => ({
      id: item.id,
      name: item.name,
      quantity: item.quantity,
      unit: item.unit,
      aisle: item.aisle,
      checked: item.checked,
      sourceRecipes: item.source_recipes || []
    }));
  },
  
  async toggle(id:string, checked:boolean):Promise<GroceryItem>{
    const { data, error } = await supabase
      .from('grocery_items')
      .update({ checked })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return {
      id: data.id,
      name: data.name,
      quantity: data.quantity,
      unit: data.unit,
      aisle: data.aisle,
      checked: data.checked,
      sourceRecipes: data.source_recipes || []
    };
  },
  
  async add(item:GroceryItem):Promise<GroceryItem>{
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    const { data, error } = await supabase
      .from('grocery_items')
      .insert({
        user_id: user.id,
        name: item.name,
        quantity: item.quantity,
        unit: item.unit,
        aisle: item.aisle,
        checked: item.checked,
        source_recipes: item.sourceRecipes || []
      })
      .select()
      .single();

    if (error) throw error;

    return {
      id: data.id,
      name: data.name,
      quantity: data.quantity,
      unit: data.unit,
      aisle: data.aisle,
      checked: data.checked,
      sourceRecipes: data.source_recipes || []
    };
  }
};
