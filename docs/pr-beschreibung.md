# PR-Beschreibung

## Ziel

Die Testabdeckung für Backend und Frontend wird erweitert und die Testdurchführung wird dokumentiert.

## Änderungen

- Backend: Neue Unit-Tests für `TodoService` mit JUnit 5 und Mockito.
- Frontend: Neues Jest-Setup mit React Testing Library.
- Frontend: Tests für Login-Verhalten und Todo-Filterung.
- Dokumentation: Testübersicht, Testbefehle, Ergebnisse und Screenshot-Platzhalter ergänzt.

## Tests

```powershell
cd backend
mvn test
```

```powershell
cd frontend
npm test -- --runInBand
npm run lint
npm run build
```

## Screenshots für den Pull Request

- Backend-Tests erfolgreich: `docs/screenshots/backend-tests-erfolgreich.png`
- Frontend-Tests erfolgreich: `docs/screenshots/frontend-tests-erfolgreich.png`
- Branch-Ansicht: `docs/screenshots/branch.png`
- Commit-Ansicht: `docs/screenshots/commits.png`
- Pull-Request-Ansicht: `docs/screenshots/pull-request.png`
- Gemergter Pull Request: `docs/screenshots/pr-merged.png`
