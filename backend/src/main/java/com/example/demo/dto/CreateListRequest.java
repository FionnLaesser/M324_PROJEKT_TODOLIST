package com.example.demo.dto;

import jakarta.validation.constraints.Size;

public record CreateListRequest(
		@Size(max = 120, message = "Listenname darf maximal 120 Zeichen haben")
		String name) {
}
