# Praxis Spickliste: Keycloak in der Todo-App

## Start

Keycloak ist in `docker-compose.yml` eingebaut und läuft auf Host-Port `8081`, weil das Backend bereits Port `8080` verwendet.

Alle Container starten:

```powershell
docker compose up --build -d
```

Nur Keycloak starten:

```powershell
docker compose up -d keycloak
```

Logs anzeigen:

```powershell
docker compose logs -f keycloak
```

## URLs

```text
Keycloak: http://localhost:8081
Todo-App: http://localhost:5173
Backend: http://localhost:8080
```

## Keycloak Admin

```text
Benutzername: admin
Passwort: admin
```

Die Werte können in `.env` überschrieben werden:

```env
KEYCLOAK_ADMIN_USERNAME=admin
KEYCLOAK_ADMIN_PASSWORD=admin
```

## Realm

```text
todo-app
```

Das Realm wird beim ersten Start automatisch aus `keycloak/realm-export.json` importiert.

## Client

```text
Client type: OpenID Connect
Client ID: todo-frontend
Client authentication: Off
Standard flow: On
Direct access grants: Off
Valid redirect URIs: http://localhost:5173/*
Web origins: http://localhost:5173
PKCE: S256
```

## Benutzer

```text
Username: demo
Email verified: On
Password: demo
```

## Rollen

```text
todo-user
todo-admin
```

## Gruppe

```text
todo-gruppe
```

## Zuweisungen

```text
Gruppe todo-gruppe bekommt Rolle todo-user
Benutzer demo kommt in Gruppe todo-gruppe
Benutzer demo bekommt Rolle todo-admin
```

## Gruppen im Token

Der Mapper schreibt die Keycloak-Gruppe vom Benutzer als Feld `groups` in den Token.

```text
Clients > todo-frontend > Client scopes > todo-frontend-dedicated > Mappers
Mapper: groups
Token Claim Name: groups
Full group path: Off
Add to ID token: On
Add to access token: On
Add to userinfo: On
```

Der Mapper ist durch den Realm-Import schon vorhanden. Er muss nur manuell angelegt werden, wenn das Realm gelöscht und ohne Import neu erstellt wurde.

## Login in der Todo-App

Die Todo-App verwendet Keycloak als Login. Ablauf:

```text
1. http://localhost:5173 öffnen
2. Mit Keycloak anmelden klicken
3. Benutzer demo und Passwort demo eingeben
4. Nach dem Login landet man wieder in der Todo-App
```

Das Frontend speichert den Keycloak Access Token und sendet ihn als `Authorization: Bearer ...` an das Backend. Das Backend validiert den Token über Keycloak und legt beim ersten Zugriff automatisch einen lokalen Todo-Benutzer mit Standardliste an.

## Lokaler Frontend-Start

```powershell
cd frontend
npm install
npm run dev
```

## Testdaten

```text
Keycloak URL: http://localhost:8081
Keycloak Login Benutzername: demo
Keycloak Login Passwort: demo
```

Nach dem Login sollte in der Todo-App `Angemeldet als demo` sichtbar sein.

## Erwartete Token-Daten

```text
Benutzername: demo
Realm: todo-app
Client: todo-frontend
Rollen: todo-user, todo-admin
Gruppen: todo-gruppe
```
