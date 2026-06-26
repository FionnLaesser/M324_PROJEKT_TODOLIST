# Kurzanleitung für die Installation der Entwicklungsumgebung zum Basisprojekt im Modul 324

## TLDR

ToDo-Liste mit React (frontend) und Spring (backend). Weitere Details sind in den
Kommentaren vor allem in App.js zu finden.

## REST API Versionierung

Die REST API ist mit URI Versioning umgesetzt. Alle Backend-Endpunkte verwenden jetzt den Prefix `/api/v1`, weil das für dieses Schulprojekt am einfachsten sichtbar und testbar ist.

Ausführliche Dokumentation: [docs/api-versionierung.md](docs/api-versionierung.md)

Beispiel-Endpunkte:

```text
POST /api/v1/auth/login
GET  /api/v1/lists
POST /api/v1/lists
GET  /api/v1/lists/{listId}/todos
POST /api/v1/lists/{listId}/todos
```

Kurzes curl Beispiel:

```bash
curl -i -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"username\":\"lisa\",\"password\":\"geheimespasswort\"}"
```

**Liebe Lernende, bitte FORKT dieses Repo für M324, und macht die Pull-Requests in euren FORKS.**

## Relevante Dateien in den Teil-Projekten (Verzeichnisse):

1. diese Beschreibung
2. frontend (Tools: npm und VSCode)
	* App.js

3. backend (Eclipse oder VS-Code)
	* DemoApplication.java
	* Task.java
	* pom.xml (JAR configuration, mit div. Plugins s.u.)

## Inbetriebnahme

1. forken oder clonen
1. *backend* in Eclipse importieren und mit Maven starten, oder in VS-Code via Java Extension Pack. Die Todos werden dauerhaft in `backend/data/tasks.json` gespeichert. Läuft auf default port 8080.
2. Im Terminal im *frontend* Verzeichnis
	1. mit `npm install` benötige Module laden
	2. mit `npm run dev` den Frontend-Server starten

## Benutzung

1. http://localhost:5173 zeigt das Frontend an. Hier kann man Tasks eingeben, die sofort darunter in der Liste mit einem *Done*-Button angezeigt werden.
2. Klickt man auf den *Done*-Button eines Tasks wird dieser aus der Liste entfernt (und natürlich auch von Backend-Server).
3. Die Task Beschreibungen müssen eindeutig (bzw. einmalig) sein.

### Anstehende Aufgaben

- Erweiterung der Funktionalität durch die Lernenden
- Alternatives Backend für eine VM (WAR Konfiguration)
- Test Umbegung mit Unit-Tests erweitern

(Ausgaben für white-box debugging sind bereits auf den beiden Server vorhanden)
