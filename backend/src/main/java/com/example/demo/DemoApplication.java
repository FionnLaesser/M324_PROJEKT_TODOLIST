package com.example.demo;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.List;

import jakarta.annotation.PostConstruct;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;

/**
 * This is a demo application that provides a RESTful API for a simple ToDo list
 * with file persistence.
 * The endpoint "/" returns a list of tasks.
 * The endpoint "/tasks" adds a new unique task.
 * The endpoint "/delete" suppresses a task from the list.
 * The task description transferred from the (React) client is provided as a
 * request body in a JSON structure.
 * The data is converted to a task object using Jackson and added to the list of
 * tasks.
 * All endpoints are annotated with @CrossOrigin to enable cross-origin
 * requests.
 *
 * @author luh
 */
@RestController
@SpringBootApplication
public class DemoApplication {

	public static void main(String[] args) {
		SpringApplication.run(DemoApplication.class, args);
	}

	private List<Task> tasks = new ArrayList<>();
	private final ObjectMapper mapper = new ObjectMapper();
	private final Path storageFile = Path.of("data", "tasks.json");

	public static class UpdateTaskRequest {
		private String oldTaskdescription;
		private String taskdescription;
		private String dueDate;
		private String priority;

		public String getOldTaskdescription() {
			return oldTaskdescription;
		}

		public void setOldTaskdescription(String oldTaskdescription) {
			this.oldTaskdescription = oldTaskdescription;
		}

		public String getTaskdescription() {
			return taskdescription;
		}

		public void setTaskdescription(String taskdescription) {
			this.taskdescription = taskdescription;
		}

		public String getDueDate() {
			return dueDate;
		}

		public void setDueDate(String dueDate) {
			this.dueDate = dueDate;
		}

		public String getPriority() {
			return priority;
		}

		public void setPriority(String priority) {
			this.priority = priority;
		}
	}

	@PostConstruct
	public void loadTasks() {
		if (!Files.exists(storageFile)) {
			System.out.println("No persistent task file found at " + storageFile + ". Starting with empty task-list.");
			return;
		}

		try {
			tasks = mapper.readValue(storageFile.toFile(), new TypeReference<List<Task>>() {
			});
			System.out.println("Loaded " + tasks.size() + " tasks from " + storageFile + ".");
		} catch (IOException e) {
			System.out.println("Could not load tasks from " + storageFile + ". Starting with empty task-list.");
			e.printStackTrace();
			tasks = new ArrayList<>();
		}
	}

	private void saveTasks() {
		try {
			Path parent = storageFile.getParent();
			if (parent != null) {
				Files.createDirectories(parent);
			}
			mapper.writerWithDefaultPrettyPrinter().writeValue(storageFile.toFile(), tasks);
			System.out.println("Saved " + tasks.size() + " tasks to " + storageFile + ".");
		} catch (IOException e) {
			System.out.println("Could not save tasks to " + storageFile + ".");
			e.printStackTrace();
		}
	}

	@CrossOrigin
	@GetMapping("/")
	public List<Task> getTasks() {

		System.out.println("API EP '/' returns task-list of size " + tasks.size() + ".");
		if (tasks.size() > 0) {
			int i = 1;
			for (Task task : tasks) {
				System.out.println("-task " + (i++) + ":" + task.getTaskdescription());
			}
		}
		return tasks; // actual task list (internally converted to a JSON stream)
	}

	@CrossOrigin
	@PostMapping("/tasks")
	public String addTask(@RequestBody String taskdescription) {
		System.out.println("API EP '/tasks': '" + taskdescription + "'");
		try {
			Task task;
			task = mapper.readValue(taskdescription, Task.class);
			if (task.getTaskdescription() == null || task.getTaskdescription().isBlank()) {
				System.out.println(">>>empty task descriptions are ignored!");
				return "redirect:/";
			}
			task.setTaskdescription(task.getTaskdescription().trim());
			if (task.getPriority() == null || task.getPriority().isBlank()) {
				task.setPriority("Mittel");
			}
			for (Task t : tasks) {
				if (t.getTaskdescription().equals(task.getTaskdescription())) {
					System.out.println(">>>task: '" + task.getTaskdescription() + "' already exists!");
					return "redirect:/"; // duplicates will be ignored
				}
			}
			System.out.println("...adding task: '" + task.getTaskdescription() + "'");
			tasks.add(task);
			saveTasks();
		} catch (JsonProcessingException e) {
			e.printStackTrace();
		}
		return "redirect:/";
	}

	@CrossOrigin
	@PostMapping("/update")
	public String updateTask(@RequestBody String taskUpdate) {
		System.out.println("API EP '/update': '" + taskUpdate + "'");
		try {
			UpdateTaskRequest update = mapper.readValue(taskUpdate, UpdateTaskRequest.class);
			for (Task existingTask : tasks) {
				boolean sameTask = existingTask.getTaskdescription().equals(update.getOldTaskdescription());
				boolean sameDescription = existingTask.getTaskdescription().equals(update.getTaskdescription());
				if (!sameTask && sameDescription) {
					System.out.println(">>>task: '" + update.getTaskdescription() + "' already exists!");
					return "redirect:/";
				}
			}

			for (Task task : tasks) {
				if (task.getTaskdescription().equals(update.getOldTaskdescription())) {
					System.out.println("...updating task: '" + update.getOldTaskdescription() + "'");
					task.setTaskdescription(update.getTaskdescription());
					task.setDueDate(update.getDueDate());
					task.setPriority(update.getPriority());
					saveTasks();
					return "redirect:/";
				}
			}
			System.out.println(">>>task: '" + update.getOldTaskdescription() + "' not found!");
		} catch (JsonProcessingException e) {
			e.printStackTrace();
		}
		return "redirect:/";
	}

	@CrossOrigin
	@PostMapping("/delete")
	public String delTask(@RequestBody String taskdescription) {
		System.out.println("API EP '/delete': '" + taskdescription + "'");
		try {
			Task task;
			task = mapper.readValue(taskdescription, Task.class);
			for (int i = 0; i < tasks.size(); i++) {
				Task t = tasks.get(i);
				if (t.getTaskdescription().equals(task.getTaskdescription())) {
					System.out.println("...deleting task: '" + task.getTaskdescription() + "'");
					tasks.remove(i);
					saveTasks();
					return "redirect:/";
				}
			}
			System.out.println(">>>task: '" + task.getTaskdescription() + "' not found!");
		} catch (JsonProcessingException e) {
			e.printStackTrace();
		}
		return "redirect:/";
	}

}
