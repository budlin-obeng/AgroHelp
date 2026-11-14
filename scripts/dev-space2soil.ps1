# Space2Soil Standalone Cockpit Launcher
Write-Host "========================================================" -ForegroundColor Green
Write-Host "Starting Space2Soil Standalone Earth Observation Cockpit..." -ForegroundColor Green
Write-Host "Access URL: http://127.0.0.1:8501" -ForegroundColor Cyan
Write-Host "========================================================" -ForegroundColor Green

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location (Join-Path $ScriptDir "..\Space2Soil")
python app.py --open
