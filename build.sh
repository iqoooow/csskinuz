#!/usr/bin/env bash
set -e

echo "🚀 [CSSKINUZ] Ishlab chiqarish build jarayoni boshlanmoqda..."

# 1. Bog'liqliklarni tekshirish va o'rnatish
echo "📦 1/3 Paketlar tekshirilmoqda..."
npm install

# 2. Backend va Frontendni kompilyatsiya qilish
echo "⚙️ 2/3 TypeScript va Web assetlarini kompilyatsiya qilish..."
npm run build

# 3. Avtomatlashgan testlarni yurgizish
echo "🧪 3/3 Tizim testlari tekshirilmoqda..."
npm run test --prefix apps/api

echo "✅ [CSSKINUZ] Build 100% muvaffaqiyatli yakunlandi!"
