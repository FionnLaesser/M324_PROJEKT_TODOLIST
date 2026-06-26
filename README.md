# Todo App

Dieses Projekt ist eine Todo-App mit React im Frontend und Java Spring Boot im Backend. Das Backend speichert die Daten in MySQL und stellt eine REST API unter `/api` bereit. Die API-Version wird über den Header `X-API-Version: 1` gesteuert.

## Kurzstart

Wenn Docker verwendet wird:

```powershell
Copy-Item .env.example .env
docker compose up --build -d
```

Danach ist die App hier erreichbar:

```text
http://localhost:5173
```

Wichtig: Die Werte in `.env` müssen vorher sinnvoll gesetzt werden. `JWT_SECRET` muss mindestens 32 Zeichen lang sein und darf kein echtes produktives Secret sein.

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

Docker ist der einfachste Start, wenn man nicht alles lokal installieren möchte. Docker Compose baut dabei die lokalen Backend- und Frontend-Images.

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
CORS_ALLOWED_ORIGINS=http://localhost:5173
```

3. Container starten:

```powershell
docker compose up --build -d
```

4. App öffnen:

```text
http://localhost:5173
```

5. Container stoppen:

```powershell
docker compose down
```

Hinweis: In Docker zeigt das Frontend intern auf `/api`. Nginx leitet diese Requests an das Backend weiter.

## Lokaler Start für die Entwicklung

Für die Entwicklung kann man Backend und Frontend getrennt starten.

### 1. Backend starten

Das Backend lädt beim lokalen Maven-Start automatisch das Profil `dev`. Dieses Profil liest `../.env`, wenn das Backend aus dem Ordner `backend` gestartet wird.

Im `dev` Profil nutzt das Backend standardmässig eine H2 In-Memory-Datenbank. Dadurch kann man das Backend ohne MySQL starten. Die Daten sind nach einem Neustart wieder leer.

Backend mit Maven Wrapper starten:

```powershell
cd backend
.\mvnw.cmd spring-boot:run
```

Mit lokal installiertem Maven geht auch:

```powershell
cd backend
mvn spring-boot:run
```

Das Backend läuft danach auf:

```text
http://localhost:8080
```

### 2. Frontend starten

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
http://localhost:8080/api
```

## Benötigte ENV Variablen

Für Docker und den Start ohne `dev` Profil gibt es Beispielwerte in `.env.example`. Die Datei darf kopiert, aber echte Secrets dürfen nicht ins Git committet werden.

```env
DB_URL=jdbc:mysql://localhost:3307/todo_app?createDatabaseIfNotExist=true&useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC
DB_USERNAME=todo_user
DB_PASSWORD=lokales-datenbank-passwort
MYSQL_ROOT_PASSWORD=lokales-root-passwort
JWT_SECRET=dev-only-change-me-123456789012345678901234567890
JWT_EXPIRATION_MINUTES=120
CORS_ALLOWED_ORIGINS=http://localhost:5173
```

`JWT_SECRET` ist für Docker und Produktion Pflicht. Beim lokalen `dev` Profil gibt es zusätzlich einen Dev-Default, damit der Start nicht wegen einem fehlenden Placeholder abbricht. Dieser Default ist nur für Entwicklung gedacht.

Optional kann man das lokale `dev` Profil auf eine eigene Datenbank zeigen lassen:

```env
DEV_DB_URL=jdbc:h2:mem:todo_dev;MODE=MySQL;DATABASE_TO_LOWER=TRUE
DEV_DB_DRIVER=org.h2.Driver
DEV_DB_USERNAME=sa
DEV_DB_PASSWORD=
```

## API Versionierung

Die REST API nutzt Request Header Versioning. Die URL bleibt normal, zum Beispiel `/api/auth/login`. Die Version wird über diesen Header mitgegeben:

```text
X-API-Version: 1
```

Mehr Details stehen hier: [docs/api-versionierung.md](docs/api-versionierung.md)

Beispiel-Endpunkte:

```text
POST /api/auth/register
POST /api/auth/login
GET  /api/lists
POST /api/lists
GET  /api/lists/{listId}/todos
POST /api/lists/{listId}/todos
```

Login mit curl:

```bash
curl -i -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -H "X-API-Version: 1" \
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
- Backend startet nicht: Prüfen, ob Port `8080` frei ist und ob das Log einen konkreten Fehler zeigt.
- Login geht nicht: Prüfen, ob Frontend und Backend laufen und ob der Header `X-API-Version: 1` gesendet wird.
- Docker startet nicht: Prüfen, ob Docker Desktop läuft und `.env` vorhanden ist.
- `502 Bad Gateway`: Meistens läuft das Backend nicht. Logs prüfen mit `docker compose logs backend`.

## Nützliche Links

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:8080`
- API Prefix: `http://localhost:8080/api`
