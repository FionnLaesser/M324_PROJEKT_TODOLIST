package com.example.demo;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest
class DemoApplicationTests {

	@Test
	void contextLoads() {
		assertTrue(true, "alles gut");
	}

	/**
	 * Test 1: Task-Klasse - Getter und Setter funktionieren korrekt
	 * Testet die Datentransfer-Eigenschaften der Task-Klasse
	 */
	@Test
	void testTaskGettersAndSetters() {
		// Arrange
		Task task = new Task();
		String taskDescription = "Projekt abschließen";
		String dueDate = "2026-06-15";
		String priority = "Hoch";

		// Act
		task.setTaskdescription(taskDescription);
		task.setDueDate(dueDate);
		task.setPriority(priority);

		// Assert
		assertEquals(taskDescription, task.getTaskdescription(), "Task-Beschreibung sollte korrekt gespeichert werden");
		assertEquals(dueDate, task.getDueDate(), "Fälligkeitsdatum sollte korrekt gespeichert werden");
		assertEquals(priority, task.getPriority(), "Priorität sollte korrekt gespeichert werden");
	}

	/**
	 * Test 2: Task-Konstruktor und Initialisierung
	 * Testet, dass eine neue Task korrekt initialisiert werden kann
	 */
	@Test
	void testTaskInitialization() {
		// Arrange
		Task task = new Task();

		// Act - Task mit Werten füllen
		task.setTaskdescription("Test-Aufgabe");
		task.setDueDate("2026-07-01");
		task.setPriority("Mittel");

		// Assert
		assertNotNull(task, "Task-Objekt sollte nicht null sein");
		assertEquals("Test-Aufgabe", task.getTaskdescription());
		assertEquals("2026-07-01", task.getDueDate());
		assertEquals("Mittel", task.getPriority());
	}

}
