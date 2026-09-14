import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { CONFIG } from '../config/index.js';

let supabaseInstance: SupabaseClient | null = null;

/**
 * Supabase Client yaratish yoki mavjud instansiyani olish
 */
export function getSupabaseClient(): SupabaseClient | null {
  if (!CONFIG.SUPABASE_URL || !CONFIG.SUPABASE_SERVICE_ROLE_KEY) {
    return null;
  }

  if (!supabaseInstance) {
    supabaseInstance = createClient(
      CONFIG.SUPABASE_URL,
      CONFIG.SUPABASE_SERVICE_ROLE_KEY,
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      }
    );
  }

  return supabaseInstance;
}

/**
 * Supabase konfiguratsiya qilinganligini tekshirish
 */
export function isSupabaseConfigured(): boolean {
  return Boolean(CONFIG.SUPABASE_URL && CONFIG.SUPABASE_SERVICE_ROLE_KEY);
}

/**
 * Supabase ulanish holatini tekshirish
 */
export async function testSupabaseConnection(): Promise<{ success: boolean; message: string }> {
  const client = getSupabaseClient();
  if (!client) {
    return {
      success: false,
      message: 'Supabase konfiguratsiyasi topilmadi (.env faylida SUPABASE_URL va SUPABASE_SERVICE_ROLE_KEY ni ko\'rsating)',
    };
  }

  try {
    const { data, error } = await client.from('cases').select('id').limit(1);
    if (error) {
      return { success: false, message: `Supabase xatoligi: ${error.message}` };
    }
    return { success: true, message: 'Supabase PostgreSQL muvaffaqiyatli ulandi!' };
  } catch (err: any) {
    return { success: false, message: `Ulanish xatosi: ${err.message}` };
  }
}

/**
 * Supabase orqali foydalanuvchini olish yoki yaratish
 */
export async function getOrCreateSupabaseUser(
  telegramId?: number,
  steamId?: string,
  username?: string,
  avatarUrl?: string
) {
  const client = getSupabaseClient();
  if (!client) return null;

  let query = client.from('users').select('*');
  if (telegramId) {
    query = query.eq('telegram_id', telegramId);
  } else if (steamId) {
    query = query.eq('steam_id', steamId);
  }

  const { data: users, error } = await query.limit(1);
  if (users && users.length > 0) {
    return users[0];
  }

  // Yangi foydalanuvchi yaratish
  const { data: newUser, error: insertError } = await client
    .from('users')
    .insert([
      {
        telegram_id: telegramId || null,
        steam_id: steamId || null,
        username: username || 'Player',
        avatar_url: avatarUrl || null,
        role: 'USER',
      },
    ])
    .select()
    .single();

  if (insertError) throw insertError;

  // Hamyon yaratish
  await client.from('wallets').insert([
    {
      user_id: newUser.id,
      balance: 0,
      bonus_balance: 1000000, // 10,000 UZS start bonus
      currency: 'UZS',
    },
  ]);

  return newUser;
}
