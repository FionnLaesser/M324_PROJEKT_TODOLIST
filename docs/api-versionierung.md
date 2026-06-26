# REST API Versionierung

## 1. Einführung in REST API Versionierung mit Java und Spring Boot

Eine REST API kann sich im Laufe eines Projekts ändern. Es können neue Felder dazukommen, alte Endpunkte werden angepasst oder Antworten sehen anders aus. Wenn schon ein Frontend oder ein anderer Client die API nutzt, soll nicht plötzlich alles kaputt gehen.

Mit API-Versionierung kann man klar sagen, welche Version ein Client verwenden will. In diesem Projekt wird die Version über einen HTTP Header gesteuert:

```text
X-API-Version: 1
```

Die URL bleibt dadurch normal, zum Beispiel:

```text
POST /api/auth/login
GET  /api/lists
```

## 2. Übersicht über verschiedene Versionierungsmethoden

### URI Versioning

Die Version steht direkt im Pfad.

```text
GET /api/v1/lists
```

Das ist sehr sichtbar und einfach zu testen. Der Nachteil ist, dass die URL mit jeder Version anders wird.

### Request Parameter Versioning

Die Version wird als Query Parameter mitgegeben.

```text
GET /api/lists?version=1
```

Das ist einfach, aber der Parameter kann leicht vergessen werden. Ausserdem wirkt die URL weniger sauber.

### Request Header Versioning

Die Version wird in einem eigenen Header gesendet.

```text
X-API-Version: 1
```

Die URL bleibt gleich. Das passt gut, wenn man API-Versionierung nicht direkt im Pfad zeigen möchte. Der Client muss den Header aber immer mitsenden.

### Media Type / Accept Header Versioning

Die Version wird über den `Accept` Header gesteuert.

```text
Accept: application/vnd.todo.v1+json
```

Das ist flexibel und fachlich sauber, aber für dieses Projekt zu kompliziert.

## 3. Bewertung der Methoden mit Vor- und Nachteilen

| Methode | Vorteile | Nachteile | Eignung |
| --- | --- | --- | --- |
| URI Versioning | Sehr sichtbar, einfach mit Browser und curl | URL ändert sich pro Version | Gut für Schule und kleine Projekte |
| Request Parameter Versioning | Schnell umgesetzt, Pfad bleibt gleich | Parameter kann vergessen werden | Mittel |
| Request Header Versioning | URL bleibt sauber, flexibel, gut für Clients | Header ist im Browser nicht direkt sichtbar | Gut für dieses Projekt und grössere Projekte |
| Media Type Versioning | Sehr flexibel und HTTP-nah | Für Einsteiger eher kompliziert | Eher für professionelle APIs |

Bewertung nach Kriterien:

| Kriterium | Bewertung für Header Versioning |
| --- | --- |
| Einfachheit | Mittel. Ein Header muss im Backend geprüft und im Frontend gesetzt werden. |
| Verständlichkeit | Gut, wenn der Header dokumentiert ist. |
| Wartbarkeit | Gut, weil die URLs stabil bleiben. |
| Flexibilität | Gut, weil später weitere Versionen über denselben Pfad möglich sind. |
| Schule / kleines Projekt | Gut, weil man Header und zentrale Prüfung lernt. |
| Grössere Projekte | Gut, weil Clients gezielt eine Version anfordern können. |

## 4. Begründung, warum Request Header Versioning gewählt wurde

Für dieses Projekt wurde Request Header Versioning gewählt, weil die URLs sauber bleiben sollen. Statt `/api/v1/auth/login` wird wieder `/api/auth/login` verwendet. Die Version steht im Header `X-API-Version`.

Das ist flexibler als URI Versioning, weil die Pfade nicht für jede Version geändert werden müssen. In diesem Projekt gibt es darum einen kleinen Demo-Endpunkt `/api/version`, der mit Version 1 und Version 2 unterschiedliche Controller-Methoden verwendet.

Der Nachteil ist, dass man den Header nicht direkt in der URL sieht. Deshalb muss das Frontend den Header automatisch mitsenden und die Dokumentation muss klar sein.

## 5. Schritt-für-Schritt-Anleitung zur Umsetzung im Projekt

1. Alle REST Controller wurden geprüft.
2. Die Pfade wurden von `/api/v1/...` zurück auf `/api/...` geändert.
3. Im Backend wurde ein zentraler Filter erstellt.
4. Der Filter prüft bei API Requests den Header `X-API-Version`.
5. Erlaubt sind aktuell die Werte `1` und `2`.
6. Die bestehende Todo API ist als Version 1 markiert.
7. Der Endpunkt `GET /api/version` hat eine Methode für Version 1 und eine Methode für Version 2.
8. Fehlt der Header oder ist er falsch, antwortet das Backend mit HTTP 400.
9. CORS wurde angepasst, damit `X-API-Version` erlaubt ist.
10. Das Frontend setzt den Header automatisch bei jedem API Request.
11. Tests wurden angepasst.
12. Docker und Nginx leiten wieder `/api/...` weiter.

Wichtige Endpunkte:

```text
POST /api/auth/register
POST /api/auth/login
GET  /api/version
GET  /api/lists
POST /api/lists
POST /api/lists/{listId}/invites
POST /api/invitations/{token}/join
GET  /api/lists/{listId}/todos
POST /api/lists/{listId}/todos
PUT  /api/lists/{listId}/todos/{todoId}
DELETE /api/lists/{listId}/todos/{todoId}
```

## 6. Testen der Header-Versionierung

Backend Tests:

```bash
cd backend
./mvnw test
```

Frontend Tests:

```bash
cd frontend
npm test -- --runInBand
```

Frontend Build:

```bash
cd frontend
npm run build
```

Login mit korrektem Header:

```bash
curl -i -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -H "X-API-Version: 1" \
  -d "{\"username\":\"lisa\",\"password\":\"geheimespasswort\"}"
```

Beispiel ohne Header:

```bash
curl -i -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"username\":\"lisa\",\"password\":\"geheimespasswort\"}"
```

Erwartung ohne Header: HTTP 400 mit einer Meldung zur API-Version.

Version 1 und Version 2 am gleichen Endpunkt testen:

```bash
curl -i http://localhost:8080/api/version \
  -H "X-API-Version: 1"

curl -i http://localhost:8080/api/version \
  -H "X-API-Version: 2"
```

Bei Version 1 kommt eine Antwort mit `"version":"1"`. Bei Version 2 kommt eine Antwort mit `"version":"2"`. Das zeigt, dass Spring Boot anhand des Headers auf eine andere Methode geht.

### Bekannte Probleme und Lösungen

#### Fehlendes JWT_SECRET

Ohne Konfiguration kann das Backend nicht sicher Tokens erstellen. Für Docker und Produktion muss `JWT_SECRET` gesetzt sein. Für den lokalen Maven-Start gibt es ein `dev` Profil mit einem Dev-Default.

Beispielwerte stehen in `.env.example`.

#### 502 Bad Gateway im Frontend

Ein 502 Fehler entsteht meistens, wenn Nginx das Backend nicht erreicht. Das passiert zum Beispiel, wenn das Backend wegen fehlendem `JWT_SECRET` oder wegen falschen Datenbank-Zugangsdaten nicht startet.

Prüfen:

```bash
docker compose ps
docker compose logs backend
```

#### Header fehlt im Frontend

Das Frontend setzt den Header zentral in `App.jsx`. Dadurch muss er nicht bei jedem einzelnen Request von Hand gesetzt werden.

## 7. Zusammenfassung und Schlussfolgerung

Die API verwendet jetzt Request Header Versioning mit `X-API-Version: 1`. Die URLs bleiben normal unter `/api/...`. Das Frontend sendet die Version automatisch mit. Das Backend lehnt Requests ohne passende Version mit HTTP 400 ab.

Die Lösung ist etwas weniger sichtbar als URI Versioning, aber flexibler und sauber dokumentiert.
