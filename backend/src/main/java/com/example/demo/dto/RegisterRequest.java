package com.example.demo.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record RegisterRequest(
		@NotBlank(message = "Benutzername ist Pflicht")
		@Size(min = 3, max = 80, message = "Benutzername muss 3 bis 80 Zeichen haben")
		@Pattern(regexp = "^[A-Za-z0-9._-]+$", message = "Benutzername darf nur Buchstaben, Zahlen, Punkt, Unterstrich und Bindestrich enthalten")
		String username,

		@NotBlank(message = "Passwort ist Pflicht")
		@Size(min = 8, max = 128, message = "Passwort muss 8 bis 128 Zeichen haben")
		String password) {
}
