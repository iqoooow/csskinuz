#!/usr/bin/env bash
set -e

echo "🚀 ====================================================="
echo "   CSSKINUZ — AVTOMATIK SERVERGA O'RNATISH SKRIPTI"
echo "====================================================="

# 1. Tizim paketlarini tekshirish
if ! command -v node &> /dev/null; then
    echo "📦 Node.js 22 o'rnatilmoqda..."
    curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
    sudo apt-get install -y nodejs
fi

if ! command -v pm2 &> /dev/null; then
    echo "📦 PM2 Process Manager o'rnatilmoqda..."
    sudo npm install -g pm2
fi

# 2. Bog'liqliklarni o'rnatish
echo "📦 Loyiha kutubxonalari o'rnatilmoqda..."
npm install

# 3. Loyihani build qilish
echo "⚙️ Frontend va Backend kompilyatsiya qilinmoqda..."
npm run build

# 4. PM2 orqali Backend API va Telegram Botni ishga tushirish
echo "🤖 Backend API va Telegram Bot ishga tushirilmoqda..."
pm2 delete csskinuz-api || true
pm2 start apps/api/dist/index.js --name "csskinuz-api" --time

pm2 save
pm2 startup || true

echo "✅ ====================================================="
echo "   CSSKINUZ MUVAFFAQIYATLI ISHGA TUSHIRILDI!"
echo "   API & Telegram Bot: http://localhost:4000"
echo "   PM2 Status: 'pm2 status' orqali ko'rishingiz mumkin."
echo "====================================================="
