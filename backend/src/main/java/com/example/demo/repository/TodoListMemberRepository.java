package com.example.demo.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.demo.model.TodoListMember;

public interface TodoListMemberRepository extends JpaRepository<TodoListMember, Long> {
	List<TodoListMember> findByUser_IdOrderByTodoList_NameAsc(Long userId);

	Optional<TodoListMember> findByUser_IdAndTodoList_Id(Long userId, Long todoListId);

	boolean existsByUser_IdAndTodoList_Id(Long userId, Long todoListId);
}
