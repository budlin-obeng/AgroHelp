# AgroHelp Frontend Dashboard Launcher
Write-Host "========================================================" -ForegroundColor Green
Write-Host "Starting AgroHelp React / Vite Farmer Dashboard..." -ForegroundColor Green
Write-Host "Access URL: http://localhost:5173" -ForegroundColor Cyan
Write-Host "========================================================" -ForegroundColor Green

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location (Join-Path $ScriptDir "..\frontend")
npm run dev
