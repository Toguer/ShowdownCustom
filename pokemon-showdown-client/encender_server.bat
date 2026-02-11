@echo off
setlocal

REM Ir a la carpeta donde está este .bat (la raíz del repo)
cd /d "%~dp0"

REM Arrancar el servidor del cliente (fallback) en una ventana nueva
start "PS Client Fallback" cmd /k node serve-client-fallback-plus-login.js

REM Esperar un poco a que el server levante (ajusta si quieres)
timeout /t 2 /nobreak >nul

REM Abrir el navegador en el cliente local, conectando al servidor remoto
start "" "http://localhost:8080/testclient.html?~~37.15.98.131:8000"

endlocal
