package com.example.demo.security;

import java.io.IOException;
import java.time.Instant;

import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Component
@Order(Ordered.HIGHEST_PRECEDENCE)
public class ApiVersionFilter extends OncePerRequestFilter {

	public static final String API_VERSION_HEADER = "X-API-Version";
	public static final String SUPPORTED_API_VERSION = "1";

	@Override
	protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
			throws ServletException, IOException {
		if (!isApiRequest(request) || HttpMethod.OPTIONS.matches(request.getMethod())) {
			filterChain.doFilter(request, response);
			return;
		}

		String apiVersion = request.getHeader(API_VERSION_HEADER);

		if (SUPPORTED_API_VERSION.equals(apiVersion)) {
			filterChain.doFilter(request, response);
			return;
		}

		response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
		response.setContentType(MediaType.APPLICATION_JSON_VALUE);
		response.setCharacterEncoding("UTF-8");
		response.getWriter().write("""
				{"timestamp":"%s","status":400,"message":"API-Version fehlt oder wird nicht unterstützt","details":["Header X-API-Version: 1 mitsenden"]}
				""".formatted(Instant.now()));
	}

	private boolean isApiRequest(HttpServletRequest request) {
		String path = request.getRequestURI();
		return path.equals("/api") || path.startsWith("/api/");
	}
}
