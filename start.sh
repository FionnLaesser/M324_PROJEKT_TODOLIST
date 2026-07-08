#!/usr/bin/env bash
set -euo pipefail

docker compose up --build -d

echo
echo "Dienste laufen:"
echo "Frontend:       http://localhost:5173"
echo "Keycloak-Demo:  http://localhost:5174"
echo "Backend:        http://localhost:8080"
echo "Keycloak:       http://localhost:8081"
echo
echo "Login:"
echo "Benutzer:  demo"
echo "Passwort:  demo"
