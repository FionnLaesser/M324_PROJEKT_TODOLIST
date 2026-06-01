package com.example.demo.security;

import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Date;

import javax.crypto.SecretKey;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import jakarta.annotation.PostConstruct;

@Service
public class JwtService {

	private final String secret;
	private final long expirationMinutes;
	private SecretKey key;

	public JwtService(
			@Value("${app.jwt.secret}") String secret,
			@Value("${app.jwt.expiration-minutes}") long expirationMinutes) {
		this.secret = secret;
		this.expirationMinutes = expirationMinutes;
	}

	@PostConstruct
	void validateAndCreateKey() {
		if (secret == null || secret.isBlank() || secret.getBytes(StandardCharsets.UTF_8).length < 32) {
			throw new IllegalStateException("JWT_SECRET muss mindestens 32 Bytes haben");
		}
		key = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
	}

	public String createToken(AuthenticatedUser user) {
		Instant now = Instant.now();
		Instant expiresAt = now.plus(expirationMinutes, ChronoUnit.MINUTES);

		return Jwts.builder()
				.subject(user.getUsername())
				.claim("userId", user.getId())
				.issuedAt(Date.from(now))
				.expiration(Date.from(expiresAt))
				.signWith(key)
				.compact();
	}

	public Claims parseClaims(String token) {
		return Jwts.parser()
				.verifyWith(key)
				.build()
				.parseSignedClaims(token)
				.getPayload();
	}

	public String extractUsername(String token) {
		return parseClaims(token).getSubject();
	}

	public boolean isValidForUser(String token, AuthenticatedUser user) {
		Claims claims = parseClaims(token);
		Number tokenUserId = claims.get("userId", Number.class);

		return user.getUsername().equals(claims.getSubject())
				&& tokenUserId != null
				&& user.getId().equals(tokenUserId.longValue())
				&& claims.getExpiration().after(new Date());
	}
}
