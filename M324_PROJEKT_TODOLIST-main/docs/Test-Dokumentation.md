# Test-Dokumentation

Stand: 07.06.2026

## Ziel der Tests

In diesem Projekt wurden Unit-Tests fuer das Backend und das Frontend ergaenzt.
Die Tests dienen dazu, wichtige Grundfunktionen der Todo-Liste automatisch zu
ueberpruefen. Dadurch kann schneller erkannt werden, ob eine Aenderung am Code
eine bestehende Funktion kaputt macht.

Getestet werden zwei Bereiche:

- Backend mit Spring Boot und JUnit
- Frontend mit JavaScript/Jest

## Backend-Tests

Die Backend-Tests befinden sich in dieser Datei:

`backend/src/test/java/com/example/demo/DemoApplicationTests.java`

### Test 1: Task Getter und Setter

Dieser Test prueft, ob die Werte eines `Task`-Objekts korrekt gesetzt und wieder
ausgelesen werden koennen.

Getestete Werte:

- Beschreibung der Aufgabe
- Prioritaet
- Status der Aufgabe

Erwartung:

Die Werte, die mit den Setter-Methoden gesetzt werden, muessen mit den
Getter-Methoden wieder korrekt zurueckgegeben werden.

### Test 2: Task Initialisierung

Dieser Test prueft, ob ein neues `Task`-Objekt korrekt erstellt werden kann.

Erwartung:

Das Objekt darf nicht `null` sein und die initialen Werte muessen korrekt
gespeichert werden.

### Test 3: Spring Boot Context

Dieser Test prueft, ob der Spring-Boot-Application-Context erfolgreich geladen
werden kann.

Erwartung:

Die Anwendung startet im Testkontext ohne Fehler.

## Frontend-Tests

Die Frontend-Tests befinden sich in dieser Datei:

`frontend/tests.js`

### Test 1: Filterung nach Task-Beschreibung

Dieser Test prueft, ob Aufgaben anhand ihrer Beschreibung gefiltert werden
koennen.

Beispiel:

Wenn nach einem bestimmten Text gesucht wird, sollen nur Aufgaben angezeigt
werden, deren Beschreibung diesen Text enthaelt.

Erwartung:

Die gefilterte Liste enthaelt nur passende Tasks.

### Test 2: Filterung nach Prioritaet

Dieser Test prueft, ob Aufgaben anhand ihrer Prioritaet gefiltert werden
koennen.

Beispiel:

Wenn nach der Prioritaet `hoch` gefiltert wird, sollen nur Aufgaben mit dieser
Prioritaet in der Ergebnisliste bleiben.

Erwartung:

Die gefilterte Liste enthaelt nur Tasks mit der ausgewaehlten Prioritaet.

## Testergebnisse

| Bereich | Tests | Ergebnis |
| --- | --- | --- |
| Backend | 3 Tests | Erfolgreich |
| Frontend | 2 Tests | Erfolgreich |

## Ausfuehrung der Tests

### Backend

Die Backend-Tests werden im Ordner `backend` ausgefuehrt:

```bash
./mvnw test
```

Unter Windows kann auch dieser Befehl verwendet werden:

```bash
mvnw.cmd test
```

### Frontend

Die Frontend-Tests werden im Ordner `frontend` ausgefuehrt:

```bash
npm test
```

Falls im Projekt kein Test-Script vorhanden ist, muss in `package.json` ein
passendes Test-Script ergaenzt werden.

## Screenshot-Dokumentation

Die Screenshots sollen im folgenden Ordner abgelegt werden:

`docs/screenshots/tests/`

Falls der Ordner noch nicht existiert, muss er erstellt werden.

### Benoetigte Screenshots

| Datei | Wo aufnehmen? | Was muss sichtbar sein? |
| --- | --- | --- |
| `01_backend_tests_code.png` | IDE oder Editor | Datei `DemoApplicationTests.java` mit den Backend-Tests |
| `02_backend_tests_ergebnis.png` | Terminal | Erfolgreiche Ausfuehrung der Backend-Tests, z.B. `BUILD SUCCESS` oder `Tests run: ... Failures: 0` |
| `03_frontend_tests_code.png` | IDE oder Editor | Datei `frontend/tests.js` mit den Frontend-Tests |
| `04_frontend_tests_ergebnis.png` | Terminal | Erfolgreiche Ausfuehrung der Frontend-Tests, z.B. alle Tests passed |
| `05_branch_feature_unit_tests.png` | Terminal oder GitHub | Branch `feature/unit-tests` ist sichtbar |
| `06_commits.png` | Terminal oder GitHub | Die Commits fuer Backend-Tests, Frontend-Tests und Dokumentation sind sichtbar |
| `07_pull_request.png` | GitHub | Pull Request von `feature/unit-tests` nach `main` ist sichtbar |
| `08_pull_request_merged.png` | GitHub | Pull Request wurde erfolgreich gemerged |

## Einbindung der Screenshots in diese Dokumentation

Wenn die Screenshots erstellt wurden, koennen sie unter diesem Abschnitt
eingefuegt werden.

### Backend-Testcode

![Backend-Testcode](screenshots/tests/01_backend_tests_code.png)

### Backend-Testergebnis

![Backend-Testergebnis](screenshots/tests/02_backend_tests_ergebnis.png)

### Frontend-Testcode

![Frontend-Testcode](screenshots/tests/03_frontend_tests_code.png)

### Frontend-Testergebnis

![Frontend-Testergebnis](screenshots/tests/04_frontend_tests_ergebnis.png)

### Feature-Branch

![Feature-Branch](screenshots/tests/05_branch_feature_unit_tests.png)

### Commits

![Commits](screenshots/tests/06_commits.png)

### Pull Request

![Pull Request](screenshots/tests/07_pull_request.png)

### Gemergter Pull Request

![Gemergter Pull Request](screenshots/tests/08_pull_request_merged.png)

## Fazit

Durch die ergaenzten Unit-Tests wird die Qualitaet des Projekts verbessert. Die
Backend-Tests pruefen das Verhalten des `Task`-Modells und den Spring-Boot-Kontext.
Die Frontend-Tests pruefen die Filterlogik. Zusammen mit den Screenshots ist
nachvollziehbar dokumentiert, welche Tests erstellt und erfolgreich ausgefuehrt
wurden.
