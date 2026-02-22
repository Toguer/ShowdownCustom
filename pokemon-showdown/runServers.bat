@echo off
cd /d "%~dp0"

start "Pokemon Showdown" cmd /k node .\pokemon-showdown
start "Sprites Server"   cmd /k node .\sprites-server.js