import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Supabase credentials missing. Realistic features will be disabled.');
}

export const supabase = createClient(
    supabaseUrl || 'https://mqwjbljadvmackhgbegk.supabase.co',
    supabaseAnonKey || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1xd2pibGphZHZtYWNraGdiZWdrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE4OTEwMjMsImV4cCI6MjA4NzQ2NzAyM30.RL5cyoom5_8yIsoq9SqqBZ9I7c61bXu0lRKoAUJ9ylc'
);
