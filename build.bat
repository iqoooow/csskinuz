@echo off
echo [CSSKINUZ] Ishlab chiqarish build jarayoni boshlanmoqda...
call npm install
call npm run build
call npm run test --prefix apps/api
echo [CSSKINUZ] Build 100% muvaffaqiyatli yakunlandi!
