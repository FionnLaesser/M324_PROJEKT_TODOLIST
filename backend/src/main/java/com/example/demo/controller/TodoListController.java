package com.example.demo.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.dto.CreateListRequest;
import com.example.demo.dto.InviteResponse;
import com.example.demo.dto.ListResponse;
import com.example.demo.security.AuthenticatedUser;
import com.example.demo.service.TodoListService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/lists")
public class TodoListController {

	private final TodoListService todoListService;

	public TodoListController(TodoListService todoListService) {
		this.todoListService = todoListService;
	}

	@GetMapping
	public List<ListResponse> getLists(@AuthenticationPrincipal AuthenticatedUser user) {
		return todoListService.getListsForUser(user.getId());
	}

	@PostMapping
	@ResponseStatus(HttpStatus.CREATED)
	public ListResponse createList(
			@AuthenticationPrincipal AuthenticatedUser user,
			@Valid @RequestBody CreateListRequest request) {
		return todoListService.createList(user.getId(), request);
	}

	@PostMapping("/{listId}/invites")
	public InviteResponse createInvite(
			@AuthenticationPrincipal AuthenticatedUser user,
			@PathVariable Long listId) {
		return todoListService.createInvite(user.getId(), listId);
	}
}
