package com.example.demo.dto;

public record TodoResponse(Long id, Long listId, String taskdescription, String dueDate, String priority) {
}
