package com.example.demo.security;

import java.io.IOException;

import org.springframework.http.MediaType;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import io.jsonwebtoken.JwtException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

	private final JwtService jwtService;
	private final CustomUserDetailsService userDetailsService;
	private final KeycloakJwtService keycloakJwtService;

	public JwtAuthenticationFilter(
			JwtService jwtService,
			CustomUserDetailsService userDetailsService,
			KeycloakJwtService keycloakJwtService) {
		this.jwtService = jwtService;
		this.userDetailsService = userDetailsService;
		this.keycloakJwtService = keycloakJwtService;
	}

	@Override
	protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
			throws ServletException, IOException {
		String authorizationHeader = request.getHeader("Authorization");

		if (authorizationHeader == null || !authorizationHeader.startsWith("Bearer ")) {
			filterChain.doFilter(request, response);
			return;
		}

		String token = authorizationHeader.substring(7);

		try {
			AuthenticatedUser authenticatedUser = authenticate(token);

			if (authenticatedUser != null && SecurityContextHolder.getContext().getAuthentication() == null) {
				UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
						authenticatedUser,
						null,
						authenticatedUser.getAuthorities());
				authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
				SecurityContextHolder.getContext().setAuthentication(authentication);
			}
		} catch (JwtException
				| org.springframework.security.oauth2.jwt.JwtException
				| IllegalArgumentException
				| UsernameNotFoundException exception) {
			response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
			response.setContentType(MediaType.APPLICATION_JSON_VALUE);
			response.getWriter().write("{\"message\":\"Token ungültig\"}");
			return;
		}

		filterChain.doFilter(request, response);
	}

	private AuthenticatedUser authenticate(String token) {
		try {
			String username = jwtService.extractUsername(token);

			if (username == null) {
				return null;
			}

			UserDetails userDetails = userDetailsService.loadUserByUsername(username);

			if (userDetails instanceof AuthenticatedUser authenticatedUser
					&& jwtService.isValidForUser(token, authenticatedUser)) {
				return authenticatedUser;
			}
		} catch (JwtException | IllegalArgumentException | UsernameNotFoundException exception) {
			return keycloakJwtService.authenticate(token);
		}

		return null;
	}
}
