package com.example.demo.service;

import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.example.demo.dto.AuthResponse;
import com.example.demo.dto.LoginRequest;
import com.example.demo.dto.RegisterRequest;
import com.example.demo.model.AppUser;
import com.example.demo.model.ApplicationRole;
import com.example.demo.repository.AppUserRepository;
import com.example.demo.security.AuthenticatedUser;
import com.example.demo.security.JwtService;

@Service
public class AuthService {

	private final AppUserRepository userRepository;
	private final PasswordEncoder passwordEncoder;
	private final JwtService jwtService;
	private final TodoListService todoListService;

	public AuthService(
			AppUserRepository userRepository,
			PasswordEncoder passwordEncoder,
			JwtService jwtService,
			TodoListService todoListService) {
		this.userRepository = userRepository;
		this.passwordEncoder = passwordEncoder;
		this.jwtService = jwtService;
		this.todoListService = todoListService;
	}

	@Transactional
	public AuthResponse register(RegisterRequest request) {
		String username = normalizeUsername(request.username());

		if (userRepository.existsByUsername(username)) {
			throw new ResponseStatusException(HttpStatus.CONFLICT, "Benutzer existiert bereits");
		}

		AppUser user = new AppUser();
		user.setUsername(username);
		user.setPasswordHash(passwordEncoder.encode(request.password()));
		user.setRole(ApplicationRole.USER);

		AppUser savedUser = userRepository.save(user);
		todoListService.createDefaultList(savedUser);

		return createAuthResponse(savedUser);
	}

	@Transactional(readOnly = true)
	public AuthResponse login(LoginRequest request) {
		String username = normalizeUsername(request.username());
		AppUser user = userRepository.findByUsername(username)
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Anmeldung fehlgeschlagen"));

		if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
			throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Anmeldung fehlgeschlagen");
		}

		return createAuthResponse(user);
	}

	private AuthResponse createAuthResponse(AppUser user) {
		AuthenticatedUser authenticatedUser = new AuthenticatedUser(user);
		String token = jwtService.createToken(authenticatedUser);

		return AuthResponse.bearer(token, user.getId(), user.getUsername());
	}

	private String normalizeUsername(String username) {
		return username.trim().toLowerCase();
	}
}
