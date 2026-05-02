@echo off
setlocal enabledelayedexpansion

echo ============================================
echo  Starting PodcastStats Backend + ngrok
echo ============================================
echo.

REM --- Locate script directory ---
set SCRIPT_DIR=%~dp0
set ROOT_DIR=%~dp0..

REM --- Check .env ---
if not exist "%SCRIPT_DIR%.env" (
    echo ERROR: scripts\.env not found!
    echo Copy .env.example to scripts\.env and fill in values
    pause
    exit /b 1
)

REM --- Load .env ---
for /f "usebackq eol=# tokens=* delims=" %%a in ("%SCRIPT_DIR%.env") do (
    set "%%a"
)

REM --- Validate vars ---
if "%NGROK_TOKEN%"=="" (
    echo ERROR: NGROK_TOKEN missing in scripts\.env
    pause
    exit /b 1
)
if "%VERCEL_TOKEN%"=="" (
    echo ERROR: VERCEL_TOKEN missing in scripts\.env
    pause
    exit /b 1
)
if "%VERCEL_PROJECT_ID%"=="" (
    echo ERROR: VERCEL_PROJECT_ID missing in scripts\.env
    pause
    exit /b 1
)
if "%VERCEL_DEPLOY_HOOK_URL%"=="" (
    echo ERROR: VERCEL_DEPLOY_HOOK_URL missing in scripts\.env
    pause
    exit /b 1
)

@REM echo [1/4] Starting Docker...
@REM cd /d "%ROOT_DIR%"
@REM docker-compose up -d
@REM if errorlevel 1 (
@REM     echo ERROR: Docker failed
@REM     pause
@REM     exit /b 1
@REM )
@REM echo      Docker running
@REM echo.

echo [2/4] Killing old ngrok...
taskkill /F /IM ngrok.exe >nul 2>&1
timeout /t 2 >nul

echo [3/4] Starting ngrok on port 8000...
start "" /B ngrok http 8000 --authtoken=%NGROK_TOKEN% --host-header=rewrite --log=stdout --log-format=json > "%TEMP%\ngrok.log" 2>&1

echo      Waiting for tunnel...

set NGROK_URL=

for /l %%i in (1,1,30) do (
    timeout /t 1 >nul
    for /f "delims=" %%a in ('
        powershell -Command "try { (Invoke-RestMethod http://127.0.0.1:4040/api/tunnels).tunnels[0].public_url } catch {}"
    ') do (
        if not "%%a"=="" (
            set "NGROK_URL=%%a"
            goto :tunnel_ready
        )
    )
)

:tunnel_ready
if "%NGROK_URL%"=="" (
    echo ERROR: Could not detect ngrok URL
    pause
    exit /b 1
)

echo      Tunnel ready: !NGROK_URL!
echo.

echo [4/4] Updating Vercel environment...

REM --- Strip https:// for Vercel ---
set VERCEL_URL=!NGROK_URL:tcp://=https://!

echo      Sending to Vercel: !VERCEL_URL!

curl -X POST "https://api.vercel.com/v10/projects/%VERCEL_PROJECT_ID%/env?upsert=true" ^
    -H "Authorization: Bearer %VERCEL_TOKEN%" ^
    -H "Content-Type: application/json" ^
    -d "{\"key\":\"NEXT_PUBLIC_API_URL\",\"value\":\"!VERCEL_URL!\",\"type\":\"plain\",\"target\":[\"production\",\"preview\",\"development\"]}"

if errorlevel 1 (
    echo ERROR: Failed to update Vercel env
    pause
    exit /b 1
)

echo      Vercel env updated
echo.

echo Triggering redeploy...
curl -X POST "%VERCEL_DEPLOY_HOOK_URL%"

if errorlevel 1 (
    echo WARNING: Redeploy trigger failed
) else (
    echo      Redeploy triggered
)

echo.
echo ============================================
echo  Backend is LIVE
echo  URL: !NGROK_URL!
echo  Frontend will update in ~1 minute
echo ============================================
echo.

echo Press Ctrl+C to stop everything
echo.

:keepalive
timeout /t 30 >nul
goto :keepalive