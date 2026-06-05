package com.example.demo.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.LocalDate;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import com.example.demo.dto.TodoRequest;
import com.example.demo.dto.TodoResponse;
import com.example.demo.model.Todo;
import com.example.demo.model.TodoList;
import com.example.demo.model.TodoListMember;
import com.example.demo.repository.TodoRepository;

@ExtendWith(MockitoExtension.class)
class TodoServiceTest {

	private static final Long USER_ID = 7L;
	private static final Long LIST_ID = 13L;

	@Mock
	private TodoRepository todoRepository;

	@Mock
	private TodoListService todoListService;

	@InjectMocks
	private TodoService todoService;

	@Test
	void createTodoTrimsDescriptionAndUsesDefaultPriority() {
		TodoRequest request = new TodoRequest("  Mathe lernen  ", "2026-06-15", "");
		when(todoListService.requireMembership(USER_ID, LIST_ID)).thenReturn(membership());
		when(todoRepository.existsByTodoList_IdAndTaskdescriptionIgnoreCase(LIST_ID, "Mathe lernen"))
				.thenReturn(false);
		when(todoRepository.save(any(Todo.class))).thenAnswer(invocation -> {
			Todo todo = invocation.getArgument(0);
			todo.setId(99L);
			return todo;
		});

		TodoResponse response = todoService.createTodo(USER_ID, LIST_ID, request);

		assertEquals(99L, response.id());
		assertEquals(LIST_ID, response.listId());
		assertEquals("Mathe lernen", response.taskdescription());
		assertEquals("2026-06-15", response.dueDate());
		assertEquals("Mittel", response.priority());

		ArgumentCaptor<Todo> todoCaptor = ArgumentCaptor.forClass(Todo.class);
		verify(todoRepository).save(todoCaptor.capture());
		Todo savedTodo = todoCaptor.getValue();
		assertEquals("Mathe lernen", savedTodo.getTaskdescription());
		assertEquals(LocalDate.of(2026, 6, 15), savedTodo.getDueDate());
		assertEquals("Mittel", savedTodo.getPriority());
	}

	@Test
	void createTodoRejectsDuplicateDescription() {
		TodoRequest request = new TodoRequest("  Hausaufgabe  ", "", "Hoch");
		when(todoListService.requireMembership(USER_ID, LIST_ID)).thenReturn(membership());
		when(todoRepository.existsByTodoList_IdAndTaskdescriptionIgnoreCase(LIST_ID, "Hausaufgabe"))
				.thenReturn(true);

		ResponseStatusException exception = assertThrows(
				ResponseStatusException.class,
				() -> todoService.createTodo(USER_ID, LIST_ID, request));

		assertEquals(HttpStatus.CONFLICT, exception.getStatusCode());
		verify(todoRepository, never()).save(any(Todo.class));
	}

	@Test
	void createTodoRejectsInvalidPriority() {
		TodoRequest request = new TodoRequest("Einkaufen", "", "Dringend");
		when(todoListService.requireMembership(USER_ID, LIST_ID)).thenReturn(membership());
		when(todoRepository.existsByTodoList_IdAndTaskdescriptionIgnoreCase(LIST_ID, "Einkaufen"))
				.thenReturn(false);

		ResponseStatusException exception = assertThrows(
				ResponseStatusException.class,
				() -> todoService.createTodo(USER_ID, LIST_ID, request));

		assertEquals(HttpStatus.BAD_REQUEST, exception.getStatusCode());
		verify(todoRepository, never()).save(any(Todo.class));
	}

	private TodoListMember membership() {
		TodoList list = new TodoList();
		list.setId(LIST_ID);

		TodoListMember member = new TodoListMember();
		member.setTodoList(list);
		return member;
	}
}
