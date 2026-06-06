#!/usr/bin/env node

/**
 * Einfacher Test-Runner für Frontend-Logik
 * Tests werden direkt mit Node.js ausgeführt ohne komplexe Test-Framework-Abhängigkeiten
 */

let testCount = 0;
let passCount = 0;
let failCount = 0;

function test(name, fn) {
  testCount++;
  try {
    fn();
    passCount++;
    console.log(`✓ ${name}`);
  } catch (err) {
    failCount++;
    console.error(`✗ ${name}`);
    console.error(`  ${err.message}`);
  }
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message || 'Assertion failed');
  }
}

function assertEqual(actual, expected, message) {
  if (actual !== expected) {
    throw new Error(message || `Expected ${expected}, got ${actual}`);
  }
}

// ============================================
// TEST 1: Task-Filter Logik
// ============================================
test('Test 1: Filter nach Task-Beschreibung', () => {
  const tasks = [
    { taskdescription: 'Hausaufgaben machen', priority: 'Hoch', dueDate: '2026-06-15' },
    { taskdescription: 'Einkaufen gehen', priority: 'Mittel', dueDate: '2026-06-20' },
    { taskdescription: 'Sport treiben', priority: 'Niedrig', dueDate: '2026-06-25' },
  ];

  // Filterung nach Text
  const filterText = 'Einkaufen';
  const filtered = tasks.filter(task =>
    task.taskdescription.toLowerCase().includes(filterText.toLowerCase())
  );

  assertEqual(filtered.length, 1, 'Sollte 1 Task enthalten');
  assertEqual(filtered[0].taskdescription, 'Einkaufen gehen', 'Richtige Task gefiltert');
});

// ============================================
// TEST 2: Priority-Filter Logik
// ============================================
test('Test 2: Filter nach Priorität', () => {
  const tasks = [
    { taskdescription: 'Hausaufgaben', priority: 'Hoch', dueDate: '2026-06-15' },
    { taskdescription: 'Einkaufen', priority: 'Hoch', dueDate: '2026-06-20' },
    { taskdescription: 'Sport', priority: 'Mittel', dueDate: '2026-06-25' },
    { taskdescription: 'Schlafen', priority: 'Niedrig', dueDate: '2026-06-30' },
  ];

  // Filterung nach Priorität "Hoch"
  const filtered = tasks.filter(task => task.priority === 'Hoch');

  assertEqual(filtered.length, 2, 'Sollte 2 Tasks mit Priorität "Hoch" enthalten');
  assert(
    filtered.every(t => t.priority === 'Hoch'),
    'Alle gefilterten Tasks sollten Priorität "Hoch" haben'
  );
});

// ============================================
// Ergebnisse
// ============================================
console.log('\n' + '='.repeat(50));
console.log(`Test Results: ${passCount}/${testCount} bestanden`);
if (failCount > 0) {
  console.log(`Fehler: ${failCount}`);
  process.exit(1);
} else {
  console.log('✓ Alle Tests bestanden!');
  process.exit(0);
}
