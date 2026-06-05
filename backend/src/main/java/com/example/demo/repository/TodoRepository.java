package com.example.demo.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.demo.model.Todo;

public interface TodoRepository extends JpaRepository<Todo, Long> {
	List<Todo> findByTodoList_IdOrderByIdAsc(Long todoListId);

	Optional<Todo> findByIdAndTodoList_Id(Long id, Long todoListId);

	boolean existsByTodoList_IdAndTaskdescriptionIgnoreCase(Long todoListId, String taskdescription);

	boolean existsByTodoList_IdAndTaskdescriptionIgnoreCaseAndIdNot(Long todoListId, String taskdescription, Long id);
}
