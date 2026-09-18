-- Run this in your Supabase SQL Editor

-- 1. Profiles
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT,
  initials TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);
  
CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- 2. Recipes
CREATE TABLE IF NOT EXISTS public.recipes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  yield_value INTEGER DEFAULT 1,
  prep_seconds INTEGER DEFAULT 0,
  cook_seconds INTEGER DEFAULT 0,
  visibility TEXT DEFAULT 'private',
  tags TEXT[] DEFAULT '{}',
  author TEXT,
  cover_color TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.recipes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view public recipes or their own" ON public.recipes
  FOR SELECT USING (visibility = 'public' OR auth.uid() = user_id);

CREATE POLICY "Users can insert their own recipes" ON public.recipes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own recipes" ON public.recipes
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own recipes" ON public.recipes
  FOR DELETE USING (auth.uid() = user_id);

-- 3. Ingredients
CREATE TABLE IF NOT EXISTS public.ingredients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipe_id UUID REFERENCES public.recipes(id) ON DELETE CASCADE,
  raw_text TEXT NOT NULL,
  quantity NUMERIC,
  unit TEXT,
  ingredient_name TEXT,
  aisle TEXT,
  optional BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.ingredients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view ingredients of visible recipes" ON public.ingredients
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.recipes 
      WHERE recipes.id = ingredients.recipe_id 
      AND (recipes.visibility = 'public' OR recipes.user_id = auth.uid())
    )
  );

CREATE POLICY "Users can manage ingredients of their own recipes" ON public.ingredients
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.recipes 
      WHERE recipes.id = ingredients.recipe_id 
      AND recipes.user_id = auth.uid()
    )
  );

-- 4. Instructions
CREATE TABLE IF NOT EXISTS public.instructions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipe_id UUID REFERENCES public.recipes(id) ON DELETE CASCADE,
  position_idx INTEGER NOT NULL,
  body TEXT NOT NULL,
  duration_seconds INTEGER,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.instructions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view instructions of visible recipes" ON public.instructions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.recipes 
      WHERE recipes.id = instructions.recipe_id 
      AND (recipes.visibility = 'public' OR recipes.user_id = auth.uid())
    )
  );

CREATE POLICY "Users can manage instructions of their own recipes" ON public.instructions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.recipes 
      WHERE recipes.id = instructions.recipe_id 
      AND recipes.user_id = auth.uid()
    )
  );

-- 5. Grocery Items
CREATE TABLE IF NOT EXISTS public.grocery_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  name TEXT NOT NULL,
  quantity NUMERIC,
  unit TEXT,
  aisle TEXT,
  checked BOOLEAN DEFAULT false,
  source_recipes TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.grocery_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own grocery items" ON public.grocery_items
  FOR ALL USING (auth.uid() = user_id);

-- 6. Meal Plans
CREATE TABLE IF NOT EXISTS public.meal_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  week_start_date DATE NOT NULL,
  entries JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, week_start_date)
);

ALTER TABLE public.meal_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own meal plans" ON public.meal_plans
  FOR ALL USING (auth.uid() = user_id);

-- Triggers for profiles
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, initials)
  VALUES (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    SUBSTRING(new.raw_user_meta_data->>'full_name' FROM 1 FOR 1) || SUBSTRING(new.raw_user_meta_data->>'full_name' FROM '\s([A-Z])')
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

