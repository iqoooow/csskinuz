#!/usr/bin/env bash
set -e

echo "🚀 [CSSKINUZ] Platforma ishlab chiqarish rejimida ishga tushirilmoqda..."

# Backend API va WebSocket Serverni ishga tushirish
cd apps/api && node dist/index.js
