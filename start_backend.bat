@echo off
echo ============================================
echo Iniciando el Backend en http://localhost:5000
echo ============================================
cd backend
echo Instalando dependencias...
call npm install
echo Iniciando servidor...
call npm run dev
echo El servidor backend está corriendo en http://localhost:5000
pause 