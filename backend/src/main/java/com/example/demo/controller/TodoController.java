package com.example.demo.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.dto.TodoRequest;
import com.example.demo.dto.TodoResponse;
import com.example.demo.security.AuthenticatedUser;
import com.example.demo.service.TodoService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/lists/{listId}/todos")
public class TodoController {

	private final TodoService todoService;

	public TodoController(TodoService todoService) {
		this.todoService = todoService;
	}

	@GetMapping
	public List<TodoResponse> getTodos(
			@AuthenticationPrincipal AuthenticatedUser user,
			@PathVariable Long listId) {
		return todoService.getTodos(user.getId(), listId);
	}

	@PostMapping
	@ResponseStatus(HttpStatus.CREATED)
	public TodoResponse createTodo(
			@AuthenticationPrincipal AuthenticatedUser user,
			@PathVariable Long listId,
			@Valid @RequestBody TodoRequest request) {
		return todoService.createTodo(user.getId(), listId, request);
	}

	@PutMapping("/{todoId}")
	public TodoResponse updateTodo(
			@AuthenticationPrincipal AuthenticatedUser user,
			@PathVariable Long listId,
			@PathVariable Long todoId,
			@Valid @RequestBody TodoRequest request) {
		return todoService.updateTodo(user.getId(), listId, todoId, request);
	}

	@DeleteMapping("/{todoId}")
	@ResponseStatus(HttpStatus.NO_CONTENT)
	public void deleteTodo(
			@AuthenticationPrincipal AuthenticatedUser user,
			@PathVariable Long listId,
			@PathVariable Long todoId) {
		todoService.deleteTodo(user.getId(), listId, todoId);
	}
}
