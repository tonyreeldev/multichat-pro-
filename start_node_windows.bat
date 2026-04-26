@echo off
setlocal
title Multichat Pro v2.0

echo ==========================================
echo    Multichat Pro v2.0 (Node.js)
echo ==========================================
echo.

:: Ir al directorio del script
cd /d "%~dp0"

:: 1. Intentar liberar el puerto 8000 (Metodo simplificado)
echo [1/3] Preparando entorno...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :8000 ^| findstr LISTENING') do (
    taskkill /f /pid %%a >nul 2>&1
)

:: 2. Verificar Node.js
node -v >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js no esta instalado.
    echo Por favor, instalalo desde: https://nodejs.org/
    pause
    exit /b 1
)

:: 3. Instalar/Actualizar dependencias
echo [2/3] Validando dependencias...
call npm install --no-fund --no-audit --loglevel error

:: 4. Iniciar Servidor y Abrir Navegador
echo [3/3] Iniciando servidor y abriendo navegador...
echo.
echo ------------------------------------------
echo  ACCESO: http://localhost:8000
echo ------------------------------------------
echo.

:: Abrir navegador en una ventana nueva
start "" "http://localhost:8000"

:: Ejecutar el servidor directamente
node server.js

if %errorlevel% neq 0 (
    echo.
    echo [ALERTA] El servidor se ha detenido.
    pause
)

endlocal
