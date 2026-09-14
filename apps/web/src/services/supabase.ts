import { createClient, SupabaseClient } from '@supabase/supabase-js';

const DEFAULT_SUPABASE_URL = 'https://ikvvfrikuwiqkqkkjpaw.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlrdnZmcmlrdXdpcWtxa2tqcGF3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk0MTIyNDksImV4cCI6MjEwNDk4ODI0OX0.9XP6BncbGpY9B8saZ5pF_TUvohzFdMmC8kt9j2C3Uc8';

const SUPABASE_URL = (import.meta as any).env?.VITE_SUPABASE_URL || DEFAULT_SUPABASE_URL;
const SUPABASE_ANON_KEY = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY;

let supabaseClient: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient | null {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    return null;
  }

  if (!supabaseClient) {
    supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  }

  return supabaseClient;
}

export function isSupabaseAvailable(): boolean {
  return Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
}

/**
 * Supabase Realtime orqali jonli droplarga obuna bo'lish
 */
export function subscribeToSupabaseDrops(onDrop: (drop: any) => void) {
  const client = getSupabase();
  if (!client) return () => {};

  const channel = client
    .channel('public:inventory_items')
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'inventory_items' },
      (payload) => {
        onDrop(payload.new);
      }
    )
    .subscribe();

  return () => {
    client.removeChannel(channel);
  };
}
