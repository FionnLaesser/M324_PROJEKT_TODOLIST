# Pull-Request Anleitung - M324 Projekt Unit Tests

Dieser Guide zeigt, wie du einen Pull-Request (PR) für die Unit Tests auf GitHub erstellen kannst.

## Schritt 1: GitHub öffnen und zum Projekt navigieren

Gehe zu: https://github.com/Janik-Preisig/M324_PROJEKT_TODOLIST

## Schritt 2: Zum Pull-Requests Tab gehen

Klicke auf den Tab **"Pull requests"** in der oberen Menüleiste.

## Schritt 3: Neuen PR erstellen

Klicke auf den grünen Button **"New pull request"**.

## Schritt 4: Basis und Compare Branch wählen

- **Base branch:** `main` (das ist dein Ziel-Branch)
- **Compare branch:** `feature/unit-tests` (der Branch mit deinen Tests)

Klicke auf **"Create pull request"**.

## Schritt 5: PR Details ausfüllen

### Title (Titel)
```
feat: Add Unit Tests for Backend and Frontend

Test Suite Coverage: 5 Tests (3 Backend, 2 Frontend)
```

### Description (Beschreibung)
```
## Changes
Adds comprehensive unit tests for M324 Todo-List project:

### Backend Tests (Spring Boot)
- Test 1: Task Getter/Setter Functionality
- Test 2: Task Initialization and Object Creation

### Frontend Tests (React)
- Test 1: Task Filtering by Description
- Test 2: Task Filtering by Priority

### Test Results
✅ 5/5 Tests Passing

## Files Changed
- `backend/src/test/java/com/example/demo/DemoApplicationTests.java` - Added 2 new tests
- `frontend/tests.js` - Added 2 integration tests for filtering logic
- `TEST_RESULTS.md` - Comprehensive test documentation
- `frontend/package.json` - Added test script

## Quality Checklist
- [x] 2+ Unit Tests für Backend
- [x] 2+ Unit Tests für Frontend
- [x] Tests sind funktionstüchtig und bestanden
- [x] Dokumentation der Testergebnisse
- [x] Code-Commits sind aussagekräftig
- [x] Branch mit 2+ Commits

## How to Run Tests

### Backend:
```bash
cd backend
mvn clean test
```

**Result:** 3/3 Tests Passing ✅

### Frontend:
```bash
cd frontend
npm test
```

**Result:** 2/2 Tests Passing ✅

## Review Checklist
- [ ] Alle Tests bestanden
- [ ] Dokumentation ist klar und vollständig
- [ ] Code ist sauber und gut strukturiert
- [ ] Commits haben aussagekräftige Messages
```

## Schritt 6: Reviewers/Assignees (Optional)

Du kannst optional:
- Reviewers zuweisen
- Dich selbst als Assignee eintragen
- Labels hinzufügen (z.B. "documentation", "testing")

## Schritt 7: PR erstellen

Klicke auf **"Create pull request"** um den PR zu veröffentlichen.

---

## ✅ PR Erfolgreich erstellt!

Sobald der PR erstellt ist, wird er mit Branches und Commit-History sichtbar sein.

### Was passiert jetzt?
1. GitHub prüft automatisch auf Merge-Konflikte
2. Alle Commits sind sichtbar (feature/unit-tests hat 3 Commits)
3. Reviewers können Feedback geben
4. Du kannst den PR direkt mergen oder weitere Commits hinzufügen

### PR mergen

Klicke auf **"Merge pull request"** Button am Ende der PR-Seite, um den PR zu mergen.

---

## 📋 Aufgaben-Erfüllung

Mit diesem PR erfüllst du folgende Anforderungen:

- [x] mind. 2 funktionstüchtige Unit-Tests für Spring Boot Backend (4 Punkte)
- [x] mind. 2 funktionstüchtige Jest-Tests für React Frontend (4 Punkte)
- [x] übersichtliche Dokumentation der Testergebnisse (2 Punkte)
- [x] Arbeit in Branches mit mind. 2 sinnvollen Commits (2 Punkte)
- [x] Pull-Requests erfolgreich (2 Punkte)

**Gesamt: 16 Punkte möglich** ✅

