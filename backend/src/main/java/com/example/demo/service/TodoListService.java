package com.example.demo.service;

import java.security.SecureRandom;
import java.util.Base64;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.example.demo.dto.CreateListRequest;
import com.example.demo.dto.InviteResponse;
import com.example.demo.dto.ListResponse;
import com.example.demo.model.AppUser;
import com.example.demo.model.ListRole;
import com.example.demo.model.TodoList;
import com.example.demo.model.TodoListMember;
import com.example.demo.repository.AppUserRepository;
import com.example.demo.repository.TodoListMemberRepository;
import com.example.demo.repository.TodoListRepository;

@Service
public class TodoListService {

	private static final String DEFAULT_LIST_NAME = "Meine Todos";
	private static final int INVITE_TOKEN_BYTES = 32;
	private static final SecureRandom SECURE_RANDOM = new SecureRandom();

	private final TodoListRepository todoListRepository;
	private final TodoListMemberRepository memberRepository;
	private final AppUserRepository userRepository;

	public TodoListService(
			TodoListRepository todoListRepository,
			TodoListMemberRepository memberRepository,
			AppUserRepository userRepository) {
		this.todoListRepository = todoListRepository;
		this.memberRepository = memberRepository;
		this.userRepository = userRepository;
	}

	@Transactional
	public TodoList createDefaultList(AppUser owner) {
		return createList(owner, DEFAULT_LIST_NAME);
	}

	@Transactional
	public ListResponse createList(Long userId, CreateListRequest request) {
		AppUser owner = userRepository.findById(userId)
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Benutzer nicht gefunden"));
		String name = request.name() == null || request.name().isBlank() ? DEFAULT_LIST_NAME : request.name().trim();

		return toResponse(createList(owner, name), ListRole.OWNER);
	}

	@Transactional(readOnly = true)
	public List<ListResponse> getListsForUser(Long userId) {
		return memberRepository.findByUser_IdOrderByTodoList_NameAsc(userId)
				.stream()
				.map(member -> toResponse(member.getTodoList(), member.getRole()))
				.toList();
	}

	@Transactional
	public InviteResponse createInvite(Long userId, Long listId) {
		TodoListMember membership = requireMembership(userId, listId);

		if (membership.getRole() != ListRole.OWNER) {
			throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Keine Berechtigung");
		}

		TodoList list = membership.getTodoList();
		list.setInviteToken(generateUniqueInviteToken());

		return new InviteResponse(list.getId(), list.getInviteToken());
	}

	@Transactional
	public ListResponse joinByToken(Long userId, String token) {
		if (token == null || !token.matches("^[A-Za-z0-9_-]{32,128}$")) {
			throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Einladung nicht gefunden");
		}

		TodoList list = todoListRepository.findByInviteToken(token)
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Einladung nicht gefunden"));
		AppUser user = userRepository.findById(userId)
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Benutzer nicht gefunden"));

		if (!memberRepository.existsByUser_IdAndTodoList_Id(user.getId(), list.getId())) {
			TodoListMember member = new TodoListMember();
			member.setTodoList(list);
			member.setUser(user);
			member.setRole(ListRole.MEMBER);
			memberRepository.save(member);
		}

		TodoListMember membership = requireMembership(user.getId(), list.getId());
		return toResponse(list, membership.getRole());
	}

	@Transactional(readOnly = true)
	public TodoListMember requireMembership(Long userId, Long listId) {
		return memberRepository.findByUser_IdAndTodoList_Id(userId, listId)
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Liste nicht gefunden"));
	}

	private TodoList createList(AppUser owner, String name) {
		TodoList list = new TodoList();
		list.setName(name);
		list.setOwner(owner);
		list.setInviteToken(generateUniqueInviteToken());

		TodoList savedList = todoListRepository.save(list);

		TodoListMember ownerMembership = new TodoListMember();
		ownerMembership.setTodoList(savedList);
		ownerMembership.setUser(owner);
		ownerMembership.setRole(ListRole.OWNER);
		memberRepository.save(ownerMembership);

		return savedList;
	}

	private ListResponse toResponse(TodoList list, ListRole role) {
		return new ListResponse(list.getId(), list.getName(), role.name(), list.getOwner().getUsername());
	}

	private String generateUniqueInviteToken() {
		String token;
		do {
			byte[] bytes = new byte[INVITE_TOKEN_BYTES];
			SECURE_RANDOM.nextBytes(bytes);
			token = Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
		} while (todoListRepository.existsByInviteToken(token));

		return token;
	}
}
