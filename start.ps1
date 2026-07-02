$ErrorActionPreference = "Stop"

docker compose up --build -d

if ($LASTEXITCODE -ne 0) {
    exit $LASTEXITCODE
}

Write-Host ""
Write-Host "Dienste laufen:" -ForegroundColor Green
Write-Host "Frontend:  http://localhost:5173"
Write-Host "Backend:   http://localhost:8080"
Write-Host "Keycloak:  http://localhost:8081"
Write-Host ""
Write-Host "Login:"
Write-Host "Benutzer:  demo"
Write-Host "Passwort:  demo"
