import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://vcyymjkyisvcyymjkyis.supabase.co'; // Fallback for dev without env
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZjeXltamt5aXN2Y3l5bWpraXlxIiwicm9sZSI6ImFub24iLCJpYXQiOjE2MTYxNjE2MTYsImV4cCI6MTkzMjMyMzIzMn0.dummy-signature-for-development-purposes-only';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
