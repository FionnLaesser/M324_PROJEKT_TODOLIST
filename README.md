# Todo App

Dieses Projekt ist eine Todo-App mit React im Frontend, Java Spring Boot im Backend und Keycloak für die Anmeldung. Das Backend speichert die Daten in MySQL und stellt eine REST API unter `/api` bereit. Die API-Version wird über den Header `X-API-Version: 1` gesteuert.

## Kurzstart

Wenn Docker verwendet wird, kannst du entweder die Startscripts nutzen oder Docker Compose direkt ausführen.

Windows:

```powershell
Copy-Item .env.example .env
.\start.ps1
```

Linux:

```bash
cp .env.example .env
bash ./start.sh
```

Direkt ohne Script geht auch:

```bash
docker compose up --build -d
```

Die Scripts führen intern auch `docker compose up --build -d` aus und zeigen danach nur zusätzlich die wichtigsten Ports an.

Danach ist die App hier erreichbar:

```text
http://localhost:5173
```

Die zweite kleine Keycloak-Demo läuft hier:

```text
http://localhost:5174
```

Keycloak läuft im Compose-Setup zusätzlich hier:

```text
http://localhost:8081
```

Login für die App:

```text
Benutzername: demo
Passwort: demo
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
keycloak-demo/  Kleine zweite Webseite für Keycloak auf Port 5174
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
CORS_ALLOWED_ORIGINS=http://localhost:5173,http://localhost:5174
KEYCLOAK_ADMIN_USERNAME=admin
KEYCLOAK_ADMIN_PASSWORD=admin
```

3. Container starten.

Windows:

```powershell
.\start.ps1
```

Linux:

```bash
bash ./start.sh
```

Oder direkt mit Docker Compose:

```bash
docker compose up --build -d
```

4. App öffnen:

```text
http://localhost:5173
```

5. Zweite Keycloak-Demo öffnen:

```text
http://localhost:5174
```

6. Keycloak Admin öffnen:

```text
http://localhost:8081
```

7. In der App oder in der Demo anmelden:

```text
http://localhost:5173
http://localhost:5174
Benutzername: demo
Passwort: demo
```

8. Container stoppen:

```powershell
docker compose down
```

Hinweis: In Docker zeigt das Frontend intern auf `/api`. Nginx leitet diese Requests an das Backend weiter.
Keycloak wird als eigener Container gestartet und importiert beim ersten Start das Realm aus `keycloak/realm-export.json`. Das Frontend nutzt den Keycloak Authorization-Code-Flow mit PKCE. Das Backend validiert die Access Tokens und legt beim ersten Zugriff automatisch einen lokalen Todo-Benutzer an.
Die zweite Demo nutzt denselben Realm und denselben Public Client `todo-frontend`, aber den Origin `http://localhost:5174`.

Wenn Keycloak schon einmal mit einem alten Docker-Volume gestartet wurde, wird der Realm-Import nicht erneut angewendet. Dann im Keycloak Admin beim Client `todo-frontend` `http://localhost:5174/*` bei den Valid Redirect URIs und `http://localhost:5174` bei den Web Origins ergänzen, oder das Keycloak-Volume für einen frischen Import neu erstellen.

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

### 3. Zweite Keycloak-Demo starten

Die zweite Webseite ist statisch und kann separat auf Port `5174` gestartet werden:

```powershell
cd keycloak-demo
npx vite --host 127.0.0.1 --port 5174
```

Danach ist sie hier erreichbar:

```text
http://localhost:5174
```

Für den lokalen Backend-Start muss `CORS_ALLOWED_ORIGINS` beide Origins enthalten:

```env
CORS_ALLOWED_ORIGINS=http://localhost:5173,http://localhost:5174
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
CORS_ALLOWED_ORIGINS=http://localhost:5173,http://localhost:5174
KEYCLOAK_ADMIN_USERNAME=admin
KEYCLOAK_ADMIN_PASSWORD=admin
KEYCLOAK_ISSUER_URI=http://localhost:8081/realms/todo-app
KEYCLOAK_JWK_SET_URI=http://localhost:8081/realms/todo-app/protocol/openid-connect/certs
KEYCLOAK_CLIENT_ID=todo-frontend
VITE_KEYCLOAK_URL=http://localhost:8081
VITE_KEYCLOAK_REALM=todo-app
VITE_KEYCLOAK_CLIENT_ID=todo-frontend
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

Die REST API nutzt Request Header Versioning. Die URL bleibt normal, zum Beispiel `/api/lists`. Die Version wird über diesen Header mitgegeben:

```text
X-API-Version: 1
```

Für die Demo gibt es zusätzlich `GET /api/version`. Dieser Endpunkt hat je eine eigene Controller-Methode für Version 1 und Version 2.

Mehr Details stehen hier: [docs/api-versionierung.md](docs/api-versionierung.md)

Beispiel-Endpunkte:

```text
GET  /api/version
GET  /api/lists
POST /api/lists
GET  /api/lists/{listId}/todos
POST /api/lists/{listId}/todos
```

Die Todo-Endpunkte erwarten zusätzlich einen Keycloak Bearer Token im Header `Authorization`. Der normale Login läuft deshalb über das Frontend und Keycloak.

Version 1 und 2 mit curl zeigen:

```bash
curl -i http://localhost:8080/api/version \
  -H "X-API-Version: 1"

curl -i http://localhost:8080/api/version \
  -H "X-API-Version: 2"
```

Login mit Version 2 als Demo:

```bash
curl -i -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -H "X-API-Version: 2" \
  -d "{}"
```

Ein unbekannter Header wie `X-API-Version: 99` wird weiterhin mit HTTP 400 abgelehnt.

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
- Port `5174` ist belegt: Keycloak-Demo stoppen oder einen anderen Port verwenden und den Origin in Keycloak ergänzen.
- Port `8080` ist belegt: anderes Backend stoppen.
- Port `8081` ist belegt: anderen Keycloak-Port in `docker-compose.yml` setzen oder den belegenden Dienst stoppen.
- Backend startet nicht: Prüfen, ob Port `8080` frei ist und ob das Log einen konkreten Fehler zeigt.
- Login geht nicht: Prüfen, ob Frontend, Backend und Keycloak laufen. Danach `docker compose logs keycloak backend` anschauen.
- Docker startet nicht: Prüfen, ob Docker Desktop läuft und `.env` vorhanden ist.
- `502 Bad Gateway`: Meistens läuft das Backend nicht. Logs prüfen mit `docker compose logs backend`.

## Nützliche Links

- Frontend: `http://localhost:5173`
- Keycloak-Demo: `http://localhost:5174`
- Backend: `http://localhost:8080`
- API Prefix: `http://localhost:8080/api`
- Keycloak: `http://localhost:8081`
