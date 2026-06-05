# Test-Dokumentation

## Backend-Tests

Datei: `backend/src/test/java/com/example/demo/service/TodoServiceTest.java`

Erstellte Tests:

- `createTodoTrimsDescriptionAndUsesDefaultPriority`
  - prueft, dass Todo-Beschreibungen vor dem Speichern getrimmt werden
  - prueft, dass ein gueltiges Faelligkeitsdatum uebernommen wird
  - prueft, dass ohne Prioritaet automatisch `Mittel` gesetzt wird
- `createTodoRejectsDuplicateDescription`
  - prueft, dass ein Todo mit gleicher Beschreibung in derselben Liste abgelehnt wird
  - prueft, dass dabei `409 CONFLICT` zurueckgegeben wird
- `createTodoRejectsInvalidPriority`
  - prueft, dass ungueltige Prioritaeten abgelehnt werden
  - prueft, dass dabei `400 BAD_REQUEST` zurueckgegeben wird

Ausgefuehrter Befehl:

```powershell
cd backend
mvn test
```

Ergebnis:

- Erfolgreich
- Tests: 3
- Fehler: 0
- Fehlgeschlagen: 0

Screenshot-Platzhalter:

![Backend-Tests erfolgreich](screenshots/backend-tests-erfolgreich.png)

## Frontend-Tests

Datei: `frontend/src/App.test.jsx`

Erstellte Tests:

- `meldet Benutzer an und speichert die Sitzung`
  - prueft das Login-Formular
  - prueft den API-Aufruf an `/api/auth/login`
  - prueft, dass Token und Benutzer im Local Storage gespeichert werden
- `filtert geladene Todos nach Prioritaet`
  - prueft, dass Todos nach dem Laden angezeigt werden
  - prueft den Prioritaetsfilter
  - prueft die Zuruecksetzen-Funktion des Filters

Ausgefuehrter Befehl:

```powershell
cd frontend
npm test -- --runInBand
```

Ergebnis:

- Erfolgreich
- Tests: 2
- Fehler: 0

Zusaetzliche Pruefungen:

```powershell
cd frontend
npm run lint
npm run build
```

Ergebnis:

- Erfolgreich

Screenshot-Platzhalter:

![Frontend-Tests erfolgreich](screenshots/frontend-tests-erfolgreich.png)

## Branches, Commits und Pull Request

Verwendeter Branch:

```text
test/project-test-coverage
```

Screenshot-Platzhalter:

![Branch](screenshots/branch.png)
![Commits](screenshots/commits.png)
![Pull Request](screenshots/pull-request.png)
![PR gemerged](screenshots/pr-merged.png)

## Screenshots selbst erstellen

Empfohlene Screenshots:

- `docs/screenshots/backend-tests-erfolgreich.png`: Terminal nach erfolgreichem Backend-Testlauf mit `mvn test`
- `docs/screenshots/frontend-tests-erfolgreich.png`: Terminal nach erfolgreichem Frontend-Testlauf mit `npm test -- --runInBand`
- `docs/screenshots/branch.png`: Git-Ansicht oder Terminalausgabe von `git branch --show-current`
- `docs/screenshots/commits.png`: Git-Historie mit den erstellten Commits, zum Beispiel in der IDE oder mit `git log --oneline`
- `docs/screenshots/pull-request.png`: geoeffneter Pull Request auf GitHub
- `docs/screenshots/pr-merged.png`: gemergter Pull Request auf GitHub

Vorgehen:

1. Den passenden Befehl oder die passende GitHub-/IDE-Ansicht oeffnen.
2. Mit dem Windows Snipping Tool einen Screenshot erstellen.
3. Den Screenshot unter dem angegebenen Dateinamen in `docs/screenshots/` speichern.
4. Danach pruefen, ob die Bilder in dieser Dokumentation korrekt angezeigt werden.
