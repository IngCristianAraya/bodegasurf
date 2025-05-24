@echo off
echo ============================================
echo Iniciando el Frontend en http://localhost:3003
echo ============================================
cd frontend
echo Instalando dependencias...
call npm install --legacy-peer-deps
echo Iniciando Vite...
call npx vite --port 3003 --force
echo Si el navegador no se abre automáticamente, visita: http://localhost:3003
pause 