@echo off
setlocal
cd /d "%~dp0"

title Sirdas AI - Baslatici
echo Sirdas AI yerel ortami hazirlaniyor...

set "CODEX_NODE=%USERPROFILE%\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin"
set "CODEX_BIN=%USERPROFILE%\.cache\codex-runtimes\codex-primary-runtime\dependencies\bin"
set "CODEX_PNPM=%USERPROFILE%\.cache\codex-runtimes\codex-primary-runtime\dependencies\bin\pnpm.cmd"
set "PM=npm"
set "PM_KIND=npm"

if exist "%CODEX_NODE%\node.exe" set "PATH=%CODEX_NODE%;%CODEX_BIN%;%PATH%"

where node >nul 2>&1
if errorlevel 1 (
  if exist "%CODEX_NODE%\node.exe" (
    rem Packaged Node was added to PATH above.
  ) else (
    echo.
    echo HATA: Node.js bulunamadi. Node.js 20 veya uzerini kurun.
    pause
    exit /b 1
  )
)

where npm >nul 2>&1
if errorlevel 1 (
  if exist "%CODEX_PNPM%" (
    set "PM=pnpm.cmd"
    set "PM_KIND=pnpm"
  ) else (
    echo.
    echo HATA: npm veya pnpm bulunamadi. Node.js kurulumunu kontrol edin.
    pause
    exit /b 1
  )
)

if not exist "node_modules" (
  echo Bagimliliklar kuruluyor...
  call %PM% install
  if errorlevel 1 goto :error
)

if not exist "backend\.env" (
  echo Gelistirme ortami olusturuluyor...
  call %PM% run setup:dev
  if errorlevel 1 goto :error
)

if not exist "backend\prisma\sirdas.db" (
  echo Prisma istemcisi hazirlaniyor...
  call %PM% run db:generate
  if errorlevel 1 goto :error

  echo Veritabani hazirlaniyor...
  if "%PM_KIND%"=="npm" (
    call npm run db:deploy -w backend
  ) else (
    call %PM% --dir backend run db:deploy
  )
  if errorlevel 1 goto :error
)

echo.
echo Sirdas AI baslatiliyor...
echo Arayuz:  http://127.0.0.1:5173
echo API:     http://127.0.0.1:4000
echo.
echo Kapatmak icin Sirdas-AI-Durdur.cmd dosyasini calistirin.

if "%PM_KIND%"=="npm" (
  start "Sirdas AI - Backend" cmd /k "cd /d ""%~dp0"" && npm run dev -w backend"
  start "Sirdas AI - Frontend" cmd /k "cd /d ""%~dp0"" && npm run dev -w frontend -- --host 127.0.0.1"
) else (
  start "Sirdas AI - Backend" cmd /k "cd /d ""%~dp0"" && %PM% --dir backend run dev"
  start "Sirdas AI - Frontend" cmd /k "cd /d ""%~dp0"" && %PM% --dir frontend run dev --host 127.0.0.1"
)
if /I "%~1"=="--no-browser" exit /b 0
ping 127.0.0.1 -n 5 >nul
start "" "http://127.0.0.1:5173"
exit /b 0

:error
echo.
echo HATA: Sirdas AI baslatilamadi. Yukaridaki hata mesajini kontrol edin.
exit /b 1
