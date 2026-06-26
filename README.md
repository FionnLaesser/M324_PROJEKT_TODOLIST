# Todo App

Dieses Projekt ist eine Todo-App mit React im Frontend und Java Spring Boot im Backend. Das Backend speichert die Daten in MySQL und stellt eine REST API unter `/api/v1` bereit.

## Kurzstart

Wenn Docker verwendet wird:

```powershell
Copy-Item .env.example .env
docker compose up -d
```

Danach ist die App hier erreichbar:

```text
http://localhost:5173
```

Wichtig: Die Werte in `.env` müssen vorher sinnvoll gesetzt werden. `JWT_SECRET` muss mindestens 32 Zeichen lang sein.

## Voraussetzungen

- Java 17 oder neuer
- Node.js und npm
- Docker Desktop, falls die App mit Docker gestartet wird
- Git

## Projektstruktur

```text
backend/    Spring Boot REST API
frontend/   React Frontend mit Vite
docs/       Dokumentationen
```

## Start mit Docker

Docker ist der einfachste Start, wenn man nicht alles lokal installieren möchte.

1. `.env` Datei erstellen:

```powershell
Copy-Item .env.example .env
```

2. `.env` öffnen und Werte setzen:

```env
DB_PASSWORD=lokales-datenbank-passwort
MYSQL_ROOT_PASSWORD=lokales-root-passwort
JWT_SECRET=lokaler-jwt-schluessel-mit-mindestens-32-zeichen
JWT_EXPIRATION_MINUTES=120
```

3. Container starten:

```powershell
docker compose up -d
```

4. App öffnen:

```text
http://localhost:5173
```

5. Container stoppen:

```powershell
docker compose down
```

Hinweis: Die aktuelle Docker-Compose-Datei verwendet fertige Images. Für lokale Codeänderungen ist der lokale Start meistens besser.

## Lokaler Start für die Entwicklung

Für die Entwicklung kann man Backend und Frontend getrennt starten.

### 1. Datenbank starten

Am einfachsten läuft MySQL über Docker Compose:

```powershell
Copy-Item .env.example .env
docker compose up -d mysql
```

MySQL ist dann auf dem Host-Port `3307` erreichbar.

### 2. Backend starten

Im gleichen PowerShell-Fenster zuerst die Umgebungsvariablen setzen:

```powershell
$env:DB_URL="jdbc:mysql://localhost:3307/todo_app?createDatabaseIfNotExist=true&useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC"
$env:DB_USERNAME="todo_user"
$env:DB_PASSWORD="lokales-datenbank-passwort"
$env:JWT_SECRET="lokaler-jwt-schluessel-mit-mindestens-32-zeichen"
$env:JWT_EXPIRATION_MINUTES="120"
$env:CORS_ALLOWED_ORIGINS="http://localhost:5173"
```

Danach Backend starten:

```powershell
cd backend
.\mvnw.cmd spring-boot:run
```

Das Backend läuft danach auf:

```text
http://localhost:8080
```

### 3. Frontend starten

In einem zweiten Terminal:

```powershell
cd frontend
npm install
npm run dev
```

Das Frontend läuft danach auf:

```text
http://localhost:5173
```

Das Frontend verwendet standardmässig diese API:

```text
http://localhost:8080/api/v1
```

## API Versionierung

Die REST API nutzt URI Versioning mit `/api/v1`. Das ist für dieses Schulprojekt einfach sichtbar und gut testbar.

Mehr Details stehen hier: [docs/api-versionierung.md](docs/api-versionierung.md)

Beispiel-Endpunkte:

```text
POST /api/v1/auth/register
POST /api/v1/auth/login
GET  /api/v1/lists
POST /api/v1/lists
GET  /api/v1/lists/{listId}/todos
POST /api/v1/lists/{listId}/todos
```

Login mit curl:

```bash
curl -i -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"username\":\"lisa\",\"password\":\"geheimespasswort\"}"
```

## Tests

Backend-Tests:

```powershell
cd backend
.\mvnw.cmd test
```

Frontend-Tests:

```powershell
cd frontend
npm test -- --runInBand
```

Frontend-Build:

```powershell
cd frontend
npm run build
```

End-to-End-Test:

```powershell
cd frontend
npm run test:e2e
```

## Häufige Probleme

- Port `5173` ist belegt: Frontend stoppen oder einen anderen Vite-Port verwenden.
- Port `8080` ist belegt: anderes Backend stoppen.
- Backend startet nicht: Prüfen, ob `DB_PASSWORD` und `JWT_SECRET` gesetzt sind.
- Login geht nicht: Prüfen, ob Frontend und Backend laufen und die API unter `/api/v1` erreichbar ist.
- Docker startet nicht: Prüfen, ob Docker Desktop läuft und `.env` vorhanden ist.

## Nützliche Links

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:8080`
- API Prefix: `http://localhost:8080/api/v1`
