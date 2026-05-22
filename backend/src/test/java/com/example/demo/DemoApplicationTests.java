package com.example.demo;

import static org.junit.jupiter.api.Assertions.assertTrue;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest
class DemoApplicationTests {

	@Test
	void contextLoads() {
		assertTrue(true, "alles gut");
	}

	@Test
	void addTaskIgnoresBlankDescription() {
		DemoApplication application = new DemoApplication();

		application.addTask("{\"taskdescription\":\"   \",\"dueDate\":\"\",\"priority\":\"Mittel\"}");

		assertTrue(application.getTasks().isEmpty(), "Leere Todos duerfen nicht gespeichert werden");
	}

}
