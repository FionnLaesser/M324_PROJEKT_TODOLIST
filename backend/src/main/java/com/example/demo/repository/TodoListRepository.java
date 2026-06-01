package com.example.demo.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.demo.model.TodoList;

public interface TodoListRepository extends JpaRepository<TodoList, Long> {
	Optional<TodoList> findByInviteToken(String inviteToken);

	boolean existsByInviteToken(String inviteToken);
}
