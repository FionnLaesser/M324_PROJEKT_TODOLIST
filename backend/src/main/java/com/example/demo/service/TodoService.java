package com.example.demo.service;

import java.time.LocalDate;
import java.time.format.DateTimeParseException;
import java.util.List;
import java.util.Set;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.example.demo.dto.TodoRequest;
import com.example.demo.dto.TodoResponse;
import com.example.demo.model.Todo;
import com.example.demo.model.TodoList;
import com.example.demo.model.TodoListMember;
import com.example.demo.repository.TodoRepository;

@Service
public class TodoService {

	private static final String DEFAULT_PRIORITY = "Mittel";
	private static final Set<String> ALLOWED_PRIORITIES = Set.of("Niedrig", "Mittel", "Hoch");

	private final TodoRepository todoRepository;
	private final TodoListService todoListService;

	public TodoService(TodoRepository todoRepository, TodoListService todoListService) {
		this.todoRepository = todoRepository;
		this.todoListService = todoListService;
	}

	@Transactional(readOnly = true)
	public List<TodoResponse> getTodos(Long userId, Long listId) {
		todoListService.requireMembership(userId, listId);

		return todoRepository.findByTodoList_IdOrderByIdAsc(listId)
				.stream()
				.map(this::toResponse)
				.toList();
	}

	@Transactional
	public TodoResponse createTodo(Long userId, Long listId, TodoRequest request) {
		TodoListMember membership = todoListService.requireMembership(userId, listId);
		TodoList list = membership.getTodoList();
		String description = normalizeDescription(request.taskdescription());

		if (todoRepository.existsByTodoList_IdAndTaskdescriptionIgnoreCase(list.getId(), description)) {
			throw new ResponseStatusException(HttpStatus.CONFLICT, "Todo existiert bereits");
		}

		Todo todo = new Todo();
		todo.setTodoList(list);
		applyRequest(todo, request, description);

		return toResponse(todoRepository.save(todo));
	}

	@Transactional
	public TodoResponse updateTodo(Long userId, Long listId, Long todoId, TodoRequest request) {
		todoListService.requireMembership(userId, listId);
		String description = normalizeDescription(request.taskdescription());

		Todo todo = todoRepository.findByIdAndTodoList_Id(todoId, listId)
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Todo nicht gefunden"));

		if (todoRepository.existsByTodoList_IdAndTaskdescriptionIgnoreCaseAndIdNot(listId, description, todoId)) {
			throw new ResponseStatusException(HttpStatus.CONFLICT, "Todo existiert bereits");
		}

		applyRequest(todo, request, description);
		return toResponse(todo);
	}

	@Transactional
	public void deleteTodo(Long userId, Long listId, Long todoId) {
		todoListService.requireMembership(userId, listId);
		Todo todo = todoRepository.findByIdAndTodoList_Id(todoId, listId)
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Todo nicht gefunden"));

		todoRepository.delete(todo);
	}

	private void applyRequest(Todo todo, TodoRequest request, String description) {
		todo.setTaskdescription(description);
		todo.setDueDate(parseDueDate(request.dueDate()));
		todo.setPriority(normalizePriority(request.priority()));
	}

	private String normalizeDescription(String description) {
		String normalized = description == null ? "" : description.trim();

		if (normalized.isBlank()) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Todo-Text ist Pflicht");
		}

		return normalized;
	}

	private LocalDate parseDueDate(String dueDate) {
		if (dueDate == null || dueDate.isBlank()) {
			return null;
		}

		try {
			return LocalDate.parse(dueDate);
		} catch (DateTimeParseException exception) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Datum ist ungültig");
		}
	}

	private String normalizePriority(String priority) {
		String normalized = priority == null || priority.isBlank() ? DEFAULT_PRIORITY : priority.trim();

		if (!ALLOWED_PRIORITIES.contains(normalized)) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Priorität ist ungültig");
		}

		return normalized;
	}

	private TodoResponse toResponse(Todo todo) {
		String dueDate = todo.getDueDate() == null ? "" : todo.getDueDate().toString();

		return new TodoResponse(
				todo.getId(),
				todo.getTodoList().getId(),
				todo.getTaskdescription(),
				dueDate,
				todo.getPriority());
	}
}
