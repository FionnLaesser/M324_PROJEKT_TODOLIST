package com.example.demo.dto;

import java.time.Instant;
import java.util.List;

public record ApiErrorResponse(Instant timestamp, int status, String message, List<String> details) {
	public static ApiErrorResponse of(int status, String message, List<String> details) {
		return new ApiErrorResponse(Instant.now(), status, message, details);
	}
}
