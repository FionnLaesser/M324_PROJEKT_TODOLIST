package com.example.demo.exception;

import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.servlet.resource.NoResourceFoundException;

import com.example.demo.dto.ApiErrorResponse;

@RestControllerAdvice
public class GlobalExceptionHandler {

	private static final Logger LOGGER = LoggerFactory.getLogger(GlobalExceptionHandler.class);

	@ExceptionHandler(MethodArgumentNotValidException.class)
	public ResponseEntity<ApiErrorResponse> handleValidation(MethodArgumentNotValidException exception) {
		List<String> details = exception.getBindingResult()
				.getFieldErrors()
				.stream()
				.map(error -> error.getField() + ": " + error.getDefaultMessage())
				.toList();

		return build(HttpStatus.BAD_REQUEST, "Eingaben sind ungültig", details);
	}

	@ExceptionHandler(ResponseStatusException.class)
	public ResponseEntity<ApiErrorResponse> handleStatus(ResponseStatusException exception) {
		HttpStatus status = HttpStatus.valueOf(exception.getStatusCode().value());
		String message = exception.getReason() == null ? status.getReasonPhrase() : exception.getReason();

		return build(status, message, List.of());
	}

	@ExceptionHandler(AccessDeniedException.class)
	public ResponseEntity<ApiErrorResponse> handleAccessDenied() {
		return build(HttpStatus.FORBIDDEN, "Keine Berechtigung", List.of());
	}

	@ExceptionHandler(DataIntegrityViolationException.class)
	public ResponseEntity<ApiErrorResponse> handleDataIntegrity(DataIntegrityViolationException exception) {
		LOGGER.warn("Data integrity violation", exception);
		return build(HttpStatus.CONFLICT, "Datensatz konnte nicht gespeichert werden", List.of());
	}

	@ExceptionHandler(NoResourceFoundException.class)
	public ResponseEntity<ApiErrorResponse> handleNoResourceFound() {
		return build(HttpStatus.NOT_FOUND, "Endpoint nicht gefunden", List.of());
	}

	@ExceptionHandler(Exception.class)
	public ResponseEntity<ApiErrorResponse> handleGeneric(Exception exception) {
		LOGGER.error("Unhandled backend error", exception);
		return build(HttpStatus.INTERNAL_SERVER_ERROR, "Interner Serverfehler", List.of());
	}

	private ResponseEntity<ApiErrorResponse> build(HttpStatus status, String message, List<String> details) {
		return ResponseEntity
				.status(status)
				.body(ApiErrorResponse.of(status.value(), message, details));
	}
}
