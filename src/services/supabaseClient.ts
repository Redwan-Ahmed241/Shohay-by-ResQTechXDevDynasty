/* ═══════════════════════════════════════════════════════════
   SHOHAY Supabase Client & Authentication Layer
   ═══════════════════════════════════════════════════════════ */

import { createClient, SupabaseClient } from '@supabase/supabase-js';

const SUPABASE_URL =
  import.meta.env.VITE_SUPABASE_URL || 'https://ygccjpjfwrmjqduujpxp.supabase.co';

const SUPABASE_ANON_KEY =
  import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured: boolean = Boolean(
  SUPABASE_URL && SUPABASE_ANON_KEY && SUPABASE_ANON_KEY.length > 20
);

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null;
