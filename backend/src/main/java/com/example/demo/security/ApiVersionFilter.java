package com.example.demo.security;

import java.io.IOException;
import java.util.List;
import java.util.Set;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import com.example.demo.dto.ApiErrorResponse;
import com.fasterxml.jackson.databind.ObjectMapper;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Component
@Order(Ordered.HIGHEST_PRECEDENCE)
public class ApiVersionFilter extends OncePerRequestFilter {

	public static final String API_VERSION_HEADER = "X-API-Version";
	public static final String API_VERSION_1 = "1";
	public static final String API_VERSION_2 = "2";
	public static final String VERSION_1_HEADER = API_VERSION_HEADER + "=" + API_VERSION_1;
	public static final String VERSION_2_HEADER = API_VERSION_HEADER + "=" + API_VERSION_2;

	private static final Set<String> SUPPORTED_API_VERSIONS = Set.of(API_VERSION_1, API_VERSION_2);

	private final ObjectMapper objectMapper;

	@Autowired
	public ApiVersionFilter(ObjectMapper objectMapper) {
		this.objectMapper = objectMapper;
	}

	@Override
	protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
			throws ServletException, IOException {
		if (!isApiRequest(request) || HttpMethod.OPTIONS.matches(request.getMethod())) {
			filterChain.doFilter(request, response);
			return;
		}

		String apiVersion = request.getHeader(API_VERSION_HEADER);

		if (apiVersion != null && SUPPORTED_API_VERSIONS.contains(apiVersion)) {
			filterChain.doFilter(request, response);
			return;
		}

		response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
		response.setContentType(MediaType.APPLICATION_JSON_VALUE);
		response.setCharacterEncoding("UTF-8");
		objectMapper.writeValue(response.getWriter(), ApiErrorResponse.of(
				HttpServletResponse.SC_BAD_REQUEST,
				"API-Version fehlt oder wird nicht unterstützt",
				List.of("Header X-API-Version: 1 oder 2 mitsenden")));
	}

	private boolean isApiRequest(HttpServletRequest request) {
		String path = request.getRequestURI();
		return path.equals("/api") || path.startsWith("/api/");
	}
}
