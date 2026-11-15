@echo off
echo ========================================================
echo Pushing AgroHelp to GitHub (https://github.com/budlin-obeng/AgroHelp)...
echo ========================================================
cd /d "%~dp0\.."
git push origin main
echo.
if %ERRORLEVEL% equ 0 (
    echo [SUCCESS] All commits successfully pushed to GitHub!
) else (
    echo [ERROR] Push failed. Please check your GitHub credentials or internet connection.
)
echo.
pause
