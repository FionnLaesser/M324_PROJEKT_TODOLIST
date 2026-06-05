package com.example.demo.dto;

import jakarta.validation.constraints.NotBlank;

public record LoginRequest(
		@NotBlank(message = "Benutzername ist Pflicht")
		String username,

		@NotBlank(message = "Passwort ist Pflicht")
		String password) {
}
