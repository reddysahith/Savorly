import {Recipe} from '../types/recipe'; 
import {supabase} from '../lib/supabase';

export const recipeService={
  async list():Promise<Recipe[]>{
    const { data, error } = await supabase
      .from('recipes')
      .select(`
        *,
        ingredients (*),
        instructions (*)
      `);
    if (error) throw error;
    
    return data.map(r => ({
      id: r.id,
      title: r.title,
      description: r.description || '',
      yieldValue: r.yield_value,
      prepSeconds: r.prep_seconds,
      cookSeconds: r.cook_seconds,
      visibility: r.visibility,
      tags: r.tags || [],
      author: r.author || '',
      coverColor: r.cover_color || '#f6dfd3',
      ingredients: (r.ingredients || []).map((i: any) => ({
        id: i.id,
        rawText: i.raw_text,
        quantity: i.quantity,
        unit: i.unit,
        ingredientName: i.ingredient_name,
        aisle: i.aisle,
        optional: i.optional
      })),
      instructions: (r.instructions || []).sort((a:any, b:any) => a.position_idx - b.position_idx).map((i: any) => ({
        position: i.position_idx,
        body: i.body,
        durationSeconds: i.duration_seconds
      }))
    }));
  },
  
  async get(id:string):Promise<Recipe>{
    const { data, error } = await supabase
      .from('recipes')
      .select(`*, ingredients (*), instructions (*)`)
      .eq('id', id)
      .single();
      
    if (error) throw error;
    
    return {
      id: data.id,
      title: data.title,
      description: data.description || '',
      yieldValue: data.yield_value,
      prepSeconds: data.prep_seconds,
      cookSeconds: data.cook_seconds,
      visibility: data.visibility,
      tags: data.tags || [],
      author: data.author || '',
      coverColor: data.cover_color || '#f6dfd3',
      ingredients: (data.ingredients || []).map((i: any) => ({
        id: i.id,
        rawText: i.raw_text,
        quantity: i.quantity,
        unit: i.unit,
        ingredientName: i.ingredient_name,
        aisle: i.aisle,
        optional: i.optional
      })),
      instructions: (data.instructions || []).sort((a:any, b:any) => a.position_idx - b.position_idx).map((i: any) => ({
        position: i.position_idx,
        body: i.body,
        durationSeconds: i.duration_seconds
      }))
    };
  },
  
  async save(recipe:Recipe):Promise<Recipe>{
    // Handle user session implicitly through RLS
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");
    
    const recipeData = {
      user_id: user.id,
      title: recipe.title,
      description: recipe.description,
      yield_value: recipe.yieldValue,
      prep_seconds: recipe.prepSeconds,
      cook_seconds: recipe.cookSeconds,
      visibility: recipe.visibility,
      tags: recipe.tags,
      author: recipe.author,
      cover_color: recipe.coverColor
    };

    let recipeId = recipe.id;
    if (recipe.id === 'draft' || !recipe.id) {
      const { data, error } = await supabase.from('recipes').insert(recipeData).select().single();
      if (error) throw error;
      recipeId = data.id;
    } else {
      const { error } = await supabase.from('recipes').update(recipeData).eq('id', recipeId);
      if (error) throw error;
      // Delete existing sub-items
      await supabase.from('ingredients').delete().eq('recipe_id', recipeId);
      await supabase.from('instructions').delete().eq('recipe_id', recipeId);
    }
    
    if (recipe.ingredients?.length > 0) {
      await supabase.from('ingredients').insert(
        recipe.ingredients.map(i => ({
          recipe_id: recipeId,
          raw_text: i.rawText,
          quantity: i.quantity,
          unit: i.unit,
          ingredient_name: i.ingredientName,
          aisle: i.aisle,
          optional: i.optional
        }))
      );
    }
    
    if (recipe.instructions?.length > 0) {
      await supabase.from('instructions').insert(
        recipe.instructions.map(i => ({
          recipe_id: recipeId,
          position_idx: i.position,
          body: i.body,
          duration_seconds: i.durationSeconds
        }))
      );
    }
    
    return { ...recipe, id: recipeId };
  },
  
  async importFromUrl(url:string):Promise<Recipe>{
    await new Promise(r=>setTimeout(r,1200));
    return {
      id:'draft',
      title:url.includes('miso')?'Miso butter salmon':'Green goddess pasta',
      description:'',
      yieldValue:4,
      prepSeconds:600,
      cookSeconds:1200,
      visibility:'private',
      tags:[],
      author:'Imported',
      coverColor:'#eaf0e8',
      ingredients:[],
      instructions:[]
    };
  }
};
