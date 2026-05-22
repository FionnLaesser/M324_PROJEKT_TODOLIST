# Pull-Request Dokumentation

Stand: 22.05.2026

## 1. Funktionsweise von Pull-Requests

Ein Pull-Request (PR) ist ein Vorschlag, Aenderungen aus einem Arbeitsbranch in
einen Zielbranch zu uebernehmen. In GitLab heisst das gleiche Konzept meistens
Merge-Request (MR). Die Idee bleibt gleich: Die Aenderungen werden nicht direkt
auf `main` gemacht, sondern zuerst in einem eigenen Branch vorbereitet.

Typischer Ablauf:

1. Aktuellen Stand von `main` holen.
2. Neuen Branch fuer eine konkrete Aenderung erstellen.
3. Code, Dokumentation oder Tests anpassen.
4. Aenderungen lokal testen und committen.
5. Branch auf GitHub pushen.
6. Pull-Request von Arbeitsbranch nach `main` erstellen.
7. Teammitglied prueft die Aenderungen im PR.
8. Feedback einarbeiten, falls noetig.
9. PR mergen, wenn die Aenderung korrekt ist.
10. Lokalen `main` wieder aktualisieren.

Ein PR zeigt die Unterschiede zwischen Arbeitsbranch und Zielbranch. Dadurch kann
das Team den Code gezielt anschauen, Fragen stellen und Fehler finden, bevor die
Aenderung Teil des Hauptstands wird.

## 2. Umsetzung in unserem Versionierungssystem

Unser Projekt verwendet Git als Versionsverwaltung und GitHub als Plattform.

Repository:

- `FionnLaesser/M324_PROJEKT_TODOLIST`
- Remote: `origin`
- Hauptbranch: `main`
- Beispielbranch fuer diese Aufgabe: `feature/pull-request-dokumentation`

Empfohlener Git-Ablauf im Terminal:

```powershell
git switch main
git pull origin main
git switch -c feature/kurze-beschreibung

# Dateien bearbeiten
git status
git add <dateien>
git commit -m "Kurze Beschreibung der Aenderung"
git push -u origin feature/kurze-beschreibung
```

Danach auf GitHub:

1. Repository auf GitHub oeffnen.
2. Den Hinweis "Compare & pull request" auswaehlen oder ueber "Pull requests" einen neuen PR erstellen.
3. Als `base` den Branch `main` auswaehlen.
4. Als `compare` den eigenen Arbeitsbranch auswaehlen.
5. Titel und Beschreibung ausfuellen.
6. Im Reiter "Files changed" pruefen, ob nur gewollte Dateien enthalten sind.
7. Review durch ein anderes Teammitglied durchfuehren lassen.
8. Kommentare beantworten oder Aenderungen nachbessern.
9. PR mergen, wenn alles passt.
10. Arbeitsbranch loeschen und lokal `main` aktualisieren.

## 3. Durchgefuehrte Aenderungen am Projekt

Fuer diese Aufgabe wurde ein eigener Branch erstellt und eine kleine
Projektverbesserung umgesetzt. Damit ist im Pull-Request nicht nur Dokumentation,
sondern auch eine echte Code-Aenderung sichtbar.

| Bereich | Datei | Aenderung |
| --- | --- | --- |
| Frontend | `frontend/src/App.jsx` | Zeigt eine Meldung, wenn keine Tasks vorhanden sind oder kein Task zum Filter passt. |
| Frontend | `frontend/src/App.css` | Gestaltet die leere Listenmeldung passend zur bestehenden ToDo-Oberflaeche. |
| Dokumentation | `docs/Pull-Requests.md` | Beschreibt PR-Funktionsweise, GitHub-Ablauf, Nachweise und Nutzen. |

Nachweis des Arbeitsablaufs:

| Schritt | Ergebnis |
| --- | --- |
| Branch erstellt | `feature/pull-request-dokumentation` |
| Zielbranch | `main` |
| Pull-Request | Erstellen ueber `https://github.com/FionnLaesser/M324_PROJEKT_TODOLIST/pull/new/feature/pull-request-dokumentation` |
| Review | Im Team durchfuehren: Code lesen, App starten, Fragen/Kommentare im PR notieren. |
| Merge | Nach erfolgreichem Review in `main` mergen. |

## 4. Schritte fuer einen erfolgreichen Pull-Request

Diese Checkliste kann fuer weitere Team-Aenderungen verwendet werden:

1. **Branch aktuell halten:** Vor Beginn `git pull origin main` ausfuehren.
2. **Kleinen Branch erstellen:** Pro Aufgabe nur eine fachliche Aenderung umsetzen.
3. **Sprechenden Namen waehlen:** Zum Beispiel `feature/filter-reset` oder `docs/pr-dokumentation`.
4. **Aenderung testen:** App starten oder passende Tests ausfuehren.
5. **Diff kontrollieren:** Mit `git diff` oder GitHub "Files changed" pruefen.
6. **Commit erstellen:** Kurze, klare Commit-Message schreiben.
7. **PR-Beschreibung ausfuellen:** Was wurde geaendert, warum, wie wurde getestet?
8. **Review einholen:** Mindestens eine andere Person schaut die Aenderung an.
9. **Feedback einarbeiten:** Neue Commits in denselben Branch pushen.
10. **Mergen:** Erst wenn Review und Tests passen.
11. **Branch aufraeumen:** Remote-Branch loeschen und lokal `main` aktualisieren.

Sinnvolle Notizen in einem PR:

- Welche Dateien wurden geaendert?
- Welche Funktion wurde verbessert?
- Wie wurde getestet?
- Gibt es bekannte Einschraenkungen?
- Gibt es offene Fragen fuer das Review?

## 5. Nutzen von Pull-Requests

Pull-Requests erleichtern die Arbeit, weil Aenderungen sichtbar und nachvollziehbar
werden. Das Team sieht genau, was geaendert wurde, kann Kommentare direkt an die
betroffene Code-Zeile schreiben und muss Aenderungen nicht muendlich oder in
Chat-Nachrichten zusammensuchen.

Pull-Requests verbessern die Code-Qualitaet besonders durch Reviews. Eine zweite
Person erkennt oft Dinge, die der Autor uebersehen hat: unklare Namen, fehlende
Tests, unvollstaendige Fehlerbehandlung oder Aenderungen an falschen Dateien.
Ausserdem bleibt `main` stabiler, weil neue Arbeit zuerst in Branches landet.

Pull-Requests koennen die Arbeit aber auch erschweren. Bei sehr kleinen Aufgaben
fuehlen sie sich manchmal wie Zusatzaufwand an. Ausserdem kann Arbeit blockiert
werden, wenn Reviews lange dauern. Auch Merge-Konflikte koennen entstehen, wenn
mehrere Personen gleichzeitig an denselben Dateien arbeiten.

Unsere Einschaetzung: Fuer ein Teamprojekt lohnt sich der Aufwand. Die Aenderungen
werden sauber dokumentiert, die Zusammenarbeit wird transparenter und die
Wahrscheinlichkeit sinkt, dass fehlerhafter Code unbemerkt in `main` landet.
Wichtig ist, dass PRs klein bleiben und Reviews wirklich sorgfaeltig gemacht
werden.

## 6. Quellen

- GitHub Docs: About pull requests, https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/proposing-changes-to-your-work-with-pull-requests/about-pull-requests
- GitHub Docs: Creating a pull request, https://docs.github.com/en/articles/creating-a-pull-request
- GitHub Docs: Merging a pull request, https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/incorporating-changes-from-a-pull-request/merging-a-pull-request
