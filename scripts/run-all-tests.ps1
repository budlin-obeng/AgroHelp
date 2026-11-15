# AgroHelp Master Test Runner
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "Running AgroHelp & Space2Soil Consolidated Test Suites" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$RootDir = Join-Path $ScriptDir ".."

# 1. Run Space2Soil End-to-End Test Suite (13 Tests, including ECOSTRESS & SoilGrids)
Write-Host "`n[1/2] Executing Space2Soil End-to-End System Tests (13 Tests)..." -ForegroundColor Yellow
$Space2SoilDir = Join-Path $RootDir "Space2Soil"
Push-Location $Space2SoilDir
python src/validation/test_end_to_end.py
$Space2SoilExit = $LASTEXITCODE
Pop-Location

# 2. Run Backend ML & REST API Suite (17 Tests)
Write-Host "`n[2/2] Executing AgroHelp Backend ML & REST API Tests (17 Tests)..." -ForegroundColor Yellow
$BackendDir = Join-Path $RootDir "backend"
Push-Location $RootDir
python -m pytest backend/tests -v
$BackendExit = $LASTEXITCODE
Pop-Location

# Consolidated Summary
Write-Host "`n==========================================================" -ForegroundColor Cyan
if ($Space2SoilExit -eq 0 -and $BackendExit -eq 0) {
    Write-Host "ALL 30 TESTS PASSED SUCCESSFULLY! (100% Pass Rate)" -ForegroundColor Green
    Write-Host "• Space2Soil End-to-End Tests: PASS (13/13)" -ForegroundColor Green
    Write-Host "• AgroHelp Backend ML Tests:  PASS (17/17)" -ForegroundColor Green
} else {
    Write-Host "SOME TESTS FAILED! Check the logs above." -ForegroundColor Red
}
Write-Host "==========================================================" -ForegroundColor Cyan
