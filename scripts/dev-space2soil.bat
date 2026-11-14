@echo off
echo ========================================================
echo Starting Space2Soil Standalone Earth Observation Cockpit...
echo ========================================================
cd /d "%~dp0\..\Space2Soil"
python app.py --open
pause
