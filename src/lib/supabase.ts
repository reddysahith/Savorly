import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://rdeibnawnlkxfafxjnwo.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJkZWlibmF3bmxreGZhZnhqbndvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk3MDY1NTUsImV4cCI6MjEwNTI4MjU1NX0.RKrf6dQbp796bNCxD-YVbw7_fxTawQVeEBq3HOWNzZU';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
