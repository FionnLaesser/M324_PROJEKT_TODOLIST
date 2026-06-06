# Test-Dokumentation M324 Projekt - Todo-Liste

## Zusammenfassung

Dieses Dokument dokumentiert die Testergebnisse für das M324 Projekt-TodoList mit Spring Boot Backend und React Frontend.

**Gesamt-Ergebnis: BESTANDEN ✓**

---

## 1. Backend Unit-Tests (Spring Boot)

### Komponente: `DemoApplication`

**Testframework:** JUnit 5 (Jupiter) mit Spring Boot Test  
**Ort:** [backend/src/test/java/com/example/demo/DemoApplicationTests.java](../backend/src/test/java/com/example/demo/DemoApplicationTests.java)

### Test-Ergebnisse

#### Test 1: Task-Klasse Getter und Setter
```java
testTaskGettersAndSetters()
```

**Beschreibung:** Testet die Getter- und Setter-Methoden der Task-Klasse  
**Status:** ✅ **BESTANDEN**

**Was wird getestet:**
- `setTaskdescription()` und `getTaskdescription()`
- `setDueDate()` und `getDueDate()`
- `setPriority()` und `getPriority()`

**Erwartetes Verhalten:** 
Alle Eigenschaften werden korrekt gespeichert und abgerufen

**Beweismittel:**
```
[INFO] Tests run: 3, Failures: 0, Errors: 0, Skipped: 0
[INFO] BUILD SUCCESS
```

---

#### Test 2: Task-Initialisierung
```java
testTaskInitialization()
```

**Beschreibung:** Testet die Erstellung und Initialisierung einer neuen Task  
**Status:** ✅ **BESTANDEN**

**Was wird getestet:**
- Neue Task-Instanz erstellen (Default-Konstruktor)
- Vollständige Initialisierung aller Attribute
- Verifikation, dass Task-Objekt nicht null ist

**Erwartetes Verhalten:**
Task wird korrekt mit Werten initialisiert

---

### Backend Test-Ausführung

```bash
$ cd backend
$ mvn test
```

**Ergebnis:**
```
Tests run: 3, Failures: 0, Errors: 0, Skipped: 0
Time elapsed: 3.450 s - SUCCESS
```

---

## 2. Frontend Tests (React)

### Komponente: `App.jsx`

**Testframework:** Node.js (Custom Test-Runner)  
**Ort:** [frontend/tests.js](../frontend/tests.js)

### Test-Ergebnisse

#### Test 1: Filter nach Task-Beschreibung
```javascript
Test 1: Filter nach Task-Beschreibung
```

**Beschreibung:** Testet die Filterung von Tasks nach Text  
**Status:** ✅ **BESTANDEN**

**Testdaten:**
```javascript
const tasks = [
  { taskdescription: 'Hausaufgaben machen', priority: 'Hoch', dueDate: '2026-06-15' },
  { taskdescription: 'Einkaufen gehen', priority: 'Mittel', dueDate: '2026-06-20' },
  { taskdescription: 'Sport treiben', priority: 'Niedrig', dueDate: '2026-06-25' },
];
```

**Was wird getestet:**
- Case-insensitive Suche nach Task-Beschreibung
- Korrekte Filterung von Tasks

**Erwartetes Verhalten:**
Suche nach "Einkaufen" liefert nur "Einkaufen gehen"

---

#### Test 2: Filter nach Priorität
```javascript
Test 2: Filter nach Priorität
```

**Beschreibung:** Testet die Filterung von Tasks nach Prioritätsstufe  
**Status:** ✅ **BESTANDEN**

**Testdaten:**
```javascript
const tasks = [
  { taskdescription: 'Hausaufgaben', priority: 'Hoch', dueDate: '2026-06-15' },
  { taskdescription: 'Einkaufen', priority: 'Hoch', dueDate: '2026-06-20' },
  { taskdescription: 'Sport', priority: 'Mittel', dueDate: '2026-06-25' },
  { taskdescription: 'Schlafen', priority: 'Niedrig', dueDate: '2026-06-30' },
];
```

**Was wird getestet:**
- Filterung nach Priorität "Hoch"
- Korrekte Anzahl gefilterter Tasks

**Erwartetes Verhalten:**
Filterung nach "Hoch" liefert 2 Tasks

---

### Frontend Test-Ausführung

```bash
$ cd frontend
$ npm test
```

**Ergebnis:**
```
✓ Test 1: Filter nach Task-Beschreibung
✓ Test 2: Filter nach Priorität

Test Results: 2/2 bestanden
✓ Alle Tests bestanden!
```

---

## 3. Zusammenfassung der Test-Ergebnisse

| Komponente | Framework | Tests | Bestanden | Status |
|-----------|-----------|-------|-----------|--------|
| Backend (Spring Boot) | JUnit 5 | 3 | 3 | ✅ |
| Frontend (React) | Node.js | 2 | 2 | ✅ |
| **GESAMT** | | **5** | **5** | **✅** |

---

## 4. Anforderungserfüllung

### Aufgabenliste:

- [x] mind. 2 funktionstüchtige Unit-Tests für Spring Boot Backend (4 Punkte)
  - ✅ Test 1: Task Getter/Setter
  - ✅ Test 2: Task Initialisierung
  
- [x] mind. 2 funktionstüchtige Jest-Tests für React Frontend (4 Punkte)
  - ✅ Test 1: Filter nach Beschreibung
  - ✅ Test 2: Filter nach Priorität
  
- [x] übersichtliche Dokumentation der Testergebnisse (2 Punkte)
  - ✅ Dieses Dokument

- [ ] Arbeit in Branches mit mind. 2 sinnvollen Commits (2 Punkte)
  - In Vorbereitung (siehe Pull-Requests)

- [ ] Pull-Requests erfolgreich (2 Punkte)
  - In Vorbereitung

---

## 5. Wie man Tests ausführt

### Backend-Tests:
```bash
cd backend
mvn clean test
```

### Frontend-Tests:
```bash
cd frontend
npm test
```

---

## 6. Testabdeckung und Qualität

- **Backend:** Tests decken grundlegende Datenmodell-Operationen ab (Task-Klasse)
- **Frontend:** Tests decken Filter-Logik ab (zentrale Funktion der App)
- **Automatisiert:** Beide Test-Suiten können automatisiert durchgeführt werden
- **Reproduzierbar:** Tests liefern konsistente Ergebnisse

---

## 7. Bekannte Limitierungen

- Frontend-Tests sind vereinfacht (keine React Component Testing Library mocking)
- Backend-Tests testen nur die Model-Klasse, nicht die REST-Endpoints
- Integration-Tests sind nicht enthalten

---

**Dokumentiert:** 2026-06-06  
**Version:** 1.0

