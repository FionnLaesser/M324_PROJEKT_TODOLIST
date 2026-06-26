package com.example.demo.controller;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.dto.ListResponse;
import com.example.demo.security.AuthenticatedUser;
import com.example.demo.service.TodoListService;

@RestController
@RequestMapping("/api/v1/invitations")
public class InvitationController {

	private final TodoListService todoListService;

	public InvitationController(TodoListService todoListService) {
		this.todoListService = todoListService;
	}

	@PostMapping("/{token}/join")
	public ListResponse join(
			@AuthenticationPrincipal AuthenticatedUser user,
			@PathVariable String token) {
		return todoListService.joinByToken(user.getId(), token);
	}
}
