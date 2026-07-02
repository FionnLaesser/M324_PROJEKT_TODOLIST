package com.example.demo.security;

import java.util.List;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.core.DelegatingOAuth2TokenValidator;
import org.springframework.security.oauth2.core.OAuth2Error;
import org.springframework.security.oauth2.core.OAuth2TokenValidator;
import org.springframework.security.oauth2.core.OAuth2TokenValidatorResult;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtValidators;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.demo.model.AppUser;
import com.example.demo.model.ApplicationRole;
import com.example.demo.repository.AppUserRepository;
import com.example.demo.service.TodoListService;

@Service
public class KeycloakJwtService {

	private final JwtDecoder jwtDecoder;
	private final String clientId;
	private final AppUserRepository userRepository;
	private final PasswordEncoder passwordEncoder;
	private final TodoListService todoListService;

	public KeycloakJwtService(
			@Value("${app.keycloak.issuer-uri}") String issuerUri,
			@Value("${app.keycloak.jwk-set-uri}") String jwkSetUri,
			@Value("${app.keycloak.client-id}") String clientId,
			AppUserRepository userRepository,
			PasswordEncoder passwordEncoder,
			TodoListService todoListService) {
		NimbusJwtDecoder decoder = NimbusJwtDecoder.withJwkSetUri(jwkSetUri).build();
		decoder.setJwtValidator(createValidator(issuerUri, clientId));

		this.jwtDecoder = decoder;
		this.clientId = clientId;
		this.userRepository = userRepository;
		this.passwordEncoder = passwordEncoder;
		this.todoListService = todoListService;
	}

	@Transactional
	public AuthenticatedUser authenticate(String token) {
		Jwt jwt = jwtDecoder.decode(token);
		String username = resolveUsername(jwt);
		AppUser user = userRepository.findByUsername(username)
				.orElseGet(() -> createUser(username));

		return new AuthenticatedUser(user);
	}

	private OAuth2TokenValidator<Jwt> createValidator(String issuerUri, String clientId) {
		OAuth2TokenValidator<Jwt> issuerValidator = JwtValidators.createDefaultWithIssuer(issuerUri);
		OAuth2TokenValidator<Jwt> clientValidator = jwt -> {
			String authorizedParty = jwt.getClaimAsString("azp");
			List<String> audience = jwt.getAudience();

			if (clientId.equals(authorizedParty) || audience.contains(clientId)) {
				return OAuth2TokenValidatorResult.success();
			}

			OAuth2Error error = new OAuth2Error(
					"invalid_token",
					"Token passt nicht zum Keycloak Client " + clientId,
					null);
			return OAuth2TokenValidatorResult.failure(error);
		};

		return new DelegatingOAuth2TokenValidator<>(issuerValidator, clientValidator);
	}

	private AppUser createUser(String username) {
		AppUser user = new AppUser();
		user.setUsername(username);
		user.setPasswordHash(passwordEncoder.encode("keycloak:" + username + ":" + clientId));
		user.setRole(ApplicationRole.USER);

		AppUser savedUser = userRepository.save(user);
		todoListService.createDefaultList(savedUser);

		return savedUser;
	}

	private String resolveUsername(Jwt jwt) {
		String username = jwt.getClaimAsString("preferred_username");

		if (username == null || username.isBlank()) {
			username = jwt.getSubject();
		}

		return username.trim().toLowerCase();
	}
}
