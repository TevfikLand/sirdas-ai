@echo off
setlocal EnableExtensions EnableDelayedExpansion
title Sirdas AI - Durdurucu

set "FOUND=0"
echo Sirdas AI yerel sunuculari durduruluyor...

taskkill /FI "WINDOWTITLE eq Sirdas AI - Backend*" /T /F >nul 2>&1
if not errorlevel 1 set "FOUND=1"
taskkill /FI "WINDOWTITLE eq Sirdas AI - Frontend*" /T /F >nul 2>&1
if not errorlevel 1 set "FOUND=1"

for %%P in (4000 5173) do (
  for /f "tokens=5" %%A in ('netstat -ano ^| findstr /R /C:":%%P .*LISTENING"') do (
    set "PID=%%A"
    if not "!PID!"=="0" (
      taskkill /PID !PID! /T /F >nul 2>&1
      if not errorlevel 1 set "FOUND=1"
    )
  )
)

echo.
if "%FOUND%"=="1" (
  echo Sirdas AI durduruldu.
) else (
  echo Calisan bir Sirdas AI sunucusu bulunamadi.
)
exit /b 0
