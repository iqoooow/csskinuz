import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

export const CONFIG = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT || '4000', 10),
  WS_PORT: parseInt(process.env.WS_PORT || '4000', 10),
  JWT_SECRET: process.env.JWT_SECRET || 'csskinuz_production_super_secure_jwt_secret_key_2026',
  JWT_EXPIRES_IN: 60 * 60 * 24 * 7, // 7 kun sekundlarda
  TELEGRAM_BOT_TOKEN: process.env.TELEGRAM_BOT_TOKEN || '',
  TELEGRAM_BOT_USERNAME: (process.env.TELEGRAM_BOT_USERNAME || 'csskinuzbot').replace(/^@/, ''),
  SUPABASE_URL: process.env.SUPABASE_URL || '',
  SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY || '',
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
  STEAM_API_KEY: process.env.STEAM_API_KEY || 'MOCK_STEAM_API_KEY_FOR_DEV_AND_PROD',
  DATABASE_PATH: process.env.DATABASE_PATH || path.resolve(process.cwd(), 'csskinuz.sqlite'),
  APP_URL: (process.env.APP_URL || 'http://localhost:3000').replace(/\/$/, ''),
  API_URL: (process.env.API_URL || 'http://localhost:4000').replace(/\/$/, ''),
  HOUSE_EDGE_DEFAULT: 0.10, // 10% Platform komissiyasi
  CURRENCY: 'UZS',
  TIYIN_MULTIPLIER: 100, // 1 UZS = 100 tiyin
};
