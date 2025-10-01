<#
  scripts/dev-setup.ps1
  Helper script for Windows PowerShell to copy .env.local.example -> .env.local
  and remind the developer to fill secrets.
#>

$example = Join-Path $PSScriptRoot '..\.env.local.example'
$dest = Join-Path $PSScriptRoot '..\.env.local'

if (Test-Path $dest) {
    Write-Host ".env.local already exists at $dest" -ForegroundColor Yellow
    exit 0
}

if (-not (Test-Path $example)) {
    Write-Host "Could not find .env.local.example at $example" -ForegroundColor Red
    exit 1
}

Copy-Item -Path $example -Destination $dest
Write-Host "Copied .env.local.example -> .env.local" -ForegroundColor Green
Write-Host "Please open .env.local and fill the required values (do NOT commit this file)." -ForegroundColor Cyan
