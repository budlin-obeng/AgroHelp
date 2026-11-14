# AgroHelp Backend Service Launcher
Write-Host "========================================================" -ForegroundColor Green
Write-Host "Starting AgroHelp FastAPI Backend Service (Port 8000)..." -ForegroundColor Green
Write-Host "Interactive Swagger Docs: http://localhost:8000/docs" -ForegroundColor Cyan
Write-Host "========================================================" -ForegroundColor Green

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location (Join-Path $ScriptDir "..\backend")
python -m uvicorn app.main:app --reload --port 8000
