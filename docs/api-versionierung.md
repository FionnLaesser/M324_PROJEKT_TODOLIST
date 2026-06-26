# REST API Versionierung

## 1. Einführung in REST API Versionierung mit Java und Spring Boot

Eine REST API kann sich mit der Zeit ändern. Zum Beispiel kommen neue Felder dazu, alte Felder werden entfernt oder ein Endpoint bekommt eine andere Bedeutung. Wenn schon ein Frontend oder andere Clients die API verwenden, darf eine Änderung nicht einfach alles kaputt machen.

Darum kann man eine API versionieren. Die alte Version bleibt weiter erreichbar und eine neue Version kann sauber aufgebaut werden. In Spring Boot passiert das meistens direkt über die Routen in den Controllern oder über Header, die Spring bei den Requests auswertet.

In diesem Projekt gibt es ein Spring Boot Backend und ein React Frontend. Die API hatte vorher Pfade wie `/api/auth/login` und `/api/lists`. Für die Versionierung wurde daraus `/api/v1/...`.

## 2. Übersicht über verschiedene Versionierungsmethoden

### URI Versioning

Bei URI Versioning steht die Version direkt im Pfad.

Beispiel:

```text
GET /api/v1/lists
POST /api/v1/auth/login
```

Das ist sehr sichtbar und einfach zu testen. Man sieht die Version sofort im Browser, in curl und in den Frontend-Requests.

### Request Parameter Versioning

Bei dieser Variante steht die Version als Query Parameter in der URL.

Beispiel:

```text
GET /api/lists?version=1
```

Der Pfad bleibt gleich, aber der Server muss den Parameter auswerten. Für kleine Projekte ist das oft weniger klar, weil die Version nicht Teil des eigentlichen Pfads ist.

### Header Versioning

Bei Header Versioning wird die Version in einem eigenen Header gesendet.

Beispiel:

```text
X-API-Version: 1
```

Die URL bleibt sauber. Dafür muss der Client immer den richtigen Header mitsenden. Das ist für Tests mit Browser oder einfachen Tools weniger sichtbar.

### Media Type / Accept Header Versioning

Hier wird die Version über den `Accept` Header gesteuert.

Beispiel:

```text
Accept: application/vnd.todo.v1+json
```

Das ist fachlich sauber, weil es nahe am HTTP-Standard ist. Es ist aber auch die komplizierteste Variante und für dieses Schulprojekt eher zu viel.

## 3. Bewertung der Methoden mit Vor- und Nachteilen

| Methode | Vorteile | Nachteile | Eignung |
| --- | --- | --- | --- |
| URI Versioning | Einfach, gut sichtbar, leicht mit curl und Browser testbar | Die Version steht in der URL und muss bei neuen Versionen in den Pfaden geändert werden | Sehr gut für Schule und kleine Projekte |
| Request Parameter Versioning | Pfad bleibt gleich, schnell umsetzbar | Weniger eindeutig, Parameter kann vergessen werden, Caching kann schwieriger werden | Mittel für kleine Projekte |
| Header Versioning | URL bleibt sauber, flexibel für Clients | Nicht direkt im Browser sichtbar, Tests brauchen zusätzliche Header | Gut für grössere Projekte mit kontrollierten Clients |
| Media Type Versioning | Sehr flexibel und HTTP-nah | Komplizierter, für Einsteiger weniger verständlich | Gut für professionelle APIs, zu viel für dieses Projekt |

Bewertung nach den geforderten Kriterien:

| Kriterium | Beste Methode für dieses Projekt | Grund |
| --- | --- | --- |
| Einfachheit | URI Versioning | Der Pfad wird direkt in den Controllern angepasst. |
| Verständlichkeit | URI Versioning | `/api/v1` ist sofort sichtbar. |
| Wartbarkeit | URI Versioning | Für eine erste Version reicht eine klare Pfadstruktur. |
| Flexibilität | Header oder Media Type | Diese Varianten sind flexibler, aber auch komplexer. |
| Schule / kleines Projekt | URI Versioning | Es ist einfach erklärbar und gut testbar. |
| Grössere Projekte | Header oder Media Type | Dort sind mehrere Clients und lange Laufzeiten wahrscheinlicher. |

## 4. Begründung der gewählten Methode

Für dieses Projekt wurde URI Versioning gewählt.

Der wichtigste Grund ist, dass es zu einem Schulprojekt passt. Die Version ist direkt im Endpoint sichtbar und man kann sie mit curl, im Frontend und in Tests einfach prüfen. Das Projekt hatte bereits `/api/...` Pfade. Darum war die Änderung auf `/api/v1/...` sauber und ohne neue Technik möglich.

Andere Varianten wären fachlich auch möglich. Header Versioning oder Media Type Versioning wären aber für dieses Projekt unnötig kompliziert, weil es aktuell nur eine kleine API und ein eigenes Frontend gibt.

Pragmatische Entscheidung: Es gibt im Moment nur Version 1. Alte `/api/...` Pfade ohne `/v1` werden nicht zusätzlich unterstützt, damit die API klar bleibt.

## 5. Schritt-für-Schritt-Anleitung zur Umsetzung im Projekt

1. Alle REST Controller suchen.
2. Die vorhandenen `@RequestMapping` Pfade prüfen.
3. Alle bestehenden `/api/...` Pfade auf `/api/v1/...` ändern.
4. Die Security Config anpassen, damit Login und Registrierung unter `/api/v1/auth/...` öffentlich bleiben.
5. Die Frontend-Basis-URL von `/api` auf `/api/v1` ändern.
6. Frontend-Tests und Playwright-Mocks auf `/api/v1` anpassen.
7. Einen Backend-Test ergänzen, der die Controller-Routen prüft.
8. README mit einem kurzen Hinweis auf diese Dokumentation ergänzen.

Angepasste wichtige Endpoints:

```text
POST /api/v1/auth/register
POST /api/v1/auth/login
GET  /api/v1/lists
POST /api/v1/lists
POST /api/v1/lists/{listId}/invites
POST /api/v1/invitations/{token}/join
GET  /api/v1/lists/{listId}/todos
POST /api/v1/lists/{listId}/todos
PUT  /api/v1/lists/{listId}/todos/{todoId}
DELETE /api/v1/lists/{listId}/todos/{todoId}
```

Swagger oder OpenAPI war im Projekt nicht eingerichtet. Darum musste dort nichts angepasst werden.

## 6. Testen der Versionierung

### Backend Tests

Im Backend kann man die Tests so starten:

```bash
cd backend
./mvnw test
```

Der Test `ApiVersioningTest` prüft, dass die Controller-Routen mit `/api/v1/` beginnen.

### Frontend Build

Im Frontend kann man prüfen, ob die angepasste API-Basis-URL sauber gebaut wird:

```bash
cd frontend
npm run build
```

### curl Beispiele

Registrieren:

```bash
curl -i -X POST http://localhost:8080/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d "{\"username\":\"lisa\",\"password\":\"geheimespasswort\"}"
```

Einloggen:

```bash
curl -i -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"username\":\"lisa\",\"password\":\"geheimespasswort\"}"
```

Listen abrufen:

```bash
curl -i http://localhost:8080/api/v1/lists \
  -H "Authorization: Bearer <TOKEN>"
```

Neue Liste erstellen:

```bash
curl -i -X POST http://localhost:8080/api/v1/lists \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"Schule\"}"
```

Todo erstellen:

```bash
curl -i -X POST http://localhost:8080/api/v1/lists/1/todos \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d "{\"taskdescription\":\"Mathe lernen\",\"dueDate\":\"2026-06-30\",\"priority\":\"Hoch\"}"
```

## 7. Zusammenfassung und Schlussfolgerung

Die API ist jetzt mit `/api/v1` versioniert. URI Versioning ist für dieses Projekt die beste Wahl, weil es einfach, sichtbar und gut testbar ist. Für grössere Projekte können Header oder Media Type Versioning später sinnvoller sein, wenn mehrere Clients unterstützt werden müssen.

Für die aktuelle Aufgabe ist die Lösung bewusst einfach gehalten. Sie passt zum bestehenden Spring Boot Backend und zum React Frontend, ohne unnötige neue Konzepte einzubauen.
