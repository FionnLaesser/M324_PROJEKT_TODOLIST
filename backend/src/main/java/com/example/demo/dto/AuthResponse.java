package com.example.demo.dto;

public record AuthResponse(String token, String tokenType, Long userId, String username) {
	public static AuthResponse bearer(String token, Long userId, String username) {
		return new AuthResponse(token, "Bearer", userId, username);
	}
}
