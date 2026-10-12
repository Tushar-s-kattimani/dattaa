import { createClient } from '@supabase/supabase-js';

const rawUrl = import.meta.env.VITE_SUPABASE_URL;
const rawKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const isValidHttpUrl = (url?: string): boolean => {
  if (!url) return false;
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
};

export const isSupabaseConfigured = Boolean(
  rawUrl &&
  rawKey &&
  isValidHttpUrl(rawUrl) &&
  !rawUrl.includes('your_supabase_project_url') &&
  !rawUrl.includes('placeholder') &&
  !rawKey.includes('your_supabase_anon_key')
);

if (!isSupabaseConfigured) {
  console.warn('Supabase is not configured yet. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env.local');
}

const supabaseUrl = isSupabaseConfigured && rawUrl ? rawUrl : 'https://placeholder.supabase.co';
const supabaseAnonKey = isSupabaseConfigured && rawKey ? rawKey : 'placeholder-anon-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);


